/**
 * Date and Time Utilities
 * Comprehensive date manipulation and formatting functions
 */

import { DATE_CONSTANTS } from '../constants/appConstants';

/**
 * Date Formatting
 */
export const DateFormatters = {
  // Format date to string
  format: (date, format = 'DISPLAY', locale = 'en-US') => {
    if (!date) return '';
    
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return 'Invalid Date';

    const formatTemplates = {
      DISPLAY: { year: 'numeric', month: 'short', day: 'numeric' },
      DISPLAY_WITH_TIME: { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit' 
      },
      DATABASE: { year: 'numeric', month: '2-digit', day: '2-digit' },
      DATABASE_WITH_TIME: { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      },
      TIME_ONLY: { hour: '2-digit', minute: '2-digit' },
      SHORT: { year: '2-digit', month: '2-digit', day: '2-digit' },
      MONTH_YEAR: { year: 'numeric', month: 'long' },
      WEEKDAY: { weekday: 'long' },
    };

    const options = formatTemplates[format] || formatTemplates.DISPLAY;
    return dateObj.toLocaleDateString(locale, options);
  },

  // Format date to custom string
  formatCustom: (date, formatString) => {
    if (!date) return '';
    
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return 'Invalid Date';

    const tokens = {
      YYYY: dateObj.getFullYear(),
      YY: dateObj.getFullYear().toString().slice(-2),
      MMMM: dateObj.toLocaleString('en-US', { month: 'long' }),
      MMM: dateObj.toLocaleString('en-US', { month: 'short' }),
      MM: String(dateObj.getMonth() + 1).padStart(2, '0'),
      M: dateObj.getMonth() + 1,
      DD: String(dateObj.getDate()).padStart(2, '0'),
      D: dateObj.getDate(),
      dddd: dateObj.toLocaleString('en-US', { weekday: 'long' }),
      ddd: dateObj.toLocaleString('en-US', { weekday: 'short' }),
      HH: String(dateObj.getHours()).padStart(2, '0'),
      H: dateObj.getHours(),
      hh: String(dateObj.getHours() % 12 || 12).padStart(2, '0'),
      h: dateObj.getHours() % 12 || 12,
      mm: String(dateObj.getMinutes()).padStart(2, '0'),
      m: dateObj.getMinutes(),
      ss: String(dateObj.getSeconds()).padStart(2, '0'),
      s: dateObj.getSeconds(),
      A: dateObj.getHours() < 12 ? 'AM' : 'PM',
      a: dateObj.getHours() < 12 ? 'am' : 'pm',
    };

    return formatString.replace(
      /YYYY|YY|MMMM|MMM|MM|M|DD|D|dddd|ddd|HH|H|hh|h|mm|m|ss|s|A|a/g,
      match => tokens[match]
    );
  },

  // Format relative time (e.g., "2 hours ago")
  formatRelative: (date, baseDate = new Date()) => {
    if (!date) return '';
    
    const dateObj = new Date(date);
    const baseObj = new Date(baseDate);
    
    if (isNaN(dateObj.getTime())) return 'Invalid Date';

    const diffMs = baseObj - dateObj;
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffYears > 0) {
      return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
    } else if (diffMonths > 0) {
      return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
    } else if (diffWeeks > 0) {
      return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
    } else if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  },

  // Format duration (e.g., "2 days, 3 hours")
  formatDuration: (milliseconds, includeSeconds = false) => {
    if (!milliseconds || milliseconds < 0) return '0 seconds';

    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    const parts = [];

    if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);
    if (hours % 24 > 0) parts.push(`${hours % 24} hour${hours % 24 > 1 ? 's' : ''}`);
    if (minutes % 60 > 0) parts.push(`${minutes % 60} minute${minutes % 60 > 1 ? 's' : ''}`);
    if (includeSeconds && seconds % 60 > 0) parts.push(`${seconds % 60} second${seconds % 60 > 1 ? 's' : ''}`);

    return parts.length > 0 ? parts.join(', ') : '0 seconds';
  },

  // Format date range
  formatDateRange: (startDate, endDate, format = 'DISPLAY') => {
    if (!startDate || !endDate) return '';
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 'Invalid Date Range';

    if (DateComparators.isSameDay(start, end)) {
      return DateFormatters.format(start, format);
    }

    if (DateComparators.isSameMonth(start, end)) {
      return `${DateFormatters.formatCustom(start, 'MMM D')} - ${DateFormatters.formatCustom(end, 'D, YYYY')}`;
    }

    if (DateComparators.isSameYear(start, end)) {
      return `${DateFormatters.formatCustom(start, 'MMM D')} - ${DateFormatters.formatCustom(end, 'MMM D, YYYY')}`;
    }

    return `${DateFormatters.format(start, format)} - ${DateFormatters.format(end, format)}`;
  },
};

