// src/utils/timeHelpers.ts
import moment from "moment";

/**
 * Generates an array of slot times (e.g., every 30 minutes) between two times.
 * @param baseDate - The base date for the session.
 * @param sessionStart - The session's start time (e.g., "10:00").
 * @param sessionEnd - The session's end time (e.g., "12:00").
 * @param interval - The interval in minutes between each slot (default: 30).
 * @returns An array of formatted time slot strings.
 */
export const generateTimeSlots = (
  baseDate: Date,
  sessionStart: string,
  sessionEnd: string,
  interval: number = 30
): string[] => {
  const slots: string[] = [];
  // Create Date objects for the session start and end.
  const [startHours, startMinutes] = sessionStart.split(':').map(Number);
  const [endHours, endMinutes] = sessionEnd.split(':').map(Number);
  
  const startDate = new Date(baseDate);
  startDate.setHours(startHours, startMinutes, 0, 0);
  const endDate = new Date(baseDate);
  endDate.setHours(endHours, endMinutes, 0, 0);
  
  // Generate slot times until reaching endDate.
  while (startDate < endDate) {
    slots.push(moment(startDate).utcOffset(330).format("hh:mm A"));
    startDate.setMinutes(startDate.getMinutes() + interval);
  }
  return slots;
};
