import { useState } from "react";
import {
  Box,
  Flex,
  Button,
  FormControl,
  FormLabel,
  Input,
  Text,
  Grid,
  Link,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  FormHelperText,
} from "@chakra-ui/react";
import SoundSelector from "../components/SoundSelector";
import Header from "../components/Header/index";
import { useSettingsContext } from "../context/settingsContext";
import MicrophoneTest from "../components/MicrophoneTest";
import useLocalStorage from "../hooks/useLocalStorage";

interface IFormValues {
  addPoints: number;
  losePoints: number;
  timeInGreen: number;
  redMinDec: number;
  yellowMinDec: number;
  goal: number;
  alertSoundRed: string;
  alertSoundYellow: string;
  rollingWindow: number;
  cooldownPeriod: number;
  averageWindowSize: number;
}

interface ISettings {
  readonly formValues: IFormValues;
  readonly handleChange: (event: any) => void;
}

const PointSettings = ({ formValues, handleChange }: ISettings) => (
  <>
    <Text fontSize="xl" fontWeight="bold">
      Point Settings
    </Text>
    <FormControl id="add-goal">
      <FormLabel m={0}>Goal</FormLabel>
      <Text fontSize="xs" color="gray.500">
        The target number of points students should aim to achieve by
        maintaining an acceptable noise level in the classroom.
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
        The number of points students gain when the noise level is within the
        acceptable range (green light).
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
        The number of points students lose when the noise level exceeds the
        acceptable range (red light).
      </Text>
      <Input
        type="number"
        name="losePoints"
        value={formValues.losePoints}
        onChange={handleChange}
        required
      />
    </FormControl>
    <FormControl id="time-in-green">
      <FormLabel m={0}>Time in Green (minutes)</FormLabel>
      <Text fontSize="xs" color="gray.500">
        Represents the time in minutes needed in order to gain a point.
      </Text>
      <Input
        type="number"
        name="timeInGreen"
        value={formValues.timeInGreen}
        onChange={handleChange}
        required
      />
    </FormControl>
  </>
);

const SoundSettings = ({ formValues, handleChange }: ISettings) => (
  <>
    <Text fontSize="xl" fontWeight="bold">
      Sound Settings
    </Text>
    <FormControl id="average-window-size">
      <FormLabel m={0}>Audio Averaging Window Size</FormLabel>
      <FormHelperText fontSize="xs" color="gray.500" mb={2}>
        Adjust the size of the sliding window used to average the audio levels.
        Increasing the window size will result in a smoother, more stable audio
        level measurement, while a smaller window size will provide faster, more
        responsive updates.
      </FormHelperText>
      <Slider
        aria-label="Audio Averaging Window Size"
        name="averageWindowSize"
        min={0}
        max={200}
        step={1}
        value={formValues.averageWindowSize}
        onChange={(value) => {
          handleChange({
            target: { name: "averageWindowSize", value },
          });
        }}
      >
        <SliderTrack>
          <SliderFilledTrack />
        </SliderTrack>
        <SliderThumb fontSize="xs" boxSize={4}>
          {formValues.averageWindowSize}
        </SliderThumb>
      </Slider>
    </FormControl>
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
  </>
);

const ThresholdSettings = ({ formValues, handleChange }: ISettings) => (
  <>
    <Text fontSize="xl" fontWeight="bold">
      Threshold Settings
    </Text>
    <FormControl id="red-min-dec">
      <FormLabel m={0}>Red Threshold</FormLabel>
      <Text fontSize="xs" color="gray.500">
        When the sound level hits this number, the traffic light will turn red.
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
        When the sound level hits this number, the traffic light will turn
        yellow.
      </Text>
      <Input
        type="number"
        name="yellowMinDec"
        value={formValues.yellowMinDec}
        onChange={handleChange}
        required
      />
    </FormControl>
    <MicrophoneTest />
  </>
);

const Settings = () => {
  const { settings, setSettings } = useSettingsContext();
  const [_, setValue] = useLocalStorage("settings");

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
    averageWindowSize,
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
    averageWindowSize,
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

  const handleChange = (event: any) => {
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
    setValue(formValues);
  };

  return (
    <Box
      minHeight="100vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="space-between"
    >
      <Box
        id="header"
        height={"5vh"}
        textAlign="center"
        display="flex"
        alignItems="center"
      >
        <Header label="" size="2xl" />
      </Box>
      <Box
        id="body"
        display="flex"
        alignItems="center"
        justifyContent="center"
        width="100%"
        flexDirection="column"
        flexGrow={1}
        py={4}
      >
        <Box width="80%">
          <form onSubmit={handleSubmit}>
            <Grid
              templateColumns="repeat(auto-fit, minmax(280px, 1fr))"
              gap={6}
            >
              <Box>
                <PointSettings
                  formValues={formValues}
                  handleChange={handleChange}
                />
              </Box>
              <Box>
                <SoundSettings
                  formValues={formValues}
                  handleChange={handleChange}
                />
              </Box>
              <Box>
                <ThresholdSettings
                  formValues={formValues}
                  handleChange={handleChange}
                />
              </Box>
            </Grid>
            <Box marginTop="1rem">
              <Link
                fontSize="sm"
                color="teal.500"
                href="https://www.cdc.gov/nceh/hearing_loss/what_noises_cause_hearing_loss.html"
                isExternal
              >
                Decibel Hearing Chart
              </Link>
              <Text fontSize="xs" color="gray.500" marginTop=".5rem">
                Please note that the accuracy of the decibel readings provided
                by this application may be affected by the quality of your
                device's microphone.
              </Text>
            </Box>
            <Flex justifyContent="center" marginTop="1rem">
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
      </Box>
    </Box>
  );
};

export default Settings;