/**
 * Date Manipulation
 */
export const DateManipulators = {
  // Add days to date
  addDays: (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  },

  // Add months to date
  addMonths: (date, months) => {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  },

  // Add years to date
  addYears: (date, years) => {
    const result = new Date(date);
    result.setFullYear(result.getFullYear() + years);
    return result;
  },

  // Add hours to date
  addHours: (date, hours) => {
    const result = new Date(date);
    result.setHours(result.getHours() + hours);
    return result;
  },

  // Add minutes to date
  addMinutes: (date, minutes) => {
    const result = new Date(date);
    result.setMinutes(result.getMinutes() + minutes);
    return result;
  },

  // Subtract days from date
  subtractDays: (date, days) => {
    return DateManipulators.addDays(date, -days);
  },

  // Subtract months from date
  subtractMonths: (date, months) => {
    return DateManipulators.addMonths(date, -months);
  },

  // Subtract years from date
  subtractYears: (date, years) => {
    return DateManipulators.addYears(date, -years);
  },

  // Set time to start of day (00:00:00)
  startOfDay: (date) => {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
  },

  // Set time to end of day (23:59:59)
  endOfDay: (date) => {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
  },

  // Set date to start of week
  startOfWeek: (date, firstDayOfWeek = 0) => {
    const result = new Date(date);
    const day = result.getDay();
    const diff = (day < firstDayOfWeek ? 7 : 0) + day - firstDayOfWeek;
    result.setDate(result.getDate() - diff);
    return DateManipulators.startOfDay(result);
  },

  // Set date to end of week
  endOfWeek: (date, firstDayOfWeek = 0) => {
    const start = DateManipulators.startOfWeek(date, firstDayOfWeek);
    return DateManipulators.endOfDay(DateManipulators.addDays(start, 6));
  },

  // Set date to start of month
  startOfMonth: (date) => {
    const result = new Date(date);
    result.setDate(1);
    return DateManipulators.startOfDay(result);
  },

  // Set date to end of month
  endOfMonth: (date) => {
    const result = new Date(date);
    result.setMonth(result.getMonth() + 1, 0);
    return DateManipulators.endOfDay(result);
  },

  // Set date to start of year
  startOfYear: (date) => {
    const result = new Date(date);
    result.setMonth(0, 1);
    return DateManipulators.startOfDay(result);
  },

  // Set date to end of year
  endOfYear: (date) => {
    const result = new Date(date);
    result.setMonth(11, 31);
    return DateManipulators.endOfDay(result);
  },

  // Set specific time
  setTime: (date, hours, minutes = 0, seconds = 0, milliseconds = 0) => {
    const result = new Date(date);
    result.setHours(hours, minutes, seconds, milliseconds);
    return result;
  },
};

/**
 * Date Comparison
 */
export const DateComparators = {
  // Check if two dates are the same day
  isSameDay: (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  },

  // Check if two dates are the same month
  isSameMonth: (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth();
  },

  // Check if two dates are the same year
  isSameYear: (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    
    return d1.getFullYear() === d2.getFullYear();
  },

  // Check if date is today
  isToday: (date) => {
    return DateComparators.isSameDay(date, new Date());
  },

  // Check if date is in the past
  isPast: (date) => {
    return new Date(date) < new Date();
  },

  // Check if date is in the future
  isFuture: (date) => {
    return new Date(date) > new Date();
  },

  // Check if date is within a range
  isInRange: (date, startDate, endDate) => {
    const d = new Date(date);
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return d >= start && d <= end;
  },

  // Check if date is weekend
  isWeekend: (date) => {
    const day = new Date(date).getDay();
    return day === 0 || day === 6; // Sunday or Saturday
  },

  // Check if date is weekday
  isWeekday: (date) => {
    return !DateComparators.isWeekend(date);
  },

  // Compare two dates (returns -1, 0, or 1)
  compare: (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    
    if (d1 < d2) return -1;
    if (d1 > d2) return 1;
    return 0;
  },

  // Get the minimum date from an array
  min: (dates) => {
    if (!Array.isArray(dates) || dates.length === 0) return null;
    
    return new Date(Math.min(...dates.map(date => new Date(date).getTime())));
  },

  // Get the maximum date from an array
  max: (dates) => {
    if (!Array.isArray(dates) || dates.length === 0) return null;
    
    return new Date(Math.max(...dates.map(date => new Date(date).getTime())));
  },
};

