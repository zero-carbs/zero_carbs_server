export function removeDuplicates(inputArray: any[]): any[] {
  const result = new Set(inputArray); // use a Set to remove duplicates and convert it back to an array
  return Array.from(result);
}
