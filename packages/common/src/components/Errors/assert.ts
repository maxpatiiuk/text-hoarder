export function silenceError<T>(callback: () => T): T | undefined {
  try {
    return callback();
  } catch (error) {
    console.error(error);
    return undefined;
  }
}
