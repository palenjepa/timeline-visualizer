import type { GPSPoint, Journey } from '../../../types';
import { calculateTotalDistance } from '../distance';

type ParseResult = {
  success: boolean;
  journey?: Journey;
  error?: string;
  sourceFormat?: string;
};

// Converts Google's E7 format to standard degrees
const parseE7 = (val: number | string | undefined): number | null => {
  if (val === undefined || val === null) return null;
  const num = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(num)) return null;
  if (Math.abs(num) > 900) return num / 1e7;
  return num;
};

// Parses string coordinates like "37.7749°, -122.4194°" or "geo:37.7749,-122.4194" or "37.7749, -122.4194"
const parseLatLngString = (str: string | undefined): { lat: number; lng: number } | null => {
  if (!str || typeof str !== 'string') return null;
  const clean = str.replace(/geo:/i, '').replace(/°/g, '').trim();
  const parts = clean.split(/[,;\s]+/).map(p => parseFloat(p.trim())).filter(p => !isNaN(p));
  if (parts.length >= 2 && Math.abs(parts[0]) <= 90 && Math.abs(parts[1]) <= 180) {
    return { lat: parts[0], lng: parts[1] };
  }
  return null;
};

// Extracts timestamp safely from any object or field
const extractTimestamp = (obj: any): string | undefined => {
  if (!obj) return undefined;
  
  if (typeof obj === 'string') {
    const d = new Date(obj);
    if (!isNaN(d.getTime())) return d.toISOString();
    const num = Number(obj);
    if (!isNaN(num) && num > 100000000000) return new Date(num).toISOString();
    return undefined;
  }

  if (typeof obj === 'number' && obj > 100000000000) {
    return new Date(obj).toISOString();
  }

  const raw =
    obj.timestamp ||
    obj.startTime ||
    obj.endTime ||
    obj.startTimestamp ||
    obj.endTimestamp ||
    obj.time ||
    obj.pointTime ||
    obj.timestampMs ||
    obj.startTimestampMs ||
    obj.endTimestampMs ||
    obj.start?.timestamp ||
    obj.duration?.startTimestamp ||
    obj.duration?.startTime;

  if (!raw) return undefined;

  if (typeof raw === 'string') {
    const d = new Date(raw);
    if (!isNaN(d.getTime())) return d.toISOString();
    const num = Number(raw);
    if (!isNaN(num) && num > 100000000000) return new Date(num).toISOString();
  }

  if (typeof raw === 'number' && raw > 100000000000) {
    return new Date(raw).toISOString();
  }

  return undefined;
};

// Helper to extract a coordinate point from various nested Google location shapes
const extractPointFromUnknown = (item: any): GPSPoint | null => {
  if (!item) return null;

  // Direct lat/lng properties
  let lat = item.lat ?? item.latitude ?? parseE7(item.latitudeE7) ?? parseE7(item.latE7);
  let lng = item.lng ?? item.longitude ?? parseE7(item.longitudeE7) ?? parseE7(item.lngE7);

  if (typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng)) {
    return {
      lat,
      lng,
      timestamp: extractTimestamp(item),
      accuracy: item.accuracy
    };
  }

  // String latLng e.g. item.latLng = "37.7749°, -122.4194°" or item.point = "..."
  const latLngStr = item.latLng || item.point || item.geo || item.location;
  if (typeof latLngStr === 'string') {
    const parsed = parseLatLngString(latLngStr);
    if (parsed) {
      return {
        lat: parsed.lat,
        lng: parsed.lng,
        timestamp: extractTimestamp(item)
      };
    }
  }

  // Nested location objects
  if (item.location || item.point || item.placeLocation || item.center || item.position) {
    const nested = extractPointFromUnknown(item.location || item.point || item.placeLocation || item.center || item.position);
    if (nested) {
      return {
        ...nested,
        timestamp: nested.timestamp || extractTimestamp(item)
      };
    }
  }

  return null;
};

