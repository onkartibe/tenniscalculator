const { tennisCalculator } = require('./tennisMatchProcessor');

const calculator = tennisCalculator('./full_tournament.txt');

console.log(calculator.queryScoreMatch('02'));
console.log(calculator.queryGamesPlayer('Person A'));
