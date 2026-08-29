import { describe, it, expect } from 'vitest';
import { parseTimelineData } from './index';

describe('Timeline Parser', () => {
  it('parses Google Takeout Records.json format with E7 coordinates', () => {
    const rawData = {
      locations: [
        {
          latitudeE7: 377749000,
          longitudeE7: -1224194000,
          timestamp: '2024-01-01T10:00:00.000Z',
          accuracy: 15
        },
        {
          latitudeE7: 377759000,
          longitudeE7: -1224184000,
          timestamp: '2024-01-01T10:05:00.000Z',
          accuracy: 10
        }
      ]
    };

    const result = parseTimelineData(rawData);
    expect(result.success).toBe(true);
    expect(result.sourceFormat).toBe('Records.json');
    expect(result.journey).toBeDefined();
    expect(result.journey?.points.length).toBe(2);
    expect(result.journey?.points[0].lat).toBeCloseTo(37.7749);
    expect(result.journey?.points[0].lng).toBeCloseTo(-122.4194);
    expect(result.journey?.totalDistanceMeters).toBeGreaterThan(0);
  });

  it('parses Google Takeout timelineObjects format (semantic segments)', () => {
    const rawData = {
      timelineObjects: [
        {
          activitySegment: {
            startLocation: { latitudeE7: 356595000, longitudeE7: 1397005000 },
            endLocation: { latitudeE7: 356895000, longitudeE7: 1396917000 },
            duration: {
              startTimestamp: '2024-05-10T11:00:00.000Z',
              endTimestamp: '2024-05-10T11:30:00.000Z'
            },
            waypointPath: {
              waypoints: [
                { latE7: 356698000, lngE7: 1397046000 }
              ]
            }
          }
        }
      ]
    };

    const result = parseTimelineData(rawData);
    expect(result.success).toBe(true);
    expect(result.sourceFormat).toBe('timelineObjects');
    expect(result.journey?.points.length).toBe(3);
    expect(result.journey?.points[0].lat).toBeCloseTo(35.6595);
  });

  it('parses Google Mobile on-device export format with timelinePath and latLng strings', () => {
    const rawData = [
      {
        timelinePath: [
          { point: "37.7749°, -122.4194°" },
          { point: "37.7558°, -122.4467°" }
        ],
        activity: {
          start: { latLng: "37.7749, -122.4194" }
        }
      }
    ];

    const result = parseTimelineData(rawData);
    expect(result.success).toBe(true);
    expect(result.journey?.points.length).toBeGreaterThanOrEqual(2);
    expect(result.journey?.points[0].lat).toBeCloseTo(37.7749);
  });

  it('parses generic coordinate array format', () => {
    const rawData = [
      { lat: 46.6863, lng: 7.8632, timestamp: '2024-07-22T08:00:00Z' },
      { lat: 46.5935, lng: 7.9091, timestamp: '2024-07-22T08:30:00Z' }
    ];

    const result = parseTimelineData(rawData);
    expect(result.success).toBe(true);
    expect(result.journey?.points.length).toBe(2);
  });

  it('handles invalid or unsupported JSON gracefully', () => {
    const rawData = { someRandomProperty: 'hello world' };
    const result = parseTimelineData(rawData);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Tidak ada struktur Linimasa yang didukung');
  });

  it('handles empty input gracefully', () => {
    const result = parseTimelineData(null);
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
