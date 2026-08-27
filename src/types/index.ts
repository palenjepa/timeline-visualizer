export type GPSPoint = {
  lat: number;
  lng: number;
  timestamp?: string; // ISO 8601 string
  accuracy?: number; // Accuracy radius in meters, optional but common in exports
};

export type Journey = {
  points: GPSPoint[];
  totalDistanceMeters: number;
  startTime?: string;
  endTime?: string;
  durationMs?: number;
};
