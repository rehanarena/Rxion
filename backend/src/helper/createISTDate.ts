import moment from "moment";

const createISTDate = (baseDate: Date, timeStr: string): string => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const newDate = new Date(baseDate);
  newDate.setHours(hours, minutes, 0, 0);
  // Format to a string like "10:00 AM"
  return moment(newDate).utcOffset(330).format("hh:mm A");
};

export default createISTDate;
