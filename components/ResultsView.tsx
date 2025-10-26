import React, { useEffect, useRef } from 'react';
import type { VocalProfile, EQSetting } from '../types';

// Let TypeScript know D3 is available on the global scope
declare const d3: any;

interface ResultsViewProps {
  vocalProfile: VocalProfile;
  eqSettings: EQSetting[];
  audioBlob: Blob;
  audacityXml: string;
  onReset: () => void;
}

const FrequencyVisualizer: React.FC<{ audioBlob: Blob; eqSettings: EQSetting[] }> = ({ audioBlob, eqSettings }) => {
    const d3Container = useRef<SVGSVGElement | null>(null);
    
    useEffect(() => {
        if (!audioBlob || !d3Container.current) return;
        let audioContext: AudioContext | null = null;

        const processAudio = async () => {
            audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const arrayBuffer = await audioBlob.arrayBuffer();
            let audioBuffer;
            try {
                audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            } catch (e) {
                console.error("Error decoding audio data:", e);
                drawChart(new Uint8Array(0), 0, "Error decoding audio file.");
                if (audioContext) audioContext.close();
                return;
            }

            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;

            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 2048;

            source.connect(analyser);
            // Not connecting to destination to play silently

            source.start(0, Math.min(0.1, audioBuffer.duration), 5); // Start at 0.1s, play for 5s max

            setTimeout(() => {
                if(!audioContext || audioContext.state === 'closed') return;

                const bufferLength = analyser.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);
                analyser.getByteFrequencyData(dataArray);

                source.stop();
                if (dataArray.some(d => d > 0)) {
                    drawChart(dataArray, audioBuffer.sampleRate);
                } else {
                    console.warn("Analyser returned no frequency data. The audio might be silent at the snapshot point.");
                    drawChart(new Uint8Array(0), 0, "Could not visualize audio: sample may be silent.");
                }
                audioContext.close();
            }, 100); // Take snapshot after 100ms
        };
        
        const drawChart = (dataArray: Uint8Array, sampleRate: number, message?: string) => {
            const svg = d3.select(d3Container.current);
            svg.selectAll("*").remove();

            const svgNode = d3Container.current;
            if (!svgNode) return;

            const { width: containerWidth, height: containerHeight } = svgNode.getBoundingClientRect();

            const margin = { top: 20, right: 20, bottom: 40, left: 50 };
            const width = containerWidth - margin.left - margin.right;
            const height = containerHeight - margin.top - margin.bottom;

            if (width <= 0 || height <= 0) return;

            const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
            
            const x = d3.scaleLog().domain([20, 20000]).range([0, width]);
            const y = d3.scaleLinear().domain([0, 255]).range([height, 0]);

            g.append("g")
                .attr("transform", `translate(0,${height})`)
                .call(d3.axisBottom(x).ticks(5, ".0s").tickSizeOuter(0))
                .selectAll("text")
                .style("fill", "#9ca3af");

            g.append("g")
                .call(d3.axisLeft(y).ticks(5).tickSizeOuter(0))
                .selectAll("text")
                .style("fill", "#9ca3af");
                
            g.append("text")
             .attr("text-anchor", "middle")
             .attr("x", width/2)
             .attr("y", height + margin.bottom - 5)
             .style("fill", "#9ca3af")
             .text("Frequency (Hz)");

            g.append("text")
             .attr("text-anchor", "middle")
             .attr("transform", "rotate(-90)")
             .attr("y", -margin.left + 15)
             .attr("x", -height/2)
             .style("fill", "#9ca3af")
             .text("Amplitude");
            
            if (dataArray.length === 0 || !sampleRate) {
                g.append("text")
                 .attr("x", width / 2)
                 .attr("y", height / 2)
                 .attr("text-anchor", "middle")
                 .style("fill", "#e5e7eb")
                 .text(message || "No audio data to display.");
                return;
            }

            const data = Array.from(dataArray).map((d, i) => ({
                frequency: (i * sampleRate) / (2 * dataArray.length),
                amplitude: d,
            })).filter(d => d.frequency >= 20 && d.frequency <= 20000);

            const barWidth = width / data.length;

            g.selectAll(".bar")
                .data(data)
                .enter()
                .append("rect")
                .attr("class", "bar")
                .attr("x", d => x(d.frequency))
                .attr("y", d => y(d.amplitude))
                .attr("width", barWidth > 0 ? barWidth : 1)
                .attr("height", d => height - y(d.amplitude))
                .attr("fill", d => {
                    const closestEq = eqSettings.find(eq => Math.abs(Math.log10(eq.frequency) - Math.log10(d.frequency)) < 0.1);
                    if(closestEq) {
                        return closestEq.gain > 0 ? '#22c55e' : '#ef4444';
                    }
                    return '#00BFFF';
                });
        };

        processAudio().catch(console.error);

        return () => {
            if (audioContext && audioContext.state !== 'closed') {
                audioContext.close();
            }
        };
    }, [audioBlob, eqSettings]);

    return (
        <div className="bg-gray-900/50 p-4 rounded-lg">
             <h3 className="text-xl font-semibold mb-2 text-gray-200">Vocal Frequency Snapshot</h3>
            <svg ref={d3Container} className="w-full h-64 md:h-80"></svg>
        </div>
    );
};


