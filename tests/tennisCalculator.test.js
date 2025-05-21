const assert = require('assert');
const {
  tennisCalculator,
  parseInput,
  calculateMatchResults,
  determineWinner
} = require('../tennisMatchProcessor');

// Helper to simulate a small in-memory file input
const sampleInput = `
Match: 01
Alice vs Bob
0
0
0
0
1
1
1
1
`;

function testParseInput() {
  const matches = parseInput(sampleInput);
  assert.strictEqual(matches.has('01'), true);
  const match = matches.get('01');
  assert.deepStrictEqual(match.players, ['Alice', 'Bob']);
  assert.strictEqual(match.points.length, 8);
  console.log('✅ testParseInput passed');
}

function testCalculateMatchResults() {
  const matchData = {
    players: ['Alice', 'Bob'],
    points: [0, 0, 0, 0, 1, 1, 1, 1],
  };

  const result = calculateMatchResults(matchData);
  assert(result.sets.length > 0, 'Expected at least one set');
  assert(result.sets[0].player1Games >= 0, 'Games should be non-negative');
  console.log('✅ testCalculateMatchResults passed');
}

function testDetermineWinner() {
  const matchData = {
    players: ['Alice', 'Bob'],
    points: Array(24).fill(0), // Alice wins all points
  };

  const result = calculateMatchResults(matchData);
  const winner = determineWinner(matchData, result);
  assert.strictEqual(winner, 'Alice');
  console.log('✅ testDetermineWinner passed');
}

function runAllTests() {
  testParseInput();
  testCalculateMatchResults();
  testDetermineWinner();
}

runAllTests();
