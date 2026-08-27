import type { Journey, GPSPoint } from '../../types';
import { calculateTotalDistance } from '../../features/timeline/distance';

function createSyntheticJourney(
  title: string,
  rawCoords: [number, number][],
  startTimeStr: string,
  stepMinutes: number
): Journey & { title: string; description: string } {
  const startDate = new Date(startTimeStr);
  
  const points: GPSPoint[] = rawCoords.map(([lat, lng], i) => {
    const timestamp = new Date(startDate.getTime() + i * stepMinutes * 60 * 1000).toISOString();
    return {
      lat,
      lng,
      timestamp,
      accuracy: 10 + Math.random() * 5
    };
  });

  const totalDistanceMeters = calculateTotalDistance(points);
  const startTime = points[0].timestamp;
  const endTime = points[points.length - 1].timestamp;
  const durationMs = new Date(endTime!).getTime() - new Date(startTime!).getTime();

  return {
    title,
    description: `${(totalDistanceMeters / 1000).toFixed(1)} km · ${points.length} GPS waypoints`,
    points,
    totalDistanceMeters,
    startTime,
    endTime,
    durationMs
  };
}

// 1. Pacific Coast Scenic Highway (SF to Monterey Bay)
export const samplePacificCoast = createSyntheticJourney(
  'Pacific Coast Highway',
  [
    [37.7749, -122.4194],
    [37.7558, -122.4467],
    [37.7126, -122.4842],
    [37.6624, -122.4938],
    [37.6041, -122.4952],
    [37.5028, -122.4764],
    [37.4636, -122.4286],
    [37.3688, -122.3986],
    [37.2412, -122.4082],
    [37.1089, -122.3392],
    [36.9741, -122.0308],
    [36.9389, -121.8492],
    [36.8524, -121.7824],
    [36.7212, -121.7786],
    [36.6002, -121.8947]
  ],
  '2024-06-15T09:00:00Z',
  12
);

// 2. Tokyo Urban Discovery (Shibuya -> Shinjuku -> Imperial Palace -> Asakusa)
export const sampleTokyoDiscovery = createSyntheticJourney(
  'Tokyo City Tour',
  [
    [35.6595, 139.7005], // Shibuya Crossing
    [35.6698, 139.7046], // Harajuku
    [35.6895, 139.6917], // Shinjuku
    [35.6948, 139.7289], // Ichigaya
    [35.6852, 139.7528], // Imperial Palace
    [35.6719, 139.7640], // Ginza
    [35.6812, 139.7671], // Tokyo Station
    [35.6983, 139.7731], // Akihabara
    [35.7100, 139.7744], // Ueno Park
    [35.7148, 139.7967]  // Senso-ji, Asakusa
  ],
  '2024-05-10T11:00:00Z',
  15
);

// 3. Alpine Mountain Pass (Interlaken -> Lauterbrunnen -> Grindelwald -> Zermatt)
export const sampleAlpinePass = createSyntheticJourney(
  'Swiss Alps Mountain Pass',
  [
    [46.6863, 7.8632], // Interlaken
    [46.6432, 7.8924], // Wilderswil
    [46.5935, 7.9091], // Lauterbrunnen
    [46.5786, 7.9624], // Wengen
    [46.5851, 8.0124], // Kleine Scheidegg
    [46.6242, 8.0414], // Grindelwald
    [46.5386, 8.1215], // Grimsel Pass
    [46.4215, 8.0124], // Brig
    [46.3124, 7.8214], // Visp
    [46.0207, 7.7491]  // Zermatt (Matterhorn View)
  ],
  '2024-07-22T08:30:00Z',
  25
);

// 4. Trans-Continental Cross-Country (New York to Los Angeles — 4,500+ km)
export const sampleCrossCountry = createSyntheticJourney(
  'Trans-Continental Route',
  [
    [40.7128, -74.0060], // New York, NY
    [40.4406, -79.9959], // Pittsburgh, PA
    [39.9612, -82.9988], // Columbus, OH
    [39.7684, -86.1581], // Indianapolis, IN
    [38.6270, -90.1994], // St. Louis, MO
    [39.0997, -94.5786], // Kansas City, MO
    [39.7392, -104.9903], // Denver, CO
    [39.5501, -107.3248], // Glenwood Springs, CO
    [38.5733, -109.5498], // Moab / Arches, UT
    [37.1041, -113.5841], // St. George, UT
    [36.1699, -115.1398], // Las Vegas, NV
    [34.8958, -117.0173], // Barstow, CA
    [34.0522, -118.2437], // Los Angeles, CA
    [34.0195, -118.4912]  // Santa Monica Pier (End of Route 66)
  ],
  '2024-08-01T06:00:00Z',
  180
);

export const ALL_SAMPLES = [
  samplePacificCoast,
  sampleTokyoDiscovery,
  sampleAlpinePass,
  sampleCrossCountry
];

// Default sample for quick one-click load
export const sampleJourney: Journey = samplePacificCoast;
