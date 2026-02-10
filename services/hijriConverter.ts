
import { HijriDate } from '../types';
import { HIJRI_MONTHS } from '../constants';

/**
 * Basic Hijri conversion using the Tabular (Kuwaiti) algorithm.
 * Note: Real Hijri dates can vary by 1-2 days based on moon sighting,
 * but tabular is standard for software approximations.
 */
export function getHijriDate(date: Date): HijriDate {
  let day = date.getDate();
  let month = date.getMonth();
  let year = date.getFullYear();

  if ((year < 1583)) return { day: 1, month: 1, year: 1, monthName: HIJRI_MONTHS[0] };

  let jd: number;
  if ((year > 1582) || ((year === 1582) && (month > 10)) || ((year === 1582) && (month === 10) && (day > 14))) {
    jd = Math.floor((1461 * (year + 4800 + Math.floor((month - 8) / 12))) / 4) +
         Math.floor((367 * (month - 1 - 12 * Math.floor((month - 8) / 12))) / 12) -
         Math.floor((3 * Math.floor((year + 4900 + Math.floor((month - 8) / 12)) / 100)) / 4) +
         day - 32075;
  } else {
    jd = 367 * year - Math.floor((7 * (year + 5001 + Math.floor((month - 8) / 12))) / 4) +
         Math.floor((275 * month) / 9) + day + 1729777;
  }

  let l = jd - 1948440 + 10632;
  let n = Math.floor((l - 1) / 10631);
  l = l - 10631 * n + 354;
  let j = (Math.floor((10985 - l) / 5316)) * (Math.floor((50 * l) / 17719)) +
          (Math.floor(l / 5670)) * (Math.floor((43 * l) / 15238));
  l = l - (Math.floor((30 - j) / 15)) * (Math.floor((17719 * j) / 50)) -
      (Math.floor(j / 16)) * (Math.floor((15238 * j) / 43)) + 29;
  
  let hMonth = Math.floor((24 * l) / 709);
  let hDay = l - Math.floor((709 * hMonth) / 24);
  let hYear = 30 * n + j - 30;

  return {
    day: hDay,
    month: hMonth,
    year: hYear,
    monthName: HIJRI_MONTHS[hMonth - 1]
  };
}
