export function normalizeVector(values: number[]) {
  const norm = Math.sqrt(values.reduce((sum, value) => sum + value * value, 0))

  if (norm === 0) {
    return values
  }

  return values.map((value) => value / norm)
}

export function isZeroVector(values: number[]) {
  return values.every((value) => value === 0)
}
