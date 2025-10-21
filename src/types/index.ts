// src/types/index.ts

// General types
export interface AgentResponse<T> {
  data: T;
}

export interface Message {
  role: "user" | "assistant";
  content: string;
}

// Agent-specific types
export interface LocationDetails {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  description?: string;
  icon?: string;
}

export interface RouteDetails {
  summary: string;
  distance: string;
  duration: string;
  steps: string[];
}

export type AgentResponseData =
  | { type: "location"; data: LocationDetails }
  | { type: "route"; data: RouteDetails }
  | { type: "text"; data: { text: string } };

export interface AgentResponsePayload {
  messages: Message[];
  tool_calls?: any[]; // Placeholder for potential tool calls
  error?: string;
}

export interface ChatMessage extends Message {
  id: string;
  timestamp: Date;
}

export interface AgentRequest {
  query: string;
  history: ChatMessage[];
}