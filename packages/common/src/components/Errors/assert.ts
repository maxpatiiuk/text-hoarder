export function silenceError<T>(callback: () => T): T | undefined {
  try {
    return callback();
  } catch (error) {
    console[process.env.NODE_ENV === 'development' ? 'error' : 'log'](error);
    return undefined;
  }
}
