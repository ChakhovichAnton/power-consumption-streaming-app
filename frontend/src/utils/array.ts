import type { Point } from "chart.js";

export const minFilter = (array: Point[], min: number, maxSize: number) => {
  const newArray: Point[] = [];
  for (let i = 0; i < array.length; i++) {
    if (array[i].x >= min) {
      newArray.push(array[i]);
    }

    if (newArray.length === maxSize) return newArray;
  }
  return newArray;
};

export const takeWhileCount = <T>(
  array: T[],
  condition: (item: T, index: number) => boolean
) => {
  let count = 0;
  for (let i = 0; i < array.length; i++) {
    if (condition(array[i], count)) {
      count++;
    } else {
      return count;
    }
  }
  return count;
};

export const takeRightWhileCount = <T>(
  array: T[],
  condition: (item: T, index: number) => boolean
) => {
  let count = 0;
  for (let i = array.length - 1; i >= 0; i--) {
    if (condition(array[i], count)) {
      count++;
    } else {
      return count;
    }
  }
  return count;
};
