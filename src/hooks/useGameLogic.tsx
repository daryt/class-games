import { useState, useEffect, useRef } from "react";
import { useSettingsContext } from "../context/settingsContext";

interface TrafficLightProps {
  readonly isActive: boolean;
  readonly soundLevel: number;
}

/**
 * A custom hook that handles game logic for a traffic light game.
 * @param isActive - Whether the game is currently active or not.
 * @param soundLevel - The current sound level.
 * @returns An object containing points, trafficLightColor, elapsedTime, and reset functions.
 */
const useGameLogic = ({ isActive, soundLevel }: TrafficLightProps) => {
  const { settings } = useSettingsContext();

  // State variables
  const [trafficLightColor, setTrafficLightColor] = useState("green");
  const [points, setPoints] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isGameWon, setIsGameWon] = useState(false);

  // Refs
  const globalTimerId = useRef<ReturnType<typeof setInterval> | null>(null);
  const greenSeconds = useRef(0);

  /**
   * Control traffic light color based on sound level.
   */
  useEffect(() => {
    if (soundLevel < settings.yellowMinDec) {
      setTrafficLightColor("green");
    } else if (
      soundLevel >= settings.yellowMinDec &&
      soundLevel < settings.redMinDec
    ) {
      setTrafficLightColor("yellow");
    } else {
      setTrafficLightColor("red");
    }
  }, [soundLevel]);

  /**
   * Decrements points whenever the traffic light hits red.
   */
  useEffect(() => {
    if (isActive && trafficLightColor === "red") {
      // TODO: Lose points for every X seconds in red.
      // Lose points for every time it hits red
      setPoints((prevPoints) =>
        prevPoints === 0 ? 0 : prevPoints - settings.losePoints
      );
    }
  }, [trafficLightColor, settings.losePoints, isActive]);

  /**
   * Starts the global timer whenever the game is active. The timer keeps running
   * even if the light turns yellow or red. Time spent in green accumulates
   * across yellow and red periods and awards points once the configured
   * interval is reached.
   */
  useEffect(() => {
    if (isActive) {
      globalTimerId.current = setInterval(() => {
        setElapsedTime((prevElapsedTime) => prevElapsedTime + 1);

        if (trafficLightColor === "green") {
          greenSeconds.current += 1;
          if (greenSeconds.current >= settings.timeInGreen * 60) {
            setPoints((prevPoints) => prevPoints + settings.addPoints);
            greenSeconds.current = 0;
          }
        }
      }, 1000);
    }

    return () => {
      clearInterval(globalTimerId.current as number);
    };
  }, [isActive, trafficLightColor, settings.addPoints, settings.timeInGreen]);

  /*
    Determines whens the user has won the game.

    When the user reaches the goal, we need to
    set isGameWon to True.
  */
  useEffect(() => {
    if (points >= settings.goal) {
      setIsGameWon(true);
    }
  }, [points, settings.goal]);

  /**
   * Resets points, elapsed time, and green counter.
   */
  const reset = () => {
    setElapsedTime(0);
    setPoints(0);
    setIsGameWon(false);

    if (isActive) {
      resetGlobalCounter();
      resetGreenCounter();
    }
  };

  /**
   * Resets the green counter.
   */
  const resetGreenCounter = () => {
    greenSeconds.current = 0;
  };

  /**
   * Resets the global timer.
   */
  const resetGlobalCounter = () => {
    clearInterval(globalTimerId.current as number);
    if (isActive) {
      globalTimerId.current = setInterval(() => {
        setElapsedTime((prevElapsedTime) => prevElapsedTime + 1);
      }, 1000);
    }
  };

  return {
    points,
    setPoints,
    trafficLightColor,
    elapsedTime,
    reset,
    isGameWon,
  };
};

export default useGameLogic;
