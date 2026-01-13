
import { MathQuestion, ComparisonResult } from '../types';

const getRandomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Generates an addition expression (a + b) where no carry is required.
 * Units sum <= 9 and Tens sum <= 9.
 */
const generateAdditionNoCarry = (maxSum: number) => {
  let a, b, aUnits, bUnits, aTens, bTens;
  
  do {
    a = getRandomInt(1, maxSum - 1);
    b = getRandomInt(1, maxSum - a);
    
    aUnits = a % 10;
    bUnits = b % 10;
    aTens = Math.floor(a / 10);
    bTens = Math.floor(b / 10);
    
  } while (aUnits + bUnits > 9 || aTens + bTens > 9);

  return { val: a + b, str: `${a} + ${b}` };
};

/**
 * Generates a subtraction expression (a - b) where no regrouping is required.
 * aUnits >= bUnits and aTens >= bTens.
 */
const generateSubtractionNoRegrouping = (maxVal: number) => {
  let a, b, aUnits, bUnits, aTens, bTens;
  
  do {
    a = getRandomInt(5, maxVal);
    b = getRandomInt(1, a);
    
    aUnits = a % 10;
    bUnits = b % 10;
    aTens = Math.floor(a / 10);
    bTens = Math.floor(b / 10);
    
  } while (aUnits < bUnits || aTens < bTens);

  return { val: a - b, str: `${a} - ${b}` };
};

export const generateQuestion = (playerScore: number): MathQuestion => {
  let leftValue = 0;
  let rightValue = 0;
  let leftExpr = '';
  let rightExpr = '';

  if (playerScore <= 4) {
    // Level 1 & 2: Two-digit numbers only (10-99)
    leftValue = getRandomInt(10, 99);
    rightValue = getRandomInt(10, 99);
    leftExpr = leftValue.toString();
    rightExpr = rightValue.toString();
  } else if (playerScore <= 6) {
    // Level 3: Expression vs Number (up to 50, but number is 2-digit)
    const isLeftExpr = Math.random() > 0.5;
    const isAddition = Math.random() > 0.5;
    const expr = isAddition ? generateAdditionNoCarry(50) : generateSubtractionNoRegrouping(50);
    const num = getRandomInt(10, 50);

    if (isLeftExpr) {
      leftValue = expr.val;
      leftExpr = expr.str;
      rightValue = num;
      rightExpr = num.toString();
    } else {
      leftValue = num;
      leftExpr = num.toString();
      rightValue = expr.val;
      rightExpr = expr.str;
    }
  } else {
    // Level 4+: Expression vs Expression (up to 100)
    // Rule: Both sides must have the same operator (both + or both -)
    const isAddition = Math.random() > 0.5;
    const left = isAddition ? generateAdditionNoCarry(100) : generateSubtractionNoRegrouping(100);
    const right = isAddition ? generateAdditionNoCarry(100) : generateSubtractionNoRegrouping(100);
    
    leftValue = left.val;
    leftExpr = left.str;
    rightValue = right.val;
    rightExpr = right.str;
  }

  let correctAnswer: ComparisonResult;
  if (leftValue < rightValue) correctAnswer = '<';
  else if (leftValue > rightValue) correctAnswer = '>';
  else correctAnswer = '=';

  return {
    leftExpression: leftExpr,
    leftValue,
    rightExpression: rightExpr,
    rightValue,
    correctAnswer
  };
};
