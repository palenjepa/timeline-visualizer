import type { GPSPoint } from '../../../types';

export function getJourneyBounds(points: GPSPoint[]): [[number, number], [number, number]] | null {
  if (!points || points.length === 0) return null;

  let minLat = points[0].lat;
  let maxLat = points[0].lat;
  let minLng = points[0].lng;
  let maxLng = points[0].lng;

  for (let i = 1; i < points.length; i++) {
    const p = points[i];
    if (p.lat < minLat) minLat = p.lat;
    if (p.lat > maxLat) maxLat = p.lat;
    if (p.lng < minLng) minLng = p.lng;
    if (p.lng > maxLng) maxLng = p.lng;
  }

  return [
    [minLat, minLng], // SouthWest
    [maxLat, maxLng], // NorthEast
  ];
}
