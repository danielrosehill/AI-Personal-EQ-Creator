
import React, { useState, useRef, useCallback, useEffect } from 'react';

interface AudioInputProps {
  onAudioSubmit: (blob: Blob, mimeType: string) => void;
  isProcessing: boolean;
}

const MicrophoneIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
);

const UploadIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);


export const AudioInput: React.FC<AudioInputProps> = ({ onAudioSubmit, isProcessing }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [mimeType, setMimeType] = useState<string>('audio/webm');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [recordTime, setRecordTime] = useState(0);
  const timerIntervalRef = useRef<number | null>(null);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  useEffect(() => {
    return () => {
      if(timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  }, []);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsRecording(true);
      setAudioURL(null);
      setAudioBlob(null);
      
      let options = { mimeType: 'audio/webm' };
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        options = { mimeType: 'audio/mp4' }; 
      }
      setMimeType(options.mimeType);

      mediaRecorderRef.current = new MediaRecorder(stream, options);
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: options.mimeType });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioURL(url);
        audioChunksRef.current = [];
        stream.getTracks().forEach(track => track.stop()); // Stop microphone access
      };
      mediaRecorderRef.current.start();
      setRecordTime(0);
      timerIntervalRef.current = window.setInterval(() => {
        setRecordTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone. Please check your browser permissions.");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  };
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      const url = URL.createObjectURL(file);
      setAudioBlob(file);
      setMimeType(file.type);
      setAudioURL(url);
    } else {
        alert("Please upload a valid audio file.");
    }
  };
  
  const handleSubmit = () => {
      if(audioBlob) {
          onAudioSubmit(audioBlob, mimeType);
      }
  };
  
  const handleReset = () => {
    setAudioBlob(null);
    setAudioURL(null);
    setIsRecording(false);
    setRecordTime(0);
    if(mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
    }
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
  };


  return (
    <div className="p-6 md:p-8 space-y-6">
        <div>
            <h2 className="text-2xl font-semibold text-center text-gray-100">Submit Your Voice Sample</h2>
            <p className="text-center text-gray-400 mt-2">Record up to 3 minutes of audio or upload a file.</p>
        </div>
      <div className="flex flex-col md:flex-row items-center justify-center gap-4">
        {isRecording ? (
          <button
            onClick={handleStopRecording}
            className="w-full md:w-auto flex-1 flex items-center justify-center gap-3 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
            Stop Recording ({formatTime(recordTime)})
          </button>
        ) : (
          <button
            onClick={handleStartRecording}
            disabled={!!audioBlob}
            className="w-full md:w-auto flex-1 flex items-center justify-center gap-3 px-6 py-3 bg-brand-blue text-white font-semibold rounded-lg hover:bg-opacity-80 transition-all disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            <MicrophoneIcon className="w-6 h-6"/>
            Record Voice
          </button>
        )}
        <span className="text-gray-500">OR</span>
        <label className={`w-full md:w-auto flex-1 flex items-center justify-center gap-3 px-6 py-3 bg-gray-700 text-white font-semibold rounded-lg transition-colors ${!!audioBlob ? 'cursor-not-allowed bg-gray-600' : 'cursor-pointer hover:bg-gray-600'}`}>
          <UploadIcon className="w-6 h-6"/>
          Upload File
          <input type="file" accept="audio/*" className="hidden" onChange={handleFileUpload} disabled={isRecording || !!audioBlob} />
        </label>
      </div>
      
      {audioURL && (
        <div className="mt-6 p-4 bg-gray-900/50 rounded-lg flex flex-col items-center gap-4">
          <p className="font-semibold">Your Audio Sample:</p>
          <audio controls src={audioURL} className="w-full max-w-md"></audio>
          <div className="flex gap-4 mt-2">
            <button
                onClick={handleSubmit}
                disabled={isProcessing}
                className="px-8 py-2 bg-gradient-to-r from-brand-blue to-brand-purple text-white font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-wait"
            >
                {isProcessing ? 'Processing...' : 'Generate EQ'}
            </button>
             <button
                onClick={handleReset}
                disabled={isProcessing}
                className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500 transition-colors disabled:opacity-50"
            >
                Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
