import { useState, useCallback, useEffect, useRef } from "react";

const useVolumeLevel = () => {
  const windowSize = 100 // This helps essentially 'smooth' out the fluctuations.
  const [audio, setAudio] = useState<MediaStream | null>();
  const [audioContext, setAudioContext] = useState<AudioContext>();
  const [analyser, setAnalyser] = useState<AnalyserNode>();
  const [dataArray, setDataArray] = useState<Float32Array>(new Float32Array(0));
  const [source, setSource] = useState<MediaStreamAudioSourceNode>();
  const [soundLevel, setLevel] = useState(0);
  const [recentLevels, setRecentLevels] = useState<number[]>([]);

  const isActive = audio?.active == true;

  const alpha = 0.1; // Smoothing factor for exponential moving average
  const rafId = useRef<number | null>(null);

  const referencePower = 1e-12; // Reference power level

  const frequencyHandler = () => {
    if (!rafId.current) {
      return;
    }
    analyser?.getFloatTimeDomainData(dataArray);
    let sumPower = 0.0;
    for (const amplitude of dataArray) {
      const power = Math.pow(amplitude / 255, 2);
      sumPower += power;
    }

    const powerRatio = sumPower / dataArray.length / referencePower;
    const newSoundLevelInDb = 10 * Math.log10(powerRatio);

    const smoothedSoundLevel = alpha * newSoundLevelInDb + (1 - alpha) * soundLevel;

    const newLevel = Math.round(Math.max(smoothedSoundLevel * 10, 0));

    setRecentLevels((prevLevels) => {
      const newRecentLevels = [...prevLevels, newLevel].slice(-windowSize);
      setLevel(newRecentLevels.reduce((a, b) => a + b) / newRecentLevels.length);
      return newRecentLevels;
    });

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
    newAnalyser.fftSize = 2048;
    setAnalyser(newAnalyser);

    setDataArray(new Float32Array(newAnalyser.frequencyBinCount));

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
