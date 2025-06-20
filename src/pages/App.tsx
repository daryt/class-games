import { useEffect, useRef, useState } from "react";
import { VStack, Text, Box, Flex, Button, Tooltip } from "@chakra-ui/react";
// @ts-ignore
import TrafficLight from "react-trafficlight";
import { useVolumeLevel, useGameLogic } from "../hooks";
import Header from "../components/Header/index";
import {
  formatDuration,
  minutesToString,
  minutesToMilliseconds,
  calculateDecreaseRatio,
} from "../utils/index";
import { useSettingsContext } from "../context/settingsContext";
import useSound from "use-sound";
import alert from "../assets/sounds/alert/be-quiet.mp3";
import warning from "../assets/sounds/warning/shh.mp3";
import Confetti from "react-confetti";

const START_RECORDING_TOOLTIP = "Start the timer";
const STOP_RECORDING_TOOLTIP = "Stop the timer";
const RESET_TOOLTIP = "Reset the score and time";

const App = () => {
  const { settings } = useSettingsContext();
  const { goal, addPoints, losePoints, timeInGreen } = settings;
  const [isTimer, setIsTimer] = useState(false);

  // Add this into settings later.
  const keepConfettiUntilStop = true;
  const { startRecording, stopRecording, isActive, soundLevel } =
    useVolumeLevel();
  const { points, trafficLightColor, reset, elapsedTime, isGameWon } =
    useGameLogic({
      isActive,
      soundLevel,
    });

  const handleStopRecording = () => {
    // Any actions to occur when the user clicks the Stop button.
    setConfetti((prevState) => ({ ...prevState, run: false }));
    stopRecording();
  };

  const [confetti, setConfetti] = useState({
    run: false,
    numberOfPieces: 200,
  });

  // Sounds
  const [playWarning] = useSound(warning);
  const [playAlert] = useSound(alert);

  const [lastPlayed, setLastPlayed] = useState({ red: 0, yellow: 0 });
  const prevTrafficLightColor = useRef(trafficLightColor);

  // Sets timer/stopwatch
  const toggleTimer = () => {
    setIsTimer(!isTimer);
  };

  useEffect(() => {
    let warningTimeoutId: number;
    let alertTimeoutId: number;

    if (trafficLightColor !== prevTrafficLightColor.current) {
      const soundDelayMilliseconds = settings.soundDelay * 1000;

      if (
        trafficLightColor === "yellow" &&
        Date.now() - lastPlayed.yellow >=
          minutesToMilliseconds(settings.cooldownPeriod)
      ) {
        warningTimeoutId = setTimeout(() => {
          if (trafficLightColor === "yellow") {
            playWarning();
            setLastPlayed((prevState) => ({
              ...prevState,
              yellow: Date.now(),
            }));
          }
        }, soundDelayMilliseconds);
      } else if (
        trafficLightColor === "red" &&
        Date.now() - lastPlayed.red >=
          minutesToMilliseconds(settings.cooldownPeriod)
      ) {
        alertTimeoutId = setTimeout(() => {
          if (trafficLightColor === "red") {
            playAlert();
            setLastPlayed((prevState) => ({ ...prevState, red: Date.now() }));
          }
        }, soundDelayMilliseconds);
      }
    }

    prevTrafficLightColor.current = trafficLightColor;
    return () => {
      // This helps reset the delayed sound if the light changes color
      // before the soudn plays.
      clearTimeout(warningTimeoutId);
      clearTimeout(alertTimeoutId);
    };
  }, [trafficLightColor]);

  const handleReset = () => {
    setLastPlayed({ red: 0, yellow: 0 });
    setConfetti((prevState) => ({
      ...prevState,
      numberOfPieces: 200,
      run: false,
    }));
    reset();
  };

  // Timer logic
  useEffect(() => {
    // If using timer, stop game once time reaches 0.
    const time = settings.timer * 60 - elapsedTime;
    if (isTimer && time == 0) {
      handleStopRecording();
    }
  }, [isTimer, elapsedTime]);

  // Confetti when game was won
  useEffect(() => {
    if (isGameWon) {
      setConfetti((prevState) => ({ ...prevState, run: true }));
    }
  }, [isGameWon]);

  // Clear confetti effect
  useEffect(() => {
    if (confetti.run && !keepConfettiUntilStop) {
      const confettiInterval = setInterval(() => {
        setConfetti((prevState) => {
          const decreaseRatio = calculateDecreaseRatio(
            prevState.numberOfPieces,
            200
          );
          const newNumberOfPieces =
            prevState.numberOfPieces - prevState.numberOfPieces * decreaseRatio;
          if (newNumberOfPieces <= 0) {
            clearInterval(confettiInterval);
            return { ...prevState, numberOfPieces: 200, run: false };
          }
          return { ...prevState, numberOfPieces: newNumberOfPieces };
        });
      }, 1000);

      return () => {
        clearInterval(confettiInterval);
      };
    }
  }, [confetti.run]);

  return (
    <Flex flexDirection="column" alignItems="center" minHeight="100vh">
      {confetti.run && <Confetti {...confetti} />}
      <Flex
        id="header"
        marginTop={{ base: "5vh", md: "0" }}
        height={{ base: "10vh", md: "15vh" }}
        width="100%"
        textAlign="center"
        alignItems="center"
        justifyContent="center"
      >
        <Header
          label="Classroom Noise Challenge"
          size={{ base: "2xl", md: "3xl" }}
        />
      </Flex>
      <Flex
        id="body"
        alignItems="center"
        justifyContent="space-between"
        direction={{ base: "column", md: "row" }}
        width={{ base: "90%", md: "75%" }}
        flexGrow={1}
      >
        <Box
          id="left-side"
          height={{ base: "30%", md: "80%" }}
          flexGrow={1}
          display={{ base: "block", md: "block" }}
        >
          <Box
            height={{ base: "40vh", md: "75vh" }}
            width={{ base: "30vw", md: "50vh" }}
          >
            <TrafficLight
              style={{
                height: "100%",
                width: "100%",
              }}
              RedOn={trafficLightColor === "red"}
              YellowOn={trafficLightColor === "yellow"}
              GreenOn={trafficLightColor === "green"}
            />
          </Box>
        </Box>
        <Box
          id="right-side"
          height={{ base: "50%", md: "80%" }}
          flexGrow={1}
          p="1rem"
        >
          <VStack
            spacing={4}
            justifyContent="space-between"
            alignItems={{ base: "center", md: "flex-start" }}
            width="100%"
          >
            <Text fontSize={{ base: "md", md: "2xl" }} textAlign="center">
              {`Earn ${addPoints} point(s) for every ${minutesToString(
                timeInGreen
              )} in the green. Lose ${losePoints} point(s)
          for every red alert.`}
            </Text>
            <Box height="3px" width="100%" backgroundColor="gray.200" />
            <Tooltip label="Switch timer/stopwatch">
              <Button size="lg" onClick={toggleTimer}>
                {isTimer ? "Stopwatch" : "Timer"}
              </Button>
            </Tooltip>
            <Text fontSize={{ base: "6xl", md: "8xl" }}>
              {isTimer
                ? formatDuration(settings.timer * 60 - elapsedTime)
                : formatDuration(elapsedTime)}
            </Text>
            <Flex
              width="200px"
              justifyContent="space-between"
              alignItems="center"
              m="0 auto"
            >
              <Tooltip
                label={
                  isActive ? STOP_RECORDING_TOOLTIP : START_RECORDING_TOOLTIP
                }
              >
                <Button
                  size="lg"
                  colorScheme={isActive ? "red" : "green"}
                  onClick={isActive ? handleStopRecording : startRecording}
                >
                  {isActive ? "Stop" : "Start"}
                </Button>
              </Tooltip>
              <Tooltip label={RESET_TOOLTIP}>
                <Button size="lg" onClick={handleReset}>
                  Reset
                </Button>
              </Tooltip>
            </Flex>
            <Flex
              justifyContent="space-between"
              alignItems="center"
              width={{ base: "100%", md: "70%", lg: "45%" }}
              m="0 auto"
            >
              <Text
                fontSize={{ base: "4xl", md: "5xl" }}
                textAlign="center"
                mb={{ base: 2, md: 0 }}
              >
                Score: {points}
              </Text>
              <Text fontSize={{ base: "4xl", md: "5xl" }} textAlign="center">
                Goal: {goal}
              </Text>
            </Flex>
            <Flex
              justifyContent="center"
              alignItems="center"
              width={{ base: "100%", md: "70%", lg: "45%" }}
              m="0 auto"
            >
              {settings.isDebug && (
                <Text fontSize={{ base: "2xl", md: "3xl" }} textAlign="center">
                  Sound: {soundLevel.toFixed(0)}
                </Text>
              )}
            </Flex>
          </VStack>
        </Box>
      </Flex>
    </Flex>
  );
};

export default App;
