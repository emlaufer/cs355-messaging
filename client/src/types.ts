export interface User {
  id: string;
  name: string;
  avatar: string;
  role: string;
}

export interface Post {
  id: string;
  userIds: string[]; // Changed from userId to userIds array
  message: string;
  timestamp: string;
}
