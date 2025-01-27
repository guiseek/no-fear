export const immutable = <T extends object>(data: T) => {
  return Object.freeze(data)
}
