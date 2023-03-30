import { useEffect, useState } from "react";
import { Select } from "@chakra-ui/react";

interface ISoundSelector {
  readonly type: "alert" | "warning";
  readonly defaultValue: string;
  readonly name: string;
  readonly onChange: (
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>
  ) => void;
}

const SoundSelector = ({
  type,
  defaultValue,
  name,
  onChange,
}: ISoundSelector) => {
  const [alertSounds, setAlertSounds] = useState<string[]>([]);

  // TODO: Make this dynamic by looking at the assets folder.
  useEffect(() => {
    switch (type) {
      case "alert":
        setAlertSounds(["be-quiet.mp3"]);
        break;
      case "warning":
        setAlertSounds(["shh.mp3"]);
        break;
    }
  }, [type]);

  return (
    <Select value={defaultValue} name={name} onChange={onChange}>
      {alertSounds.map((sound, index) => (
        <option key={index} value={sound}>
          {sound}
        </option>
      ))}
    </Select>
  );
};

export default SoundSelector;
