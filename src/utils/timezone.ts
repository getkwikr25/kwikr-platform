// Advanced Timezone Conversion System
// Production-ready timezone handling with DST support

interface TimezoneInfo {
  timezone_code: string;
  timezone_name: string;
  utc_offset_standard: number; // Minutes from UTC
  utc_offset_dst: number; // Minutes from UTC during DST
  dst_start_rule: string;
  dst_end_rule: string;
}

interface ConversionResult {
  original_datetime: string;
  original_timezone: string;
  converted_datetime: string;
  converted_timezone: string;
  offset_difference_hours: number;
  is_dst_original: boolean;
  is_dst_target: boolean;
  warning?: string;
}

// Canadian timezone definitions with accurate DST rules
const CANADIAN_TIMEZONES: Record<string, TimezoneInfo> = {
  'America/Toronto': {
    timezone_code: 'America/Toronto',
    timezone_name: 'Eastern Time',
    utc_offset_standard: -300, // EST: UTC-5
    utc_offset_dst: -240,      // EDT: UTC-4
    dst_start_rule: '2nd Sunday March 2:00 AM',
    dst_end_rule: '1st Sunday November 2:00 AM'
  },
  'America/Vancouver': {
    timezone_code: 'America/Vancouver', 
    timezone_name: 'Pacific Time',
    utc_offset_standard: -480, // PST: UTC-8
    utc_offset_dst: -420,      // PDT: UTC-7
    dst_start_rule: '2nd Sunday March 2:00 AM',
    dst_end_rule: '1st Sunday November 2:00 AM'
  },
  'America/Halifax': {
    timezone_code: 'America/Halifax',
    timezone_name: 'Atlantic Time', 
    utc_offset_standard: -240, // AST: UTC-4
    utc_offset_dst: -180,      // ADT: UTC-3
    dst_start_rule: '2nd Sunday March 2:00 AM',
    dst_end_rule: '1st Sunday November 2:00 AM'
  },
  'America/Winnipeg': {
    timezone_code: 'America/Winnipeg',
    timezone_name: 'Central Time',
    utc_offset_standard: -360, // CST: UTC-6
    utc_offset_dst: -300,      // CDT: UTC-5
    dst_start_rule: '2nd Sunday March 2:00 AM', 
    dst_end_rule: '1st Sunday November 2:00 AM'
  },
  'America/St_Johns': {
    timezone_code: 'America/St_Johns',
    timezone_name: 'Newfoundland Time',
    utc_offset_standard: -210, // NST: UTC-3.5
    utc_offset_dst: -150,      // NDT: UTC-2.5
    dst_start_rule: '2nd Sunday March 2:00 AM',
    dst_end_rule: '1st Sunday November 2:00 AM'
  }
};

/**
 * Determines if a given date is during Daylight Saving Time
 */
function isDST(date: Date, timezone: string): boolean {
  const year = date.getFullYear();
  
  // Calculate DST start: 2nd Sunday of March at 2:00 AM
  const marchFirst = new Date(year, 2, 1); // March 1st
  const firstSunday = new Date(marchFirst.getTime() + (7 - marchFirst.getDay()) * 24 * 60 * 60 * 1000);
  const dstStart = new Date(firstSunday.getTime() + 7 * 24 * 60 * 60 * 1000); // Add 1 week
  dstStart.setHours(2, 0, 0, 0); // 2:00 AM
  
  // Calculate DST end: 1st Sunday of November at 2:00 AM
  const novemberFirst = new Date(year, 10, 1); // November 1st
  const dstEnd = new Date(novemberFirst.getTime() + (7 - novemberFirst.getDay()) * 24 * 60 * 60 * 1000);
  dstEnd.setHours(2, 0, 0, 0); // 2:00 AM
  
  return date >= dstStart && date < dstEnd;
}

/**
 * Get current UTC offset for a timezone considering DST
 */
function getCurrentOffset(date: Date, timezone: string): number {
  const tzInfo = CANADIAN_TIMEZONES[timezone];
  if (!tzInfo) {
    throw new Error(`Unsupported timezone: ${timezone}`);
  }
  
  return isDST(date, timezone) ? tzInfo.utc_offset_dst : tzInfo.utc_offset_standard;
}

