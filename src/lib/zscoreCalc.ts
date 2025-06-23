// src/lib/growth-data/zscoreCalc.ts
import growthData from './growthData.json';

interface LMSDataPoint {
  day: number;
  L: number;
  M: number;
  S: number;
}

type ChartType = 'bfa' | 'hcfa' | 'lhfa' | 'wfa';
type Gender = 'boys' | 'girls';

/**
 * Calculate age in days from two dates.
 */
export function getAgeInDays(dateOfBirth: Date, measurementDate: Date): number {
  return Math.floor(
    (measurementDate.getTime() - dateOfBirth.getTime()) / (1000 * 60 * 60 * 24)
  );
}

/**
 * Interpolates LMS data using binary search for performance.
 */
function interpolateLMS(
  data: LMSDataPoint[],
  targetDay: number
): LMSDataPoint | null {
  if (data.length === 0) return null;

  const first = data[0];
  const last = data[data.length - 1];

  if (!first || !last) return null;

  if (targetDay <= first.day) return first;
  if (targetDay >= last.day) return last;

  let left = 0;
  let right = data.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const current = data[mid];
    if (!current) break;

    if (current.day === targetDay) return current;
    if (current.day < targetDay) left = mid + 1;
    else right = mid - 1;
  }

  const lower = data[right] ?? null;
  const upper = data[left] ?? null;

  if (!lower || !upper) return null;

  const fraction = (targetDay - lower.day) / (upper.day - lower.day);
  return {
    day: targetDay,
    L: lower.L + fraction * (upper.L - lower.L),
    M: lower.M + fraction * (upper.M - lower.M),
    S: lower.S + fraction * (upper.S - lower.S),
  };
}

/**
 * Main Z-score calculation.
 */
export function calculateZScore(
  chartType: ChartType,
  gender: Gender,
  ageInDays: number,
  measurementValue: number
): number | null {
  const chart = growthData[chartType];
  const lmsData = chart?.[gender];

  if (!lmsData || !Array.isArray(lmsData)) return null;

  const lms = interpolateLMS(lmsData, ageInDays);
  if (!lms) return null;

  const { L, M, S } = lms;
  if (!M || !S) return null;

  // WHO LMS Z-score formula
  return Math.abs(L) < 1e-6
    ? Math.log(measurementValue / M) / S
    : (Math.pow(measurementValue / M, L) - 1) / (S * L);
}
