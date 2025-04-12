export interface Slot {
  _id: string
  startTime: string
  endTime: string
}

export interface IBookedSlot {
    startTime: string;
    isBooked: boolean;
  }