export const createFilledArray = <T extends any>(length: number, value: T): T[] =>
  [...new Array(length)].map(x => value)

export const mapPlusArray = <T extends number[]>(array: T, array2: T) => array.map((x, i) => x + array2[i])