export const ResultsView: React.FC<ResultsViewProps> = ({ vocalProfile, eqSettings, audioBlob, audacityXml, onReset }) => {
    const handleCopyJson = () => {
        navigator.clipboard.writeText(JSON.stringify({ vocalProfile, eqSettings }, null, 2));
        alert("EQ settings copied to clipboard as JSON!");
    };

    const handleDownloadXml = () => {
        const blob = new Blob([audacityXml], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'gemini-eq-preset.xml';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
    
    return (
        <div className="p-6 md:p-8 space-y-8 animate-fade-in">
            <div>
                <h2 className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-brand-blue to-brand-purple">Analysis Complete</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div>
                        <h3 className="text-xl font-semibold mb-2 text-gray-200">Vocal Profile</h3>
                        <p className="text-gray-300 bg-gray-900/50 p-4 rounded-lg">{vocalProfile.description}</p>
                    </div>
                     <div>
                        <h3 className="text-xl font-semibold mb-2 text-gray-200">Key Characteristics</h3>
                        <ul className="list-disc list-inside bg-gray-900/50 p-4 rounded-lg text-gray-300 space-y-1">
                            <li><strong>Fundamental Range:</strong> {vocalProfile.fundamentalRange}</li>
                            {vocalProfile.keyCharacteristics.map((char, i) => (
                                <li key={i}>{char}</li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <h3 className="text-xl font-semibold mb-2 text-gray-200">Generated EQ Preset</h3>
                        <div className="bg-gray-900/50 p-4 rounded-lg">
                            <table className="w-full text-left">
                                <thead className="border-b border-gray-600">
                                    <tr>
                                        <th className="py-2 px-2">Frequency</th>
                                        <th className="py-2 px-2">Gain (dB)</th>
                                        <th className="py-2 px-2">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {eqSettings.map(({ frequency, gain }, i) => (
                                        <tr key={i} className="border-b border-gray-700 last:border-0">
                                            <td className="py-2 px-2">{frequency} Hz</td>
                                            <td className={`py-2 px-2 font-mono ${gain > 0 ? 'text-green-400' : gain < 0 ? 'text-red-400' : 'text-gray-300'}`}>
                                                {gain > 0 ? '+' : ''}{gain.toFixed(1)}
                                            </td>
                                            <td className="py-2 px-2">
                                                 <span className={`px-2 py-1 text-xs rounded-full ${gain > 0.1 ? 'bg-green-800/50 text-green-300' : gain < -0.1 ? 'bg-red-800/50 text-red-300' : 'bg-gray-600 text-gray-300'}`}>
                                                    {gain > 0.1 ? 'Boost' : gain < -0.1 ? 'Cut' : 'Neutral'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <FrequencyVisualizer audioBlob={audioBlob} eqSettings={eqSettings} />
            
            <div className="flex flex-wrap justify-center gap-4 pt-6">
                <button
                    onClick={onReset}
                    className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500 transition-colors"
                >
                    Analyze Another
                </button>
                 <button
                    onClick={handleDownloadXml}
                    className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                >
                    Download Audacity XML
                </button>
                 <button
                    onClick={handleCopyJson}
                    className="px-6 py-2 bg-brand-blue text-white font-semibold rounded-lg hover:bg-opacity-80 transition-opacity"
                >
                    Copy as JSON
                </button>
            </div>
        </div>
    );
};