/**
 * Date Calculation
 */
export const DateCalculators = {
  // Calculate difference between two dates in days
  differenceInDays: (date1, date2) => {
    const d1 = DateManipulators.startOfDay(new Date(date1));
    const d2 = DateManipulators.startOfDay(new Date(date2));
    
    return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
  },

  // Calculate difference between two dates in business days
  differenceInBusinessDays: (startDate, endDate) => {
    let businessDays = 0;
    let currentDate = new Date(startDate);
    const end = new Date(endDate);
    
    while (currentDate <= end) {
      if (DateComparators.isWeekday(currentDate)) {
        businessDays++;
      }
      currentDate = DateManipulators.addDays(currentDate, 1);
    }
    
    return businessDays;
  },

  // Calculate difference between two dates in months
  differenceInMonths: (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    
    let months = (d2.getFullYear() - d1.getFullYear()) * 12;
    months += d2.getMonth() - d1.getMonth();
    
    // Adjust if day of month is earlier in date2
    if (d2.getDate() < d1.getDate()) {
      months--;
    }
    
    return months;
  },

  // Calculate difference between two dates in years
  differenceInYears: (date1, date2) => {
    return DateCalculators.differenceInMonths(date1, date2) / 12;
  },

  // Calculate age from birth date
  calculateAge: (birthDate, referenceDate = new Date()) => {
    const birth = new Date(birthDate);
    const reference = new Date(referenceDate);
    
    let age = reference.getFullYear() - birth.getFullYear();
    const monthDiff = reference.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && reference.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  },

  // Calculate business days between two dates
  getBusinessDays: (startDate, endDate) => {
    const businessDays = [];
    let currentDate = new Date(startDate);
    const end = new Date(endDate);
    
    while (currentDate <= end) {
      if (DateComparators.isWeekday(currentDate)) {
        businessDays.push(new Date(currentDate));
      }
      currentDate = DateManipulators.addDays(currentDate, 1);
    }
    
    return businessDays;
  },

  // Calculate due date based on business days
  calculateDueDate: (startDate, businessDays) => {
    let dueDate = new Date(startDate);
    let daysAdded = 0;
    
    while (daysAdded < businessDays) {
      dueDate = DateManipulators.addDays(dueDate, 1);
      if (DateComparators.isWeekday(dueDate)) {
        daysAdded++;
      }
    }
    
    return dueDate;
  },

  // Calculate working hours between two dates
  calculateWorkingHours: (startDate, endDate, workStart = 9, workEnd = 17) => {
    let totalHours = 0;
    let currentDate = new Date(startDate);
    const end = new Date(endDate);
    
    while (currentDate < end) {
      if (DateComparators.isWeekday(currentDate)) {
        const dayStart = DateManipulators.setTime(currentDate, workStart);
        const dayEnd = DateManipulators.setTime(currentDate, workEnd);
        
        const effectiveStart = currentDate < dayStart ? dayStart : currentDate;
        const effectiveEnd = end < dayEnd ? end : dayEnd;
        
        if (effectiveStart < effectiveEnd) {
          totalHours += (effectiveEnd - effectiveStart) / (1000 * 60 * 60);
        }
      }
      
      currentDate = DateManipulators.setTime(DateManipulators.addDays(currentDate, 1), workStart);
    }
    
    return totalHours;
  },
};

/**
 * Date Generation
 */
