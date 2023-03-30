export const formatDuration = (durationInSeconds: number): string => {
  const minutes = Math.floor(durationInSeconds / 60);
  const seconds = durationInSeconds % 60;
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(seconds).padStart(2, "0");
  return `${formattedMinutes}:${formattedSeconds}`;
};


export const minutesToString = (duration: number): string => {
  if (duration < 1) {
    const seconds = Math.ceil(duration * 60);
    return `${seconds} second${seconds === 1 ? "" : "s"}`;
  }

  const minutes = Math.floor(duration);
  const seconds = Math.floor((duration - minutes) * 60);

  if (minutes === 1) {
    return `${minutes} minute${seconds > 0 ? "s" : ""}`;
  }

  return `${minutes} minutes${seconds > 0 ? ", " : ""}${seconds > 0 ? `${seconds} seconds` : ""}`;
}

export const minutesToMilliseconds = (minutes: number) => {
  const seconds = minutes * 60;
  const milliseconds = seconds * 1000;
  return milliseconds;
}