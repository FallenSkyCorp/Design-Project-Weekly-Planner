export function symmetricDifference<T>(arrayA: T[], arrayB: T[]): T[] {
  const setA = new Set(arrayA);
  const setB = new Set(arrayB);

  const result: T[] = [];

  for (const item of setA) {
    if (!setB.has(item)) {
      result.push(item);
    }
  }

  for (const item of setB) {
    if (!setA.has(item)) {
      result.push(item);
    }
  }

  return result;
}