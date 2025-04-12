export interface ChatFile {
    url: string;
    type: string;
    fileName: string;
  }

  export interface UserStatus {
    online: boolean;
    lastSeen?: Date;
  }
  