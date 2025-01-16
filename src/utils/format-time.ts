export const formatTime = (ms: number) => {
  const minutes = Math.floor(ms / 60).toString().padStart(2, '0');
  const seconds = Math.floor(ms % 60).toString().padStart(2, '0');
  const milliseconds = Math.floor((ms % 1) * 1000)
    .toString()
    .padStart(3, '0');

  return `${minutes}:${seconds}:${milliseconds}`;
}
