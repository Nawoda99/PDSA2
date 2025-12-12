export function numberToLetter(number) {
  if (number <= 26) {
    const letter = String.fromCharCode(number + 64);
    return letter;
  } else {
    const firstLetter = String.fromCharCode(Math.floor((number - 1) / 26) + 64);
    const secondLetter = String.fromCharCode(((number - 1) % 26) + 65);
    return firstLetter + secondLetter;
  }
}

export function letterToNumber(letter) {
  if (letter.length === 1) {
    const number = letter.charCodeAt(0) - 64;
    return number;
  } else {
    const firstLetter = letter.charCodeAt(0) - 64;
    const secondLetter = letter.charCodeAt(1) - 65;
    const number = firstLetter * 26 + secondLetter + 1;
    return number;
  }
}

export function createDirectedMatrix(dimension) {
  if (dimension <= 0) {
    throw new Error("Dimension must be a positive integer");
  }

  const matrix = [];
  for (let i = 0; i < dimension; i++) {
    matrix.push(new Array(dimension).fill(-1));
  }

  for (let i = 0; i < dimension; i++) {
    for (let j = 0; j < dimension; j++) {
      if (i !== j) {
        if (matrix[i][j] !== 0) {
          if (Math.random() > 0.5) {
            matrix[i][j] = Math.floor(Math.random() * 46) + 5;
            matrix[j][i] = 0;
          } else {
            matrix[j][i] = Math.floor(Math.random() * 46) + 5;
            matrix[i][j] = 0;
          }
        }
      }
    }
  }

  return matrix;
}

export function arrayEquals(array, arrayList) {
  for (const arrayItem of arrayList) {
    if (
      Array.isArray(array) &&
      Array.isArray(arrayItem) &&
      array.length === arrayList.length
    ) {
      if (
        array.every((row, rowIndex) => {
          if (row.length === arrayItem[rowIndex].length) {
            return row.every(
              (val, colIndex) => val === arrayItem[rowIndex][colIndex]
            );
          } else {
            return false;
          }
        })
      ) {
        return true;
      }
    }
  }

  return false;
}

export default {
  letterToNumber,
  numberToLetter,
  arrayEquals,
  createDirectedMatrix,
};
