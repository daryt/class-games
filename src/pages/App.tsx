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
} from "../utils/index";
import { useSettingsContext } from "../context/settingsContext";
import useSound from "use-sound";
import alert from "../assets/sounds/alert/be-quiet.mp3";
import warning from "../assets/sounds/warning/shh.mp3";

const START_RECORDING_TOOLTIP = "Start the timer";
const STOP_RECORDING_TOOLTIP = "Stop the timer";
const RESET_TOOLTIP = "Reset the score and time";

const App = () => {
  const { settings } = useSettingsContext();
  const { goal, addPoints, losePoints, timeInGreen } = settings;
  const { startRecording, stopRecording, isActive, soundLevel } =
    useVolumeLevel();
  const { points, trafficLightColor, reset, elapsedTime } = useGameLogic({
    isActive,
    soundLevel,
  });

  // Sounds
  const [playWarning] = useSound(warning);
  const [playAlert] = useSound(alert);

  const [lastPlayed, setLastPlayed] = useState({ red: 0, yellow: 0 });
  const prevTrafficLightColor = useRef(trafficLightColor);

  useEffect(() => {
    if (trafficLightColor !== prevTrafficLightColor.current) {
      if (
        trafficLightColor === "yellow" &&
        Date.now() - lastPlayed.yellow >=
          minutesToMilliseconds(settings.cooldownPeriod)
      ) {
        playWarning();
        setLastPlayed((prevState) => ({ ...prevState, yellow: Date.now() }));
      } else if (
        trafficLightColor === "red" &&
        Date.now() - lastPlayed.red >=
          minutesToMilliseconds(settings.cooldownPeriod)
      ) {
        playAlert();
        setLastPlayed((prevState) => ({ ...prevState, red: Date.now() }));
      }
    }

    prevTrafficLightColor.current = trafficLightColor;
  }, [trafficLightColor]);

  const handleReset = () => {
    setLastPlayed({ red: 0, yellow: 0 });
    reset();
  };

  return (
    <Flex flexDirection="column" alignItems="center" height="100vh">
      <Flex
        id="header"
        height={"15vh"}
        width="100%"
        textAlign="center"
        alignItems="center"
        justifyContent="center"
      >
        <Header label="Classroom Noise Challenge" size="3xl" />
      </Flex>
      <Flex
        id="body"
        alignItems="center"
        justifyContent="space-between"
        width={{ base: "90%", md: "75%" }}
        flexGrow={1}
      >
        <Box
          id="left-side"
          height={"80%"}
          flexGrow={1}
          display={{ base: "none", md: "block" }}
        >
          <TrafficLight
            style={{
              height: "70vh",
              minWidth: "30vw",
              maxWidth: "60vw",
            }}
            RedOn={trafficLightColor === "red"}
            YellowOn={trafficLightColor === "yellow"}
            GreenOn={trafficLightColor === "green"}
          />
        </Box>
        <Box id="right-side" height={"80%"} flexGrow={1} p="1rem">
          <VStack
            spacing={4}
            justifyContent="space-between"
            alignItems="flex-start"
          >
            <Text fontSize="xl">
              {`Earn ${addPoints} point(s) for every ${minutesToString(
                timeInGreen
              )} in the green. Lose ${losePoints} point(s)
              for every red alert.`}
            </Text>
            <Box height="5px" width="100%" backgroundColor="gray.200" />
            <Text fontSize="8xl">{formatDuration(elapsedTime)}</Text>
            <Flex width="200px" justifyContent="space-between">
              <Tooltip
                label={
                  isActive ? STOP_RECORDING_TOOLTIP : START_RECORDING_TOOLTIP
                }
              >
                <Button
                  size="lg"
                  colorScheme={isActive ? "red" : "green"}
                  onClick={isActive ? stopRecording : startRecording}
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
            <Flex justifyContent="space-between" width="55%">
              <Text fontSize="5xl">Score: {points}</Text>
              <Text fontSize="5xl">Goal: {goal}</Text>
            </Flex>
          </VStack>
        </Box>
      </Flex>
    </Flex>
  );
};

export default App;
