export const capital = (str: string) => {
  return str.replace(/(^|\s)\S/, (l) => l.toLocaleUpperCase())
}
