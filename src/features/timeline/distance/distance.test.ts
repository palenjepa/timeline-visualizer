import { describe, it, expect } from 'vitest';
import { calculateDistance, calculateTotalDistance } from './index';
import { getJourneyBounds } from '../bounds';
import { prepareJourneyTrack, interpolateAtProgress } from '../animator';
import type { GPSPoint } from '../../../types';

describe('Geographic Calculations & Interpolator', () => {
  it('calculates Haversine distance between two known coordinates accurately', () => {
    // London (51.5074, -0.1278) to Paris (48.8566, 2.3522) is approx 343.5 km
    const distanceMeters = calculateDistance(51.5074, -0.1278, 48.8566, 2.3522);
    const distanceKm = distanceMeters / 1000;
    expect(distanceKm).toBeGreaterThan(340);
    expect(distanceKm).toBeLessThan(350);
  });

  it('calculates total distance of a route', () => {
    const points: GPSPoint[] = [
      { lat: 0, lng: 0 },
      { lat: 0, lng: 1 }, // ~111 km at equator
      { lat: 0, lng: 2 }  // ~111 km at equator
    ];
    const total = calculateTotalDistance(points);
    expect(total / 1000).toBeCloseTo(222, -1);
  });

  it('computes correct geographic bounding box', () => {
    const points: GPSPoint[] = [
      { lat: 37.7749, lng: -122.4194 },
      { lat: 36.6002, lng: -121.8947 }
    ];
    const bounds = getJourneyBounds(points);
    expect(bounds).toEqual([
      [36.6002, -122.4194], // SouthWest
      [37.7749, -121.8947]  // NorthEast
    ]);
  });

  it('interpolates intermediate positions accurately at progress steps', () => {
    const points: GPSPoint[] = [
      { lat: 10, lng: 20, timestamp: '2024-01-01T10:00:00Z' },
      { lat: 10, lng: 30, timestamp: '2024-01-01T11:00:00Z' }
    ];

    const track = prepareJourneyTrack(points);
    expect(track.totalDistance).toBeGreaterThan(0);

    // Midpoint (progress = 0.5)
    const mid = interpolateAtProgress(track, 0.5);
    expect(mid.currentPosition?.lat).toBeCloseTo(10);
    expect(mid.currentPosition?.lng).toBeCloseTo(25);
    expect(mid.traveledDistanceMeters).toBeCloseTo(track.totalDistance / 2);
    expect(mid.currentTimestamp).toBe('2024-01-01T10:30:00.000Z');

    // Start (progress = 0)
    const start = interpolateAtProgress(track, 0);
    expect(start.currentPosition?.lng).toBe(20);

    // End (progress = 1)
    const end = interpolateAtProgress(track, 1);
    expect(end.currentPosition?.lng).toBe(30);
  });
});
