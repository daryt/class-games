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
    <Flex flexDirection="column" alignItems="center" minHeight="100vh">
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
            <Text fontSize={{ base: "6xl", md: "8xl" }}>
              {formatDuration(elapsedTime)}
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
          </VStack>
        </Box>
      </Flex>
    </Flex>
  );
};

export default App;
