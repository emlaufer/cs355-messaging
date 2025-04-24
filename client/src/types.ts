export interface User {
  _id: string;
  name: string;
  avatar: string;
  publicKey: string;
}

export interface Post {
  _id: string;
  userIds: string[];
  message: string;
  timestamp: string;
}
