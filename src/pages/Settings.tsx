import { useState } from "react";
import {
  Box,
  Flex,
  Button,
  FormControl,
  FormLabel,
  Input,
  Text,
  VStack,
  Link,
} from "@chakra-ui/react";
import SoundSelector from "../components/SoundSelector";
import Header from "../components/Header/index";
import { useSettingsContext } from "../context/settingsContext";
import { useVolumeLevel } from "../hooks";

const Settings = () => {
  const { startRecording, stopRecording, isActive, soundLevel } =
    useVolumeLevel();
  const { settings, setSettings } = useSettingsContext();
  const {
    addPoints,
    losePoints,
    timeInGreen,
    redMinDec,
    yellowMinDec,
    goal,
    alertSoundRed,
    alertSoundYellow,
    rollingWindow,
    cooldownPeriod,
  } = settings;

  const [formValues, setFormValues] = useState({
    addPoints,
    losePoints,
    timeInGreen,
    redMinDec,
    yellowMinDec,
    goal,
    alertSoundRed,
    alertSoundYellow,
    rollingWindow,
    cooldownPeriod,
  });

  // Method to determine when the form has been modified.
  const isDirty = Object.keys(formValues).some((key) => {
    return (
      formValues[key as keyof typeof formValues] !==
      settings[key as keyof typeof settings]
    );
  });

  const isFormEmptyOrNull = Object.values(formValues).some((value) => {
    return value === null || value === "";
  });

  const handleChange = (
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    const parsedValue = /^\d+$/.test(value) ? parseInt(value, 10) : value;
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: parsedValue,
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSettings(formValues);
  };

  return (
    <Flex flexDirection="column" alignItems="center">
      <Flex id="header" height={"15vh"} textAlign="center" alignItems="center">
        <Header label="" size="2xl" />
      </Flex>
      <Flex
        id="body"
        alignItems="center"
        height={"75vh"}
        justifyContent="center"
        width="100%"
        flexDirection="column"
      >
        <Box width="80%">
          <form onSubmit={handleSubmit}>
            <Flex wrap="wrap" justifyContent="space-between">
              <Box width={["100%", "48%"]} marginBottom="1rem">
                <VStack spacing={2} alignItems="flex-start">
                  <Text fontSize="xl" fontWeight="bold">
                    Point Settings
                  </Text>
                  <FormControl id="add-goal">
                    <FormLabel m={0}>Goal</FormLabel>
                    <Text fontSize="xs" color="gray.500">
                      The target number of points students should aim to achieve
                      by maintaining an acceptable noise level in the classroom.
                    </Text>
                    <Input
                      type="number"
                      name="goal"
                      value={formValues.goal}
                      onChange={handleChange}
                      required
                    />
                  </FormControl>
                  <FormControl id="add-points">
                    <FormLabel m={0}>Points Gained</FormLabel>
                    <Text fontSize="xs" color="gray.500">
                      The number of points students gain when the noise level is
                      within the acceptable range (green light).
                    </Text>
                    <Input
                      type="number"
                      name="addPoints"
                      value={formValues.addPoints}
                      onChange={handleChange}
                      required
                    />
                  </FormControl>
                  <FormControl id="lose-points">
                    <FormLabel m={0}>Points Lost</FormLabel>
                    <Text fontSize="xs" color="gray.500">
                      The number of points students lose when the noise level
                      exceeds the acceptable range (red light).
                    </Text>
                    <Input
                      type="number"
                      name="losePoints"
                      value={formValues.losePoints}
                      onChange={handleChange}
                      required
                    />
                  </FormControl>
                </VStack>
              </Box>
              <Box width={["100%", "48%"]} marginBottom="1rem">
                <VStack spacing={2} alignItems="flex-start">
                  <Text fontSize="xl" fontWeight="bold">
                    Timer Settings
                  </Text>
                  <FormControl id="time-in-green">
                    <FormLabel m={0}>Time in Green (minutes)</FormLabel>
                    <Text fontSize="xs" color="gray.500">
                      Represents the time in minutes needed in order to gain a
                      point.
                    </Text>
                    <Input
                      type="number"
                      name="timeInGreen"
                      value={formValues.timeInGreen}
                      onChange={handleChange}
                      required
                    />
                  </FormControl>
                </VStack>
              </Box>
              <Box width={["100%", "48%"]} marginBottom="1rem">
                <VStack spacing={2} alignItems="flex-start">
                  <Text fontSize="xl" fontWeight="bold">
                    Threshold Settings
                  </Text>
                  <FormControl id="red-min-dec">
                    <FormLabel m={0}>Red Threshold</FormLabel>
                    <Text fontSize="xs" color="gray.500">
                      When the sound level hits this number, the traffic light
                      will turn red.
                    </Text>
                    <Input
                      type="number"
                      name="redMinDec"
                      value={formValues.redMinDec}
                      onChange={handleChange}
                      required
                    />
                  </FormControl>
                  <FormControl id="yellow-min-dec">
                    <FormLabel m={0}>Yellow Threshold</FormLabel>
                    <Text fontSize="xs" color="gray.500">
                      When the sound level hits this number, the traffic light
                      will turn yellow.
                    </Text>
                    <Input
                      type="number"
                      name="yellowMinDec"
                      value={formValues.yellowMinDec}
                      onChange={handleChange}
                      required
                    />
                  </FormControl>
                  <FormControl id="microphone-test">
                    <FormLabel m={0}>Microphone Test</FormLabel>
                    <Text fontSize="xs" color="gray.500">
                      Use this test to determine the baseline noise level in
                      order to adjust the settings above.
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
                      >
                        {isActive ? "Stop Mic Test" : "Start Mic Test"}
                      </Button>
                      <Text marginLeft="1rem">
                        Mic Test Level:{" "}
                        {isActive ? soundLevel.toFixed(0) : "N/A"}
                      </Text>
                    </Flex>
                  </FormControl>
                </VStack>
              </Box>
              <Box width={["100%", "48%"]} marginBottom="1rem">
                <VStack spacing={2} alignItems="flex-start">
                  <Text fontSize="xl" fontWeight="bold">
                    Sound Settings
                  </Text>
                  <FormControl id="cooldown-period">
                    <FormLabel m={0}>Sound Cooldown Period (minutes)</FormLabel>
                    <Text fontSize="xs" color="gray.500">
                      Determines how long to wait before replaying the sound.
                    </Text>
                    <Input
                      type="number"
                      name="cooldownPeriod"
                      value={formValues.cooldownPeriod}
                      onChange={handleChange}
                      required
                    />
                  </FormControl>
                  <FormControl id="alert-sound-red">
                    <FormLabel m={0}>Alert Sound (Red)</FormLabel>
                    <Text fontSize="xs" color="gray.500">
                      Sound that plays when the traffic light hits red.
                    </Text>
                    <SoundSelector
                      defaultValue={formValues.alertSoundRed}
                      type="alert"
                      name="alertSoundRed"
                      onChange={handleChange}
                    />
                  </FormControl>
                  <FormControl id="alert-sound-yellow">
                    <FormLabel m={0}>Alert Sound (Yellow)</FormLabel>
                    <Text fontSize="xs" color="gray.500">
                      Sound that plays when the traffic light hits yellow.
                    </Text>
                    <SoundSelector
                      defaultValue={formValues.alertSoundYellow}
                      type="warning"
                      name="alertSoundYellow"
                      onChange={handleChange}
                    />
                  </FormControl>
                </VStack>
              </Box>
            </Flex>
            <Link
              fontSize="sm"
              color="teal.500"
              href="https://www.cdc.gov/nceh/hearing_loss/what_noises_cause_hearing_loss.html"
              isExternal
            >
              Decibel Hearing Chart
            </Link>
            <Text fontSize="xs" color="gray.500" marginBottom=".5rem">
              Please note that the accuracy of the decibel readings provided by
              this application may be affected by the quality of your device's
              microphone.
            </Text>
            <Flex justifyContent="center" marginBottom=".2rem">
              <Button
                colorScheme={"green"}
                isDisabled={!isDirty || isFormEmptyOrNull}
                type="submit"
              >
                Save Changes
              </Button>
            </Flex>
          </form>
        </Box>
      </Flex>
    </Flex>
  );
};

export default Settings;
