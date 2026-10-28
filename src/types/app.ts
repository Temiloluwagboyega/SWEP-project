export type Coordinates = {
  latitude: number;
  longitude: number;
  accuracy: number | null;
};
export type TimelineEvent = {
  toStatus: string;
  createdAt: string;
  publicNote: string | null;
  actorLabel: string;
  action: string;
  internalNote?: string | null;
};
export type ReportView = {
  ref: string;
  category: string;
  status: string;
  urgent: boolean;
  createdAt: string;
  id?: string;
  description?: string;
  location?: { id: string; name: string; area: string };
  locationNote?: string | null;
  coordinates?: Coordinates | null;
  occurredAt?: string;
  channel?: string;
  confidential?: boolean;
  updatedAt?: string;
  editable?: boolean;
  reporter?: { id: string; name: string; email: string };
  assignee?: { id: string; name: string } | null;
  events?: TimelineEvent[];
};
