import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Flex,
  Button,
  FormControl,
  FormLabel,
  Text,
  Box,
  ButtonGroup,
  Progress,
  Alert,
  AlertIcon,
  AlertDescription,
  useToast,
} from "@chakra-ui/react";
import { useVolumeLevel } from "../../hooks";
import { CalibrationSummary, NoisePresetKey } from "../../types/noisePresets";

interface MicrophoneTestProps {
  readonly onPresetApplied: (summary: CalibrationSummary) => void;
  readonly calibrationSummary?: CalibrationSummary | null;
}

const CALIBRATION_DURATION = 10;

const PRESETS: Record<
  NoisePresetKey,
  {
    label: string;
    yellowOffset: number;
    redOffset: number;
    yellowClamp: { min: number; max: number };
    redClamp: { min: number; max: number };
  }
> = {
  whisper: {
    label: "Whisper",
    yellowOffset: 6,
    redOffset: 12,
    yellowClamp: { min: 10, max: 90 },
    redClamp: { min: 15, max: 95 },
  },
  partner: {
    label: "Partner",
    yellowOffset: 12,
    redOffset: 20,
    yellowClamp: { min: 15, max: 90 },
    redClamp: { min: 20, max: 95 },
  },
  group: {
    label: "Group",
    yellowOffset: 18,
    redOffset: 28,
    yellowClamp: { min: 20, max: 92 },
    redClamp: { min: 28, max: 96 },
  },
};

const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};

const formatTime = (seconds: number) => {
  return `00:${seconds.toString().padStart(2, "0")}`;
};

const getMedian = (values: number[]) => {
  if (!values.length) {
    return 0;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }

  return sorted[middle];
};