export const DateGenerators = {
  // Generate array of dates between two dates
  generateDateRange: (startDate, endDate, interval = 'day') => {
    const dates = [];
    let currentDate = new Date(startDate);
    const end = new Date(endDate);
    
    while (currentDate <= end) {
      dates.push(new Date(currentDate));
      
      switch (interval) {
        case 'day':
          currentDate = DateManipulators.addDays(currentDate, 1);
          break;
        case 'week':
          currentDate = DateManipulators.addDays(currentDate, 7);
          break;
        case 'month':
          currentDate = DateManipulators.addMonths(currentDate, 1);
          break;
        case 'year':
          currentDate = DateManipulators.addYears(currentDate, 1);
          break;
        default:
          currentDate = DateManipulators.addDays(currentDate, 1);
      }
    }
    
    return dates;
  },

  // Generate business days between two dates
  generateBusinessDays: (startDate, endDate) => {
    const allDates = DateGenerators.generateDateRange(startDate, endDate);
    return allDates.filter(date => DateComparators.isWeekday(date));
  },

  // Generate months between two dates
  generateMonths: (startDate, endDate) => {
    const months = [];
    let currentDate = DateManipulators.startOfMonth(new Date(startDate));
    const end = new Date(endDate);
    
    while (currentDate <= end) {
      months.push(new Date(currentDate));
      currentDate = DateManipulators.addMonths(currentDate, 1);
    }
    
    return months;
  },

  // Get all days of the week for a given date
  getWeekDates: (date, firstDayOfWeek = 0) => {
    const start = DateManipulators.startOfWeek(date, firstDayOfWeek);
    return Array.from({ length: 7 }, (_, i) => 
      DateManipulators.addDays(start, i)
    );
  },

  // Get all dates in a month
  getMonthDates: (date) => {
    const start = DateManipulators.startOfMonth(date);
    const end = DateManipulators.endOfMonth(date);
    return DateGenerators.generateDateRange(start, end);
  },

  // Get quarter for a date
  getQuarter: (date) => {
    const month = new Date(date).getMonth();
    return Math.floor(month / 3) + 1;
  },

  // Get dates for a specific quarter
  getQuarterDates: (year, quarter) => {
    const startMonth = (quarter - 1) * 3;
    const endMonth = startMonth + 2;
    
    const startDate = new Date(year, startMonth, 1);
    const endDate = DateManipulators.endOfMonth(new Date(year, endMonth, 1));
    
    return {
      start: startDate,
      end: endDate,
    };
  },
};

/**
 * Timezone Utilities
 */
export const TimezoneUtils = {
  // Convert date to different timezone
  convertTimezone: (date, targetTimezone) => {
    const options = {
      timeZone: targetTimezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };
    
    const formatter = new Intl.DateTimeFormat('en-US', options);
    const parts = formatter.formatToParts(new Date(date));
    
    const partValues = {};
    parts.forEach(part => {
      partValues[part.type] = part.value;
    });
    
    return new Date(
      `${partValues.year}-${partValues.month}-${partValues.day}T${partValues.hour}:${partValues.minute}:${partValues.second}`
    );
  },

  // Get timezone offset in hours
  getTimezoneOffset: (timezone) => {
    const date = new Date();
    const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
    const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
    
    return (tzDate - utcDate) / (1000 * 60 * 60);
  },

  // Check if date is in DST for a timezone
  isDST: (date, timezone) => {
    const jan = new Date(date.getFullYear(), 0, 1);
    const jul = new Date(date.getFullYear(), 6, 1);
    
    const janOffset = TimezoneUtils.getTimezoneOffset(timezone, jan);
    const julOffset = TimezoneUtils.getTimezoneOffset(timezone, jul);
    
    return Math.max(janOffset, julOffset) !== TimezoneUtils.getTimezoneOffset(timezone, date);
  },
};

/**
 * Export all date utilities
 */
export default {
  format: DateFormatters,
  manipulate: DateManipulators,
  compare: DateComparators,
  calculate: DateCalculators,
  generate: DateGenerators,
  timezone: TimezoneUtils,

  // Convenience methods
  now: () => new Date(),
  today: () => DateManipulators.startOfDay(new Date()),
  isValid: (date) => {
    const dateObj = new Date(date);
    return !isNaN(dateObj.getTime());
  },
  parse: (dateString) => {
    const parsed = new Date(dateString);
    return isNaN(parsed.getTime()) ? null : parsed;
  },
};