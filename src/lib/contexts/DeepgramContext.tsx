"use client";

import {
  createClient,
  LiveClient,
  SOCKET_STATES,
  LiveTranscriptionEvents,
  type LiveSchema,
  type LiveTranscriptionEvent,
} from "@deepgram/sdk";

import { createContext, useContext, useState, ReactNode, FunctionComponent, useRef, useEffect } from "react";

interface DeepgramContextType {
  connectToDeepgram: () => Promise<void>;
  disconnectFromDeepgram: () => void;
  connectionState: SOCKET_STATES;
  realtimeTranscript: string;
  error: string | null;
  isDeepgramAvailable: boolean;
}

const DeepgramContext = createContext<DeepgramContextType | undefined>(undefined);

interface DeepgramContextProviderProps {
  children: ReactNode;
}

const getApiKey = async (): Promise<string | null> => {
  try {
    const response = await fetch("/api/deepgram", { 
      cache: "no-store",
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`);
    }

    const result = await response.json();
    
    // Check if API key is valid (not empty)
    if (!result.key) {
      console.error("Deepgram API key is empty or invalid");
      return null;
    }

    return result.key;
  } catch (error) {
    console.error("Error fetching Deepgram API key:", error);
    return null;
  }
};

const DeepgramContextProvider: FunctionComponent<DeepgramContextProviderProps> = ({ children }) => {
  const [connection, setConnection] = useState<WebSocket | null>(null);
  const [connectionState, setConnectionState] = useState<SOCKET_STATES>(SOCKET_STATES.closed);
  const [realtimeTranscript, setRealtimeTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isDeepgramAvailable, setIsDeepgramAvailable] = useState(true);
  const audioRef = useRef<MediaRecorder | null>(null);

  // Check if Deepgram API is available
  useEffect(() => {
    const checkDeepgramAvailability = async () => {
      try {
        const apiKey = await getApiKey();
        setIsDeepgramAvailable(Boolean(apiKey));
        if (!apiKey) {
          setError("Deepgram API key is not available or invalid");
        }
      } catch (error) {
        console.error("Error checking Deepgram availability:", error);
        setIsDeepgramAvailable(false);
        setError("Failed to connect to Deepgram API");
      }
    };

    checkDeepgramAvailability();
  }, []);

  const connectToDeepgram = async () => {
    if (!isDeepgramAvailable) {
      setError("Deepgram API is not available");
      return;
    }

    try {
      setError(null);
      setRealtimeTranscript("");

      // Check for microphone access
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Browser doesn't support audio recording");
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioRef.current = new MediaRecorder(stream);

      const apiKey = await getApiKey();
      if (!apiKey) {
        throw new Error("Could not retrieve Deepgram API key");
      }

      console.log("Opening WebSocket connection...");
      const socket = new WebSocket("wss://api.deepgram.com/v1/listen", ["token", apiKey]);

      socket.onopen = () => {
        setConnectionState(SOCKET_STATES.open);
        console.log("WebSocket connection opened");
        audioRef.current!.addEventListener("dataavailable", (event) => {
          if (event.data.size > 0 && socket.readyState === WebSocket.OPEN) {
            socket.send(event.data);
          }
        });

        audioRef.current!.start(250);
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.channel && data.channel.alternatives && data.channel.alternatives[0]) {
            const newTranscript = data.channel.alternatives[0].transcript;
            if (newTranscript) {
              setRealtimeTranscript((prev) => prev + " " + newTranscript);
            }
          }
        } catch (error) {
          console.error("Error processing message:", error);
        }
      };

      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
        setError("Error connecting to Deepgram. Please try again.");
        disconnectFromDeepgram();
      };

      socket.onclose = (event) => {
        setConnectionState(SOCKET_STATES.closed);
        console.log("WebSocket connection closed:", event.code, event.reason);
      };

      setConnection(socket);
    } catch (error) {
      console.error("Error starting voice recognition:", error);
      setError(error instanceof Error ? error.message : "An unknown error occurred");
      setConnectionState(SOCKET_STATES.closed);
    }
  };

  const disconnectFromDeepgram = () => {
    if (connection) {
      connection.close();
      setConnection(null);
    }
    if (audioRef.current) {
      audioRef.current.stop();
      // Release microphone access
      const tracks = audioRef.current.stream.getTracks();
      tracks.forEach(track => track.stop());
    }
    setRealtimeTranscript("");
    setConnectionState(SOCKET_STATES.closed);
  };

  return (
    <DeepgramContext.Provider
      value={{
        connectToDeepgram,
        disconnectFromDeepgram,
        connectionState,
        realtimeTranscript,
        error,
        isDeepgramAvailable,
      }}
    >
      {children}
    </DeepgramContext.Provider>
  );
};

// Use the useDeepgram hook to access the deepgram context and use the deepgram in any component.
// This allows you to connect to the deepgram and disconnect from the deepgram via a socket.
// Make sure to wrap your application in a DeepgramContextProvider to use the deepgram.
function useDeepgram(): DeepgramContextType {
  const context = useContext(DeepgramContext);
  if (context === undefined) {
    throw new Error("useDeepgram must be used within a DeepgramContextProvider");
  }
  return context;
}

export {
  DeepgramContextProvider,
  useDeepgram,
  SOCKET_STATES,
  LiveTranscriptionEvents,
  type LiveTranscriptionEvent,
};
