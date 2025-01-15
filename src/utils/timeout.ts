export const timeout = (callback: VoidFunction, ms = 1000) => {
  const ref = setTimeout(callback, ms)
  return () => clearTimeout(ref)
}
