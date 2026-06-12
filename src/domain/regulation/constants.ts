import { minutes } from '../time';

export const REG = {
  DAILY_STANDARD: minutes(9),
  DAILY_EXTENDED: minutes(10),
  WEEKLY: minutes(56),
  BIWEEKLY: minutes(90),
  DAILY_REST_REGULAR: minutes(11),
  DAILY_REST_REDUCED: minutes(9),
  WEEKLY_REST_REGULAR: minutes(45),
  WEEKLY_REST_REDUCED: minutes(24),
  MAX_REDUCED_DAILY_PER_WEEK: 3,
  MAX_EXTENDED_PER_WEEK: 2,
  ACTIVITY_WINDOW: minutes(15),
  COMPENSATION_WEEKS: 3,
} as const;
