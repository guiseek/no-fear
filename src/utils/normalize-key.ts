export const normalizeKey = (code: string) => {
  return code.replace(/Arrow|Key|Digit/gi, '').toLowerCase()
}
