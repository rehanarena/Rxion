import moment from "moment";

export const generateTimeSlots = (
  baseDate: Date,
  sessionStart: string,
  sessionEnd: string,
  interval: number = 30
): string[] => {
  const slots: string[] = [];
  const [startHours, startMinutes] = sessionStart.split(':').map(Number);
  const [endHours, endMinutes] = sessionEnd.split(':').map(Number);
  
  const startDate = new Date(baseDate);
  startDate.setHours(startHours, startMinutes, 0, 0);
  const endDate = new Date(baseDate);
  endDate.setHours(endHours, endMinutes, 0, 0);

  while (startDate < endDate) {
    slots.push(moment(startDate).utcOffset(330).format("hh:mm A"));
    startDate.setMinutes(startDate.getMinutes() + interval);
  }
  return slots;
};