/**
 * Convert datetime between timezones with full DST support
 */
export function convertTimezone(
  datetime: string,
  fromTimezone: string, 
  toTimezone: string
): ConversionResult {
  try {
    // Parse input datetime (assume it's in the source timezone)
    const inputDate = new Date(datetime);
    
    if (isNaN(inputDate.getTime())) {
      throw new Error('Invalid datetime format');
    }
    
    // Get timezone info
    const fromTz = CANADIAN_TIMEZONES[fromTimezone];
    const toTz = CANADIAN_TIMEZONES[toTimezone];
    
    if (!fromTz || !toTz) {
      throw new Error(`Unsupported timezone: ${!fromTz ? fromTimezone : toTimezone}`);
    }
    
    // Determine DST status for both timezones
    const isDstOriginal = isDST(inputDate, fromTimezone);
    const isDstTarget = isDST(inputDate, toTimezone);
    
    // Get current offsets
    const fromOffset = getCurrentOffset(inputDate, fromTimezone);
    const toOffset = getCurrentOffset(inputDate, toTimezone);
    
    // Calculate the difference
    const offsetDifference = toOffset - fromOffset; // In minutes
    
    // Convert the time
    const convertedDate = new Date(inputDate.getTime() + offsetDifference * 60 * 1000);
    
    // Format the result
    const result: ConversionResult = {
      original_datetime: inputDate.toISOString().slice(0, 19).replace('T', ' '),
      original_timezone: fromTimezone,
      converted_datetime: convertedDate.toISOString().slice(0, 19).replace('T', ' '),
      converted_timezone: toTimezone,
      offset_difference_hours: offsetDifference / 60,
      is_dst_original: isDstOriginal,
      is_dst_target: isDstTarget
    };
    
    // Add warnings for DST transitions
    if (isDstOriginal !== isDstTarget) {
      result.warning = 'DST difference detected - verify times around DST transition dates';
    }
    
    return result;
    
  } catch (error) {
    throw new Error(`Timezone conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Convert booking time to user's timezone for display
 */
export function convertBookingToUserTimezone(
  bookingDate: string,
  bookingTime: string,
  providerTimezone: string,
  userTimezone: string
): {
  user_date: string;
  user_time: string;
  timezone_difference: string;
  warning?: string;
} {
  const bookingDateTime = `${bookingDate} ${bookingTime}`;
  
  const conversion = convertTimezone(bookingDateTime, providerTimezone, userTimezone);
  
  const [userDate, userTime] = conversion.converted_datetime.split(' ');
  
  const diffHours = Math.abs(conversion.offset_difference_hours);
  const direction = conversion.offset_difference_hours > 0 ? 'ahead' : 'behind';
  
  return {
    user_date: userDate,
    user_time: userTime,
    timezone_difference: `${diffHours} hours ${direction}`,
    warning: conversion.warning
  };
}

/**
 * Validate timezone booking conflicts across different zones
 */
export function validateCrossTimezoneBooking(
  bookingDate: string,
  bookingTime: string,
  duration: number,
  providerTimezone: string,
  existingBookings: Array<{
    booking_date: string;
    start_time: string;
    end_time: string;
    client_timezone: string;
  }>
): {
  valid: boolean;
  conflicts: string[];
  warnings: string[];
} {
  const conflicts: string[] = [];
  const warnings: string[] = [];
  
  const bookingDateTime = `${bookingDate} ${bookingTime}`;
  const bookingStart = new Date(bookingDateTime);
  const bookingEnd = new Date(bookingStart.getTime() + duration * 60 * 1000);
  
  for (const existing of existingBookings) {
    const existingStart = new Date(`${existing.booking_date} ${existing.start_time}`);
    const existingEnd = new Date(`${existing.booking_date} ${existing.end_time}`);
    
    // Convert existing booking to provider's timezone for comparison
    if (existing.client_timezone !== providerTimezone) {
      try {
        const convertedStart = convertTimezone(
          `${existing.booking_date} ${existing.start_time}`,
          existing.client_timezone,
          providerTimezone
        );
        
        const convertedEnd = convertTimezone(
          `${existing.booking_date} ${existing.end_time}`, 
          existing.client_timezone,
          providerTimezone
        );
        
        const providerStart = new Date(convertedStart.converted_datetime);
        const providerEnd = new Date(convertedEnd.converted_datetime);
        
        // Check for overlap
        if (!(bookingEnd <= providerStart || bookingStart >= providerEnd)) {
          conflicts.push(
            `Conflicts with existing booking from ${existing.start_time} to ${existing.end_time} (${existing.client_timezone})`
          );
        }
        
        if (convertedStart.warning) {
          warnings.push(`DST warning for existing booking: ${convertedStart.warning}`);
        }
        
      } catch (error) {
        warnings.push(`Could not validate timezone for existing booking: ${error}`);
      }
    } else {
      // Same timezone - direct comparison
      if (!(bookingEnd <= existingStart || bookingStart >= existingEnd)) {
        conflicts.push(
          `Conflicts with existing booking from ${existing.start_time} to ${existing.end_time}`
        );
      }
    }
  }
  
  return {
    valid: conflicts.length === 0,
    conflicts,
    warnings
  };
}

/**
 * Get all supported timezones
 */
export function getSupportedTimezones(): TimezoneInfo[] {
  return Object.values(CANADIAN_TIMEZONES);
}

/**
 * Format time for display in user's timezone
 */
export function formatTimeForDisplay(
  time: string,
  timezone: string,
  use24Hour: boolean = false
): string {
  try {
    const [hours, minutes] = time.split(':').map(Number);
    
    if (use24Hour) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    
    const tzInfo = CANADIAN_TIMEZONES[timezone];
    const tzAbbr = tzInfo ? 
      (isDST(new Date(), timezone) ? 
        tzInfo.timezone_name.replace('Time', '').trim() + 'DT' : 
        tzInfo.timezone_name.replace('Time', '').trim() + 'ST'
      ) : timezone.split('/')[1];
    
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period} ${tzAbbr}`;
    
  } catch (error) {
    return time; // Fallback to original format
  }
}

/**
 * Calculate business hours overlap between provider and client timezones
 */
export function findBusinessHoursOverlap(
  providerTimezone: string,
  providerStart: string,
  providerEnd: string,
  clientTimezone: string,
  clientPreferredStart: string = '09:00:00',
  clientPreferredEnd: string = '17:00:00'
): {
  overlap_start: string;
  overlap_end: string;
  overlap_duration_hours: number;
  recommendations: string[];
} {
  // Convert provider business hours to client timezone
  const today = new Date().toISOString().slice(0, 10);
  
  const providerStartInClient = convertTimezone(
    `${today} ${providerStart}`,
    providerTimezone,
    clientTimezone
  );
  
  const providerEndInClient = convertTimezone(
    `${today} ${providerEnd}`,
    providerTimezone, 
    clientTimezone
  );
  
  // Extract just the time parts
  const providerStartTime = providerStartInClient.converted_datetime.split(' ')[1];
  const providerEndTime = providerEndInClient.converted_datetime.split(' ')[1];
  
  // Calculate overlap
  const overlapStart = maxTime(providerStartTime, clientPreferredStart);
  const overlapEnd = minTime(providerEndTime, clientPreferredEnd);
  
  const overlapDuration = calculateDurationHours(overlapStart, overlapEnd);
  
  const recommendations: string[] = [];
  
  if (overlapDuration <= 0) {
    recommendations.push('No business hours overlap - consider flexible scheduling');
  } else if (overlapDuration < 2) {
    recommendations.push('Limited overlap window - book in advance');
  } else if (overlapDuration >= 6) {
    recommendations.push('Excellent scheduling flexibility');
  }
  
  return {
    overlap_start: overlapStart,
    overlap_end: overlapEnd,
    overlap_duration_hours: Math.max(0, overlapDuration),
    recommendations
  };
}

// Helper functions
function maxTime(time1: string, time2: string): string {
  return time1 > time2 ? time1 : time2;
}

function minTime(time1: string, time2: string): string {
  return time1 < time2 ? time1 : time2;
}

function calculateDurationHours(startTime: string, endTime: string): number {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  return (end - start) / 60;
}

function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}