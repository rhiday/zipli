import React, { useState, useRef, useEffect } from 'react';
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { useNavigate } from "react-router-dom";
import { Layout } from "../../components/Layout";
import { Mic, MicOff, Plus, Minus } from 'lucide-react';
import { Switch } from "../../components/ui/switch";
import { transcribeAudio, summarizeText } from '../../lib/openai';
import RecordRTC from 'recordrtc';
import hark from 'hark';

export const VoiceInput = (): JSX.Element => {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [description, setDescription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isUnder60C, setIsUnder60C] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recorderRef = useRef<RecordRTC | null>(null);
  const speechRecognitionRef = useRef<SpeechRecognition | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      speechRecognitionRef.current = new SpeechRecognition();
      speechRecognitionRef.current.continuous = true;
      speechRecognitionRef.current.interimResults = true;

      speechRecognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setError('Speech recognition error. Please try again.');
      };
    }

    return () => {
      cleanup();
    };
  }, []);

  const cleanup = () => {
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (recordingTimerRef.current) {
      clearTimeout(recordingTimerRef.current);
    }
  };

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: 16000
        }
      });
      
      streamRef.current = stream;
      audioContextRef.current = new AudioContext();

      // Setup audio processing
      const source = audioContextRef.current.createMediaStreamSource(stream);
      const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
      
      source.connect(processor);
      processor.connect(audioContextRef.current.destination);

      // Setup speech detection
      const speechEvents = hark(stream, {
        threshold: -65,
        interval: 100
      });

      speechEvents.on('speaking', () => {
        console.log('Speaking detected');
      });

      speechEvents.on('stopped_speaking', () => {
        console.log('Stopped speaking');
      });

      // Initialize recorder with optimized settings
      recorderRef.current = new RecordRTC(stream, {
        type: 'audio',
        mimeType: 'audio/webm',
        recorderType: RecordRTC.StereoAudioRecorder,
        numberOfAudioChannels: 1,
        desiredSampRate: 16000,
        timeSlice: 1000,
        ondataavailable: (blob: Blob) => {
          console.log('Recording data available:', blob.size);
        }
      });

      recorderRef.current.startRecording();
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.start();
      }

      setIsRecording(true);
      setDescription("");
      setButtonDisabled(false);

      // Auto-stop recording after 60 seconds
      recordingTimerRef.current = setTimeout(() => {
        stopRecording();
      }, 60000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      setError('Unable to access microphone. Please check your browser permissions.');
      setButtonDisabled(false);
    }
  };

  const stopRecording = async () => {
    if (recorderRef.current && isRecording) {
      setButtonDisabled(true);
      cleanup();

      recorderRef.current.stopRecording(async () => {
        try {
          const blob = recorderRef.current?.getBlob();
          console.log('Recording stopped, blob size:', blob?.size);
          
          if (blob && blob.size > 0) {
            setIsProcessing(true);
            console.log('Starting transcription...');
            const transcript = await transcribeAudio(blob);
            console.log('Transcription received:', transcript);
            
            if (transcript) {
              console.log('Starting summarization...');
              const summary = await summarizeText(transcript);
              console.log('Summary received:', summary);
              setDescription(summary);
            }
          } else {
            setError('No audio data recorded. Please try again.');
          }
        } catch (error) {
          console.error('Error processing audio:', error);
          setError('Error processing audio. Please try again.');
        } finally {
          setIsProcessing(false);
          setButtonDisabled(false);
        }
      });

      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleContinue = () => {
    navigate('/new-donation/step2', { 
      state: { 
        description,
        quantity,
        isUnder60C
      } 
    });
  };

  return (
    <Layout>
      <div className="p-6">
        <header className="mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="text-2xl"
              aria-label="Go back"
            >
              ←
            </button>
            <h1 className="text-2xl font-medium">Input Manually</h1>
          </div>
        </header>

        <div className="flex gap-2 mb-8">
          <div className="h-1 bg-[#085f33] flex-1 rounded-full"></div>
          <div className="h-1 bg-[#e2e8f0] flex-1 rounded-full"></div>
          <div className="h-1 bg-[#e2e8f0] flex-1 rounded-full"></div>
          <div className="h-1 bg-[#e2e8f0] flex-1 rounded-full"></div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-medium mb-2">Describe your donation</h2>
          <p className="text-gray-600 mb-6">Press the microphone button and list your food items</p>

          <Card className="bg-white border border-gray-300 rounded-lg">
            <div className="p-4 relative">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={isRecording ? '' : `Describe your food item, for example:

🍗 Roasted chicken - 2 portions`}
                className="w-full bg-white border-none resize-none focus:outline-none min-h-[120px] whitespace-pre-wrap font-mono text-sm leading-relaxed"
                style={{ fontFamily: "'Courier New', monospace" }}
                readOnly={isRecording || isProcessing}
              />
              {isRecording && (
                <div className="absolute inset-0 flex justify-center items-center gap-3 pointer-events-none">
                  <div className="w-1 h-8 bg-[#085f33] rounded-full animate-[wave_1s_ease-in-out_infinite]" style={{ animationDelay: '0s' }}></div>
                  <div className="w-1 h-8 bg-[#085f33] rounded-full animate-[wave_1s_ease-in-out_infinite]" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-1 h-8 bg-[#085f33] rounded-full animate-[wave_1s_ease-in-out_infinite]" style={{ animationDelay: '0.4s' }}></div>
                  <div className="w-1 h-8 bg-[#085f33] rounded-full animate-[wave_1s_ease-in-out_infinite]" style={{ animationDelay: '0.6s' }}></div>
                  <div className="w-1 h-8 bg-[#085f33] rounded-full animate-[wave_1s_ease-in-out_infinite]" style={{ animationDelay: '0.8s' }}></div>
                </div>
              )}
              <button
                onClick={toggleRecording}
                disabled={buttonDisabled || isProcessing}
                type="button"
                className={`absolute top-4 right-4 rounded-full w-8 h-8 flex items-center justify-center transition-all duration-200 transform active:scale-95 disabled:transform-none ${
                  isRecording 
                    ? 'bg-red-500 active:bg-red-600 text-white' 
                    : isProcessing || buttonDisabled
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-[#085f33] active:bg-[#064726] text-white shadow-md'
                }`}
                style={{
                  WebkitTapHighlightColor: 'transparent',
                  touchAction: 'manipulation',
                  userSelect: 'none',
                  WebkitUserSelect: 'none'
                }}
              >
                {isProcessing ? (
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                ) : isRecording ? (
                  <>
                    <MicOff className="h-6 w-6" />
                    <MicOff className="h-4 w-4" />
                  </>
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </button>
            </div>
          </Card>

          <div className="mt-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Quantity (kg)
              </label>
              <div className="flex items-center gap-4 bg-white border border-gray-300 rounded-lg p-2">
                <button
                  onClick={() => setQuantity(prev => Math.max(0.5, prev - 0.5))}
                  className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="flex-1 text-center font-medium">{quantity} kg</span>
                <button
                  onClick={() => setQuantity(prev => prev + 0.5)}
                  className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-white border border-gray-300 rounded-lg">
              <div>
                <h3 className="font-medium">Food is under 60°C</h3>
                <p className="text-sm text-gray-600">Required for food safety</p>
              </div>
              <Switch
                checked={isUnder60C}
                onCheckedChange={setIsUnder60C}
                className="data-[state=checked]:bg-[#085f33] h-6 w-11"
              />
            </div>
          </div>
          
          {error && (
            <div className="mt-2 text-sm text-red-500">
              {error}
            </div>
          )}
          
          <div className="mt-2 text-sm">
            {isProcessing && (
              <p className="text-gray-600 animate-pulse">
                Analyzing and summarizing your donation details...
              </p>
            )}
            {isRecording && (
              <p className="text-green-600 animate-pulse">
                Recording... Describe your food donation (max 1 minute)
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Button 
            onClick={handleContinue}
            disabled={!description.trim() || isProcessing}
            className={`w-full h-12 rounded-full text-lg transition-colors ${
              description.trim() && !isProcessing
                ? 'bg-[#085f33] hover:bg-[#064726] text-white'
                : 'bg-gray-400 text-white cursor-not-allowed'
            }`}
          >
            Continue
          </Button>
          <Button 
            onClick={() => navigate(-1)}
            variant="outline"
            className="w-full h-12 bg-white border-2 border-[#085f33] text-[#085f33] rounded-full text-lg hover:bg-[#085f33] hover:text-white"
          >
            Back
          </Button>
        </div>
      </div>
    </Layout>
  );
};