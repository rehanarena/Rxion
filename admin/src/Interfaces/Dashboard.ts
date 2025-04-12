export interface Metrics {
    totalPatients: number;
    totalDoctors: number;
    totalAppointments: number;
    totalEarnings: number;
  }

  export interface RevenueData {
    _id: {
      year: number;
      month?: number;
      day?: number;
      week?: number;
    };
    totalRevenue: number;
  }

  export interface AppointmentStatus {
    _id: {
      status: string;
    };
    count: number;
  }

  export interface PaymentStatus {
    _id: {
      payment: string;
    };
    count: number;
  }

  export 
  
  interface TopDoctor {
    docId: string;
    name: string;
    totalAppointments: number;
    totalEarnings: number;
  }
  
  