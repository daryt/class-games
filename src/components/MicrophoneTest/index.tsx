import { useVolumeLevel } from "../../hooks";
import { Flex, Button, FormControl, FormLabel, Text } from "@chakra-ui/react";

const MicrophoneTest = () => {
  const { startRecording, stopRecording, isActive, soundLevel } =
    useVolumeLevel();

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
          >
            {isActive ? "Stop Mic Test" : "Start Mic Test"}
          </Button>
          <Text marginLeft="1rem">
            Mic Test Level: {isActive ? soundLevel.toFixed(0) : "N/A"}
          </Text>
        </Flex>
      </FormControl>
    </>
  );
};

export default MicrophoneTest;
