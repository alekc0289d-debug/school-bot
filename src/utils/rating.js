export function isDailyMark(g) {
  const s = g?.score;
  if (typeof s !== 'number' || Number.isNaN(s)) return false;
  if (g.isPercent || s > 10) return false;
  const t = (g.markType || '').toUpperCase();
  return !t.includes('BSB') && !t.includes('CHSB');
}

function toPercentScore(g) {
  const s = g?.score;
  if (typeof s !== 'number' || Number.isNaN(s)) return null;
  if (!g.isPercent && s <= 10) return s * 10;
  return s;
}

/**
 * Yangi kompleks reyting formulasi:
 * 1) Kunlik baholar o'rtachasi * 10 (max 100)
 * 2) BSB o'rtacha % * 0.5 (max 50)
 * 3) CHSB o'rtacha % * 0.7 (max 70)
 * 4) Topshiriqlar (Quests) ballari yig'indisi
 * 5) Testlar (Quizzes) bo'yicha eng yaxshi ballar yig'indisi
 */
export function calculateStudentRating(
  studentId,
  allGrades = [],
  questMap = {},
  quizMap = {}
) {
  const sGrades = allGrades.filter((g) => g.studentId === studentId);

  const daily = sGrades.filter(isDailyMark);
  const dailyAvg = daily.length
    ? daily.reduce((a, g) => a + g.score, 0) / daily.length
    : 0;
  const dailyPoints = Math.round(dailyAvg * 10 * 10) / 10;

  const bsbScores = sGrades
    .filter((g) => (g.markType || '').toUpperCase().includes('BSB'))
    .map(toPercentScore)
    .filter((v) => v !== null);
  const bsbAvg = bsbScores.length
    ? bsbScores.reduce((a, v) => a + v, 0) / bsbScores.length
    : 0;
  const bsbPoints = Math.round(bsbAvg * 0.5 * 10) / 10;

  const chsbScores = sGrades
    .filter((g) => (g.markType || '').toUpperCase().includes('CHSB'))
    .map(toPercentScore)
    .filter((v) => v !== null);
  const chsbAvg = chsbScores.length
    ? chsbScores.reduce((a, v) => a + v, 0) / chsbScores.length
    : 0;
  const chsbPoints = Math.round(chsbAvg * 0.7 * 10) / 10;

  const questPoints = Math.round((questMap[studentId]?.totalPoints || 0) * 10) / 10;
  const quizPoints = Math.round((quizMap[studentId] || 0) * 10) / 10;

  const totalPoints =
    Math.round((dailyPoints + bsbPoints + chsbPoints + questPoints + quizPoints) * 10) / 10;

  return {
    dailyAvg: Math.round(dailyAvg * 100) / 100,
    dailyCount: daily.length,
    dailyPoints,
    bsbPoints,
    bsbCount: bsbScores.length,
    chsbPoints,
    chsbCount: chsbScores.length,
    questPoints,
    quizPoints,
    totalPoints,
  };
}
