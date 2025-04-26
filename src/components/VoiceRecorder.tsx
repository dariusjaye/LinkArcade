'use client';

import { useState, useEffect } from 'react';
import { useDeepgram } from '../lib/contexts/DeepgramContext';
import { addDocument } from '../lib/firebase/firebaseUtils';
import { motion } from 'framer-motion';
import firebase from '../lib/firebase/firebase';

export default function VoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);
  const { 
    connectToDeepgram, 
    disconnectFromDeepgram, 
    connectionState, 
    realtimeTranscript,
    error: deepgramError,
    isDeepgramAvailable 
  } = useDeepgram();

  // Reset recording state if Deepgram becomes unavailable
  useEffect(() => {
    if (!isDeepgramAvailable && isRecording) {
      setIsRecording(false);
    }
  }, [isDeepgramAvailable, isRecording]);

  const handleStartRecording = async () => {
    setSaveStatus('idle');
    setSaveError(null);
    
    if (!isDeepgramAvailable) {
      setSaveError('Voice recording is not available');
      return;
    }
    
    try {
      await connectToDeepgram();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      setSaveError(error instanceof Error ? error.message : 'Could not start recording');
    }
  };

  const handleStopRecording = async () => {
    disconnectFromDeepgram();
    setIsRecording(false);
    
    // Save the note to Firebase if we have a transcript and Firebase is available
    if (realtimeTranscript && firebase.safeDb) {
      try {
        setSaveStatus('saving');
        await addDocument('notes', {
          text: realtimeTranscript,
          timestamp: new Date().toISOString(),
        });
        setSaveStatus('success');
      } catch (error) {
        console.error('Error saving transcript:', error);
        setSaveStatus('error');
        setSaveError(error instanceof Error ? error.message : 'Failed to save note');
      }
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Service status message */}
      {!isDeepgramAvailable && (
        <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded-md">
          Voice recognition service is currently unavailable. Please try again later.
        </div>
      )}
      
      {/* Error message */}
      {(deepgramError || saveError) && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md">
          {deepgramError || saveError}
        </div>
      )}
      
      <button
        onClick={isRecording ? handleStopRecording : handleStartRecording}
        disabled={!isDeepgramAvailable}
        className={`w-full py-2 px-4 rounded-full ${
          !isDeepgramAvailable 
            ? 'bg-gray-400 cursor-not-allowed' 
            : isRecording 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-blue-500 hover:bg-blue-600'
        } text-white font-bold`}
      >
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>
      
      {isRecording && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-8 h-8 bg-blue-500 rounded-full mx-auto mb-4"
          />
          <p className="text-sm text-gray-600">{realtimeTranscript || 'Listening...'}</p>
        </div>
      )}
      
      {saveStatus === 'saving' && (
        <div className="mt-2 text-sm text-gray-600">
          Saving note...
        </div>
      )}
      
      {saveStatus === 'success' && (
        <div className="mt-2 text-sm text-green-600">
          Note saved successfully!
        </div>
      )}
      
      {saveStatus === 'error' && (
        <div className="mt-2 text-sm text-red-600">
          Failed to save note.
        </div>
      )}
    </div>
  );
}