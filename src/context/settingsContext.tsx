import { createContext, useState, ReactNode, useMemo, useContext } from "react";

// Settings Interface
interface ISettings {
  readonly addPoints: number;
  readonly losePoints: number;
  readonly timeInGreen: number;
  readonly redMinDec: number;
  readonly yellowMinDec: number;
  readonly goal: number;
  readonly rollingWindow: number;
  readonly alertSoundRed: string;
  readonly alertSoundYellow: string;
  readonly cooldownPeriod: number;
}

// Define the shape of the user details state
interface SettingsContextState {
  settings: ISettings;
  setSettings: React.Dispatch<React.SetStateAction<ISettings>>;
}

const SettingsContext = createContext<SettingsContextState | undefined>(
  undefined
);

interface UserProviderProps {
  initialSettings: ISettings;
  children: ReactNode;
}

function SettingsProvider({ initialSettings, children }: UserProviderProps) {
  const [settings, setSettings] = useState(initialSettings);

  const values = useMemo(
    () => ({
      settings,
      setSettings,
    }),
    [settings, setSettings]
  );

  return (
    <SettingsContext.Provider value={values}>
      {children}
    </SettingsContext.Provider>
  );
}

const useSettingsContext = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettingsContext was used outside of its Provider");
  }
  return context;
};

export { SettingsProvider, SettingsContext, useSettingsContext };
