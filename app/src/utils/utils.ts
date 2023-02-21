export function convertToBoolean(input: string): boolean | undefined {
  try {
    return JSON.parse(input.toLowerCase())
  } catch (e) {
    return undefined
  }
}

export function titleCaseWord(word: string) {
  if (!word) return word
  return (word = word[0].toUpperCase() + word.slice(1))
}
