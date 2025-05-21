const fs = require('fs');
const path = require('path');

/**
 * Parses the raw tournament data and constructs match structures.
 * @param {string} input
 * @returns {Map<string, Match>}
 */
function parseInput(input) {
  const matches = new Map();
  const lines = input.split('\n');
  let currentMatchId = null;

  for (const line of lines.map((l) => l.trim()).filter(Boolean)) {
    if (line.startsWith('Match:')) {
      currentMatchId = line.split(':')[1].trim();
      matches.set(currentMatchId, { players: [], points: [] });
    } else if (line.includes('vs')) {
      const players = line.split('vs').map((p) => p.trim());
      matches.get(currentMatchId).players = players;
    } else if (line === '0' || line === '1') {
      matches.get(currentMatchId).points.push(Number(line));
    }
  }

  return matches;
}

/**
 * Calculates the set-by-set result for a match.
 * @param {Match} matchData
 * @returns {{player1Sets: number, player2Sets: number, sets: Array}}
 */
function calculateMatchResults(matchData) {
  let player1Sets = 0;
  let player2Sets = 0;
  const sets = [];

  let currentSet = { player1Games: 0, player2Games: 0 };
  let [p1Points, p2Points] = [0, 0];

  for (const point of matchData.points) {
    point === 0 ? p1Points++ : p2Points++;

    const gameOver = Math.max(p1Points, p2Points) >= 4 && Math.abs(p1Points - p2Points) >= 2;

    if (gameOver) {
      if (p1Points > p2Points) currentSet.player1Games++;
      else currentSet.player2Games++;

      [p1Points, p2Points] = [0, 0];
    }

    const setOver = Math.max(currentSet.player1Games, currentSet.player2Games) >= 6 &&
                    Math.abs(currentSet.player1Games - currentSet.player2Games) >= 1;

    if (setOver) {
      if (currentSet.player1Games > currentSet.player2Games) player1Sets++;
      else player2Sets++;

      sets.push(currentSet);
      currentSet = { player1Games: 0, player2Games: 0 };
    }

    if (player1Sets === 2 || player2Sets === 2) break;
  }

  // Push incomplete set (e.g., match ended before full set)
  if (currentSet.player1Games || currentSet.player2Games) {
    sets.push(currentSet);
  }

  return { player1Sets, player2Sets, sets };
}

/**
 * Determines match winner based on set count.
 * @param {Match} matchData
 * @param {*} results
 * @returns {string} Winner's name
 */
function determineWinner(matchData, results) {
  return results.player1Sets > results.player2Sets ? matchData.players[0] : matchData.players[1];
}

/**
 * Main calculator function for the tennis match.
 * @param {string} filePath
 */
function tennisCalculator(filePath) {
  const input = fs.readFileSync(path.resolve(filePath), 'utf-8');
  const matches = parseInput(input);

  /**
   * Gets match score and winner.
   * @param {string} matchId
   * @returns {string}
   */
  function queryScoreMatch(matchId) {
    const matchData = matches.get(matchId);
    if (!matchData) return `Match ${matchId} not found.`;

    const results = calculateMatchResults(matchData);
    const winner = determineWinner(matchData, results);
    const loser = matchData.players.find((p) => p !== winner);

    return `${winner} defeated ${loser}\n${results.player2Sets} sets to ${results.player1Sets}`;
  }

  /**
   * Aggregates total games played by a given player.
   * @param {string} playerName
   * @returns {string}
   */
  function queryGamesPlayer(playerName) {
    let totalGamesWon = 0;
    let totalGamesLost = 0;

    for (const matchData of matches.values()) {
      const results = calculateMatchResults(matchData);
      const isPlayer1 = matchData.players[0] === playerName;

      for (const set of results.sets) {
        if (isPlayer1) {
          totalGamesWon += set.player1Games;
          totalGamesLost += set.player2Games;
        } else if (matchData.players[1] === playerName) {
          totalGamesWon += set.player2Games;
          totalGamesLost += set.player1Games;
        }
      }
    }

    return `${playerName} - Games Won: ${totalGamesWon}, Games Lost: ${totalGamesLost}`;
  }

  return {
    queryScoreMatch,
    queryGamesPlayer,
  };
}


module.exports = {
    tennisCalculator,
    parseInput,
    calculateMatchResults,
    determineWinner,
  };