export function parseTimelineData(data: any): ParseResult {
  if (!data) {
    return { success: false, error: 'File is empty.' };
  }

  if (Array.isArray(data) && data.length === 0) {
    return {
      success: false,
      error: 'The uploaded JSON file is an empty array (`[]`).\n\nThis usually means Google Timeline was turned off or had no location data recorded for this period.'
    };
  }

  let points: GPSPoint[] = [];
  let sourceFormat = 'Unknown';

  try {
    // 1. Records.json format (Google Takeout raw Location History)
    if (data.locations && Array.isArray(data.locations)) {
      sourceFormat = 'Records.json';
      points = data.locations
        .map((loc: any) => extractPointFromUnknown(loc))
        .filter((p: any): p is GPSPoint => p !== null);
    } 
    // 2. Google Takeout Semantic Location History or On-Device semanticSegments array / object
    else if (data.timelineObjects || data.semanticSegments || (data.rawSignals && Array.isArray(data.rawSignals))) {
      sourceFormat = data.semanticSegments ? 'semanticSegments' : data.timelineObjects ? 'timelineObjects' : 'rawSignals';
      const items = data.timelineObjects || data.semanticSegments || data.rawSignals;

      items.forEach((obj: any) => {
        const segStart = extractTimestamp(obj.duration) || extractTimestamp(obj);
        const segEnd = extractTimestamp(obj.duration?.endTimestamp || obj.duration?.endTime || obj.endTime || obj.endTimestamp);

        // Activity segments (trips, movement)
        if (obj.activitySegment || obj.activity) {
          const seg = obj.activitySegment || obj.activity;
          
          if (seg.startLocation || seg.start) {
            const pt = extractPointFromUnknown(seg.startLocation || seg.start);
            if (pt) points.push({ ...pt, timestamp: pt.timestamp || segStart });
          }

          // Waypoints or timelinePath array
          const path = seg.waypointPath?.waypoints || seg.simplifiedRawPath?.points || seg.timelinePath;
          if (Array.isArray(path)) {
            const total = path.length;
            const t0 = segStart ? new Date(segStart).getTime() : null;
            const t1 = segEnd ? new Date(segEnd).getTime() : null;

            path.forEach((wp: any, idx: number) => {
              const pt = extractPointFromUnknown(wp);
              if (pt) {
                if (!pt.timestamp && t0 !== null && t1 !== null && total > 1) {
                  pt.timestamp = new Date(t0 + (t1 - t0) * (idx / (total - 1))).toISOString();
                } else if (!pt.timestamp && t0 !== null) {
                  pt.timestamp = new Date(t0).toISOString();
                }
                points.push(pt);
              }
            });
          }

          if (seg.endLocation || seg.end) {
            const pt = extractPointFromUnknown(seg.endLocation || seg.end);
            if (pt) points.push({ ...pt, timestamp: pt.timestamp || segEnd });
          }
        }
        // Place visits
        else if (obj.placeVisit || obj.visit) {
          const visit = obj.placeVisit || obj.visit;
          const loc = visit.location || visit.topCandidate?.placeLocation || visit.center;
          const pt = extractPointFromUnknown(loc);
          if (pt) points.push({ ...pt, timestamp: pt.timestamp || segStart });
        }
        // Direct raw signals
        else if (obj.position || obj.location) {
          const pt = extractPointFromUnknown(obj.position || obj.location);
          if (pt) points.push({ ...pt, timestamp: pt.timestamp || segStart });
        }
      });
    }
    // 3. Array of Semantic Segments or Generic Array (Common in Mobile Exports)
    else if (Array.isArray(data)) {
      sourceFormat = 'Timeline Array';

      data.forEach((item: any) => {
        const segStart = extractTimestamp(item.duration) || extractTimestamp(item);
        const segEnd = extractTimestamp(item.duration?.endTimestamp || item.duration?.endTime || item.endTime || item.endTimestamp);

        // Check if item is a semantic segment object (mobile on-device format)
        if (item.timelinePath || item.activity || item.visit || item.activitySegment || item.placeVisit) {
          // Extract from timelinePath
          if (Array.isArray(item.timelinePath)) {
            const total = item.timelinePath.length;
            const t0 = segStart ? new Date(segStart).getTime() : null;
            const t1 = segEnd ? new Date(segEnd).getTime() : null;

            item.timelinePath.forEach((subPt: any, idx: number) => {
              const pt = extractPointFromUnknown(subPt);
              if (pt) {
                if (!pt.timestamp && t0 !== null && t1 !== null && total > 1) {
                  pt.timestamp = new Date(t0 + (t1 - t0) * (idx / (total - 1))).toISOString();
                } else if (!pt.timestamp && t0 !== null) {
                  pt.timestamp = new Date(t0).toISOString();
                }
                points.push(pt);
              }
            });
          }
          // Extract from activity start / end
          if (item.activity?.start || item.activity?.end) {
            const p1 = extractPointFromUnknown(item.activity.start);
            const p2 = extractPointFromUnknown(item.activity.end);
            if (p1) points.push({ ...p1, timestamp: p1.timestamp || segStart });
            if (p2) points.push({ ...p2, timestamp: p2.timestamp || segEnd });
          }
          // Extract from visit
          if (item.visit?.topCandidate?.placeLocation || item.visit?.location) {
            const pt = extractPointFromUnknown(item.visit.topCandidate?.placeLocation || item.visit.location);
            if (pt) points.push({ ...pt, timestamp: pt.timestamp || segStart });
          }
        } else {
          // Direct coordinate item
          const pt = extractPointFromUnknown(item);
          if (pt) points.push(pt);
        }
      });
    } 
    else {
      return { 
        success: false, 
        error: 'No supported Timeline structure was detected.\n\nMake sure the file contains valid Google Location History or GPS coordinates.' 
      };
    }

    if (points.length === 0) {
      return {
        success: false,
        error: `Detected ${sourceFormat} format, but found 0 valid coordinates.\n\nThis usually occurs if Location History / Timeline was turned off or paused on your device during the exported date range.`
      };
    }

    // Sort chronologically if timestamps are available
    points.sort((a, b) => {
      if (!a.timestamp || !b.timestamp) return 0;
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });

    // Fill in any gaps in timestamps along the route
    let lastKnownTimestamp = points.find(p => Boolean(p.timestamp))?.timestamp;
    if (lastKnownTimestamp) {
      for (let i = 0; i < points.length; i++) {
        if (!points[i].timestamp) {
          points[i].timestamp = lastKnownTimestamp;
        } else {
          lastKnownTimestamp = points[i].timestamp;
        }
      }
    }

    const totalDistanceMeters = calculateTotalDistance(points);
    
    // Find earliest and latest timestamp across all points
    const timestampedPoints = points.filter(p => Boolean(p.timestamp));
    let startTime: string | undefined;
    let endTime: string | undefined;
    let durationMs: number | undefined;

    if (timestampedPoints.length > 0) {
      startTime = timestampedPoints[0].timestamp;
      endTime = timestampedPoints[timestampedPoints.length - 1].timestamp;
      durationMs = new Date(endTime!).getTime() - new Date(startTime!).getTime();
    }

    const journey: Journey = {
      points,
      totalDistanceMeters,
      startTime,
      endTime,
      durationMs
    };

    return {
      success: true,
      journey,
      sourceFormat
    };

  } catch (err) {
    console.error('Parsing error:', err);
    return {
      success: false,
      error: 'An error occurred while parsing the file structure.'
    };
  }
}