const getPercentile = (values: number[], percentile: number) => {
  if (!values.length) {
    return 0;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const index = (percentile / 100) * (sorted.length - 1);
  const lowerIndex = Math.floor(index);
  const upperIndex = Math.ceil(index);

  if (lowerIndex === upperIndex) {
    return sorted[lowerIndex];
  }

  const weight = index - lowerIndex;
  return (
    sorted[lowerIndex] + weight * (sorted[upperIndex] - sorted[lowerIndex])
  );
};

const filterOutliers = (values: number[]) => {
  if (values.length < 3) {
    return values;
  }

  const medianValue = getMedian(values);
  const deviations = values.map((value) => Math.abs(value - medianValue));
  const mad = getMedian(deviations);

  if (mad === 0) {
    return values;
  }

  const threshold = 3 * mad;
  const filtered = values.filter(
    (value) => Math.abs(value - medianValue) <= threshold
  );

  return filtered.length ? filtered : values;
};

const calculateThresholds = (
  baseline: number,
  p80: number,
  preset: NoisePresetKey
): { summary: CalibrationSummary; shouldWarn: boolean } => {
  const config = PRESETS[preset];

  let yellow = clamp(
    baseline + config.yellowOffset,
    config.yellowClamp.min,
    config.yellowClamp.max
  );
  let red = clamp(
    baseline + config.redOffset,
    config.redClamp.min,
    config.redClamp.max
  );

  if (p80 - baseline < 6) {
    yellow = Math.max(
      yellow,
      clamp(baseline + 8, config.yellowClamp.min, config.yellowClamp.max)
    );
    red = Math.max(
      red,
      clamp(baseline + 16, config.redClamp.min, config.redClamp.max)
    );
  }

  if (yellow >= red - 3) {
    const desiredRed = clamp(
      yellow + 3,
      config.redClamp.min,
      config.redClamp.max
    );
    red = Math.max(red, desiredRed);
    if (yellow >= red - 3) {
      yellow = clamp(red - 3, config.yellowClamp.min, config.yellowClamp.max);
    }
  }

  yellow = clamp(yellow, 0, 100);
  red = clamp(red, 0, 100);

  const summary: CalibrationSummary = {
    preset,
    baseline: Math.round(clamp(baseline, 0, 100)),
    p80: Math.round(clamp(p80, 0, 100)),
    yellow: Math.round(yellow),
    red: Math.round(red),
  };

  const shouldWarn =
    baseline > 80 ||
    summary.yellow >= config.yellowClamp.max ||
    summary.red >= config.redClamp.max;

  return { summary, shouldWarn };
};

const MicrophoneTest = ({
  onPresetApplied,
  calibrationSummary,
}: MicrophoneTestProps) => {
  const { startRecording, stopRecording, isActive, soundLevel } =
    useVolumeLevel();
  const toast = useToast();

  const [isCalibrating, setIsCalibrating] = useState(false);
  const [activePreset, setActivePreset] = useState<NoisePresetKey | null>(null);
  const [countdown, setCountdown] = useState(CALIBRATION_DURATION);
  const [error, setError] = useState<string | null>(null);

  const countdownIntervalRef = useRef<number | null>(null);
  const calibrationTimeoutRef = useRef<number | null>(null);
  const startedRecordingForCalibration = useRef(false);
  const samplesRef = useRef<number[]>([]);

  const normalizedLevel = useMemo(() => {
    if (!Number.isFinite(soundLevel)) {
      return 0;
    }
    return clamp(Math.round(soundLevel), 0, 100);
  }, [soundLevel]);

  const clearCalibrationTimers = () => {
    if (countdownIntervalRef.current) {
      window.clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (calibrationTimeoutRef.current) {
      window.clearTimeout(calibrationTimeoutRef.current);
      calibrationTimeoutRef.current = null;
    }
  };

  const stopCalibrationRecording = useCallback(() => {
    if (startedRecordingForCalibration.current) {
      stopRecording();
      startedRecordingForCalibration.current = false;
    }
  }, [stopRecording]);

  const stopCalibrationRecordingRef = useRef(stopCalibrationRecording);

  useEffect(() => {
    stopCalibrationRecordingRef.current = stopCalibrationRecording;
  }, [stopCalibrationRecording]);

  useEffect(() => {
    if (isCalibrating) {
      samplesRef.current.push(normalizedLevel);
    }
  }, [normalizedLevel, isCalibrating]);

  useEffect(() => {
    return () => {
      clearCalibrationTimers();
      stopCalibrationRecordingRef.current();
    };
  }, []);

  const handlePresetClick = async (preset: NoisePresetKey) => {
    if (isCalibrating) {
      return;
    }

    setError(null);
    samplesRef.current = [];
    setActivePreset(preset);
    setCountdown(CALIBRATION_DURATION);

    try {
      if (!isActive) {
        await startRecording();
        startedRecordingForCalibration.current = true;
      }

      setIsCalibrating(true);

      calibrationTimeoutRef.current = window.setTimeout(() => {
        finalizeCalibration(preset);
      }, CALIBRATION_DURATION * 1000);

      countdownIntervalRef.current = window.setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    } catch (err) {
      setError(
        "Microphone access was denied. Please allow microphone permissions and try again."
      );
      setIsCalibrating(false);
      startedRecordingForCalibration.current = false;
    }
  };

  const finalizeCalibration = (preset: NoisePresetKey) => {
    clearCalibrationTimers();
    setIsCalibrating(false);
    setCountdown(CALIBRATION_DURATION);

    const presetLabel = PRESETS[preset].label;

    if (!samplesRef.current.length) {
      setError("We couldn't capture any audio. Please try again.");
      stopCalibrationRecording();
      return;
    }

    const filteredSamples = filterOutliers(samplesRef.current);
    const samplesToUse = filteredSamples.length
      ? filteredSamples
      : samplesRef.current;
    const baseline = getMedian(samplesToUse);
    const p80 = getPercentile(samplesToUse, 80);

    const { summary, shouldWarn } = calculateThresholds(baseline, p80, preset);

    onPresetApplied(summary);
    setError(null);
    stopCalibrationRecording();
    setActivePreset(null);
    samplesRef.current = [];

    toast({
      title: `${presetLabel} preset applied`,
      description: `Yellow ${summary.yellow}, Red ${summary.red}. Click Save Changes to keep.`,
      status: "success",
      duration: 6000,
      isClosable: true,
    });

    if (shouldWarn) {
      toast({
        title: "High baseline detected",
        description:
          "Your classroom is already loud. Thresholds were capped for safety.",
        status: "warning",
        duration: 6000,
        isClosable: true,
      });
    }
  };

  const handleCancel = () => {
    clearCalibrationTimers();
    setIsCalibrating(false);
    setCountdown(CALIBRATION_DURATION);
    setActivePreset(null);
    samplesRef.current = [];
    stopCalibrationRecording();
  };

  const calibrationProgress = useMemo(() => {
    if (!isCalibrating) {
      return 0;
    }
    return ((CALIBRATION_DURATION - countdown) / CALIBRATION_DURATION) * 100;
  }, [countdown, isCalibrating]);

  return (
    <>
      <FormControl id="microphone-test">
        <FormLabel m={0}>Microphone Test</FormLabel>
        <Text fontSize="xs" color="gray.500">
          Use this test to determine the baseline noise level in order to adjust
          the settings above.
        </Text>
        <Flex alignItems="center" marginTop="1rem">
          <Button
            onClick={() => {
              if (isActive) {
                stopRecording();
              } else {
                startRecording();
              }
            }}
            isDisabled={isCalibrating}
          >
            {isActive ? "Stop Mic Test" : "Start Mic Test"}
          </Button>
          <Text marginLeft="1rem">
            Mic Test Level: {isActive ? normalizedLevel.toFixed(0) : "N/A"}
          </Text>
        </Flex>
        <Box marginTop="1.5rem">
          <Text fontSize="xs" color="gray.500" marginBottom="0.5rem">
            Tap a preset to auto-set thresholds from the room noise (10s).
          </Text>
          <ButtonGroup spacing={2} isDisabled={isCalibrating}>
            {Object.entries(PRESETS).map(([key, config]) => (
              <Button
                key={key}
                variant="outline"
                onClick={() => handlePresetClick(key as NoisePresetKey)}
                isLoading={isCalibrating && activePreset === key}
              >
                {config.label}
              </Button>
            ))}
          </ButtonGroup>
          {isCalibrating && activePreset && (
            <Box
              marginTop="1rem"
              padding="1rem"
              borderWidth="1px"
              borderRadius="md"
              backgroundColor="gray.50"
            >
              <Flex justifyContent="space-between" alignItems="center">
                <Text aria-live="polite">
                  {`Calibrating ${PRESETS[activePreset].label}… ${formatTime(
                    countdown
                  )}`}
                </Text>
                <Button variant="link" size="sm" onClick={handleCancel}>
                  Cancel
                </Button>
              </Flex>
              <Progress
                marginTop="0.75rem"
                size="sm"
                value={calibrationProgress}
                colorScheme="teal"
                aria-hidden
              />
              <Box marginTop="0.75rem">
                <Text fontSize="xs" color="gray.600" marginBottom="0.25rem">
                  Live level
                </Text>
                <Progress
                  size="xs"
                  value={normalizedLevel}
                  colorScheme="green"
                  aria-hidden
                />
              </Box>
            </Box>
          )}
          {error && (
            <Alert status="error" marginTop="1rem" borderRadius="md">
              <AlertIcon />
              <AlertDescription display="flex" flexDirection="column">
                <Text>{error}</Text>
                {!isCalibrating && (
                  <Button
                    variant="link"
                    alignSelf="flex-start"
                    marginTop="0.5rem"
                    onClick={() => {
                      if (activePreset) {
                        handlePresetClick(activePreset);
                      }
                    }}
                  >
                    Retry
                  </Button>
                )}
              </AlertDescription>
            </Alert>
          )}
          {calibrationSummary && !isCalibrating && (
            <Box marginTop="1rem">
              <Text fontSize="xs" color="gray.600">
                Last preset: {PRESETS[calibrationSummary.preset].label} (B{" "}
                {calibrationSummary.baseline}, P80 {calibrationSummary.p80}, Y{" "}
                {calibrationSummary.yellow}, R {calibrationSummary.red})
              </Text>
            </Box>
          )}
        </Box>
      </FormControl>
    </>
  );
};

export default MicrophoneTest;
