import React, { useState, useCallback } from 'react';
import { AudioInput } from './components/AudioInput';
import { ResultsView } from './components/ResultsView';
import { analyzeAudio } from './services/geminiService';
import type { VocalProfile, EQSetting } from './types';

type Status = 'idle' | 'processing' | 'success' | 'error';

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      } else {
        reject(new Error('Failed to convert blob to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const Header: React.FC = () => (
  <header className="py-4 px-6 text-center">
    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-blue to-brand-purple">
      EQ Template Creator
    </h1>
    <p className="mt-2 text-lg text-gray-400">Your Personal AI Audio Engineer</p>
  </header>
);

const Loader: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex flex-col items-center justify-center space-y-4 p-8">
    <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-brand-blue"></div>
    <p className="text-lg text-gray-300">{message}</p>
  </div>
);

export default function App() {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [vocalProfile, setVocalProfile] = useState<VocalProfile | null>(null);
  const [eqSettings, setEqSettings] = useState<EQSetting[] | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audacityXml, setAudacityXml] = useState<string | null>(null);

  const handleAudioSubmit = useCallback(async (blob: Blob, mimeType: string) => {
    setStatus('processing');
    setError(null);
    setAudioBlob(blob);

    try {
      const base64Audio = await blobToBase64(blob);
      const result = await analyzeAudio(base64Audio, mimeType);
      
      setVocalProfile(result.vocalProfile);
      setEqSettings(result.eqPreset);
      setAudacityXml(result.audacityXml);
      setStatus('success');
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred during analysis.');
      setStatus('error');
    }
  }, []);
  
  const handleReset = () => {
    setStatus('idle');
    setError(null);
    setVocalProfile(null);
    setEqSettings(null);
    setAudioBlob(null);
    setAudacityXml(null);
  };

  const renderContent = () => {
    switch (status) {
      case 'processing':
        return <Loader message="Gemini is analyzing your voice... this may take a moment." />;
      case 'success':
        return vocalProfile && eqSettings && audioBlob && audacityXml && (
            <ResultsView 
                vocalProfile={vocalProfile} 
                eqSettings={eqSettings}
                audioBlob={audioBlob}
                audacityXml={audacityXml}
                onReset={handleReset} 
            />
        );
      case 'error':
        return (
          <div className="text-center p-8 bg-red-900/20 rounded-lg border border-red-500">
            <h3 className="text-2xl font-bold text-red-400">Analysis Failed</h3>
            <p className="mt-2 text-red-300">{error}</p>
            <button
              onClick={handleReset}
              className="mt-6 px-6 py-2 bg-brand-blue text-white font-semibold rounded-lg hover:bg-opacity-80 transition-all"
            >
              Try Again
            </button>
          </div>
        );
      case 'idle':
      default:
        return <AudioInput onAudioSubmit={handleAudioSubmit} isProcessing={status === 'processing'}/>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <main className="w-full max-w-4xl mx-auto">
        <Header />
        <div className="mt-8 bg-gray-800/50 rounded-2xl shadow-2xl backdrop-blur-sm border border-gray-700">
          {renderContent()}
        </div>
        <footer className="text-center mt-8 text-gray-500 text-sm">
          <p>Powered by Google Gemini. For demonstration purposes only.</p>
        </footer>
      </main>
    </div>
  );
}