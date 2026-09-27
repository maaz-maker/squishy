export interface XpHistoryPoint {
  day: string; // e.g., 'Mon', 'Tue', 'Today'
  date: string; // e.g., 'Sep 20'
  fullDate: string; // ISO date string
  xp: number; // Cumulative total XP
  xpGained: number; // Daily XP earned
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Generates or synchronizes a smooth, realistic 7-day XP progression curve
 * ending on today with the player's current total XP.
 */
export function getSevenDayXpHistory(currentXp: number, savedHistory?: XpHistoryPoint[]): XpHistoryPoint[] {
  const points: XpHistoryPoint[] = [];
  const now = new Date();

  // Factors representing realistic cumulative growth over the past week
  // from ~30% of current XP up to 100% today
  const cumulativeRatios = [0.28, 0.38, 0.52, 0.64, 0.77, 0.89, 1.0];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);

    const isToday = i === 0;
    const dayName = isToday ? 'Today' : DAY_NAMES[d.getDay()];
    const dateLabel = `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`;
    const isoString = d.toISOString().split('T')[0];

    // Check if we have an exact saved record for this date
    const matched = savedHistory?.find((h) => h.fullDate === isoString);

    let cumulativeXp: number;
    if (isToday) {
      cumulativeXp = currentXp;
    } else if (matched) {
      cumulativeXp = matched.xp;
    } else {
      const ratioIdx = 6 - i;
      cumulativeXp = Math.max(0, Math.round(currentXp * cumulativeRatios[ratioIdx]));
    }

    // Calculate XP gained from previous day
    let xpGained = 0;
    if (points.length > 0) {
      xpGained = Math.max(0, cumulativeXp - points[points.length - 1].xp);
    } else {
      xpGained = Math.round(cumulativeXp * 0.25);
    }

    points.push({
      day: dayName,
      date: dateLabel,
      fullDate: isoString,
      xp: cumulativeXp,
      xpGained,
    });
  }

  // Ensure monotonically non-decreasing cumulative XP
  for (let i = 1; i < points.length; i++) {
    if (points[i].xp < points[i - 1].xp) {
      points[i].xp = points[i - 1].xp + Math.max(10, Math.round((currentXp - points[i - 1].xp) / (7 - i)));
    }
    points[i].xpGained = Math.max(0, points[i].xp - points[i - 1].xp);
  }

  // Ensure last point is exactly currentXp
  points[points.length - 1].xp = currentXp;
  if (points.length >= 2) {
    points[points.length - 1].xpGained = Math.max(
      0,
      currentXp - points[points.length - 2].xp
    );
  }

  return points;
}
