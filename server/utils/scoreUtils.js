const calculateLiteracyAverage = (scores) => {
  if (!scores || scores.length === 0) return 0;
  const total = scores.reduce((sum, score) => sum + (score.score || 0), 0);
  return total / scores.length;
};

module.exports = { calculateLiteracyAverage };
