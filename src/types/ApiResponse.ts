// Plain shape of a message as it arrives over the API (safe to use in client code)
export interface MessageData {
  _id: string;
  content: string;
  createdAt: string;
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  isAcceptingMessage?: boolean;
  messages?: Array<MessageData>;
}
