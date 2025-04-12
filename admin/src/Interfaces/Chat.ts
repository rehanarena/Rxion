export interface ChatFile {
    url: string
    type: string
    fileName: string
  }

  export interface ChatMessage {
    sender: string
    message: string
    timestamp: string 
    read?: boolean
    file?: ChatFile
  }

export interface PatientStatus {
    online: boolean
    lastSeen?: Date
  }

 export  interface MessageSummary {
    patientId: string
    patientName: string
    patientImage: string
    lastMessage: string
    timestamp: Date
  }
export interface ChatHistoryMessage {
    room: string
    patientName: string
    patientImage: string
    message: string
    timestamp: string
  }