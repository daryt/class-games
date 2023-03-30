import { useState, useCallback, useEffect, useRef } from "react";

const useVolumeLevel = () => {
  const [audio, setAudio] = useState<MediaStream | null>();
  const [audioContext, setAudioContext] = useState<AudioContext>();
  const [analyser, setAnalyser] = useState<AnalyserNode>();
  const [dataArray, setDataArray] = useState<Uint8Array>(new Uint8Array(0));
  const [source, setSource] = useState<MediaStreamAudioSourceNode>();
  const [soundLevel, setLevel] = useState(0);

  const isActive = audio?.active == true;

  const alpha = 0.1; // Smoothing factor for exponential moving average
  const rafId = useRef<number | null>(null);

  const frequencyHandler = () => {
    if (!rafId.current) {
      return;
    }
    analyser?.getByteFrequencyData(dataArray);
    let sumSquares = 0.0;
    for (const amplitude of dataArray) {
      sumSquares += amplitude * amplitude;
    }
    const newSoundLevel = Math.sqrt(sumSquares / dataArray.length);

    // Update the sound level using exponential moving average
    const smoothedSoundLevel = alpha * newSoundLevel + (1 - alpha) * soundLevel;
    setLevel(Math.round(smoothedSoundLevel));

    window.requestAnimationFrame(frequencyHandler);
  };

  const stopRecording = useCallback(() => {
    audio?.getTracks().forEach((track) => track.stop());
    setAudio(null);
    setLevel(0);
    rafId.current = null;
  }, [audio]);

  const startRecording = useCallback(async () => {
    const newAudio = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    setAudio(newAudio);
  }, []);

  useEffect(() => {
    if (!audio) {
      return;
    }

    const newAudioContext = new window.AudioContext();
    setAudioContext(newAudioContext);

    const newAnalyser = newAudioContext.createAnalyser();
    newAnalyser.fftSize = 256;
    setAnalyser(newAnalyser);

    setDataArray(new Uint8Array(newAnalyser.frequencyBinCount));

    const newSource = newAudioContext.createMediaStreamSource(audio);
    setSource(newSource);

    newSource.connect(newAnalyser);

    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
      analyser?.disconnect();
      source?.disconnect();
    };
  }, [audio]);

  useEffect(() => {
    if (audioContext?.state === "running") {
      rafId.current = requestAnimationFrame(frequencyHandler);
    }
  }, [audioContext]);

  return { startRecording, stopRecording, isActive, soundLevel };
};

export default useVolumeLevel;
