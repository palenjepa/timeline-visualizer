import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { GPSPoint, Journey } from '../../../types';
import { calculateDistance, calculateBearing } from '../distance';

export type AnimationStatus = 'idle' | 'ready' | 'playing' | 'paused' | 'completed';

export interface InterpolatedState {
  currentPosition: GPSPoint | null;
  traveledPath: [number, number][];
  traveledDistanceMeters: number;
  currentTimestamp?: string;
  heading?: number; // Heading bearing in degrees (0 - 360)
}

export interface JourneyTrackData {
  points: GPSPoint[];
  coords: [number, number][];
  cumulativeDistances: number[];
  totalDistance: number;
}

/**
 * Prepares cumulative distances along points for constant-speed geographic interpolation.
 */
export function prepareJourneyTrack(points: GPSPoint[]): JourneyTrackData {
  if (!points || points.length === 0) {
    return { points: [], coords: [], cumulativeDistances: [], totalDistance: 0 };
  }

  const coords: [number, number][] = new Array(points.length);
  const cumulativeDistances: number[] = new Array(points.length);
  cumulativeDistances[0] = 0;
  coords[0] = [points[0].lat, points[0].lng];

  let total = 0;

  for (let i = 1; i < points.length; i++) {
    coords[i] = [points[i].lat, points[i].lng];
    const dist = calculateDistance(
      points[i - 1].lat,
      points[i - 1].lng,
      points[i].lat,
      points[i].lng
    );
    total += dist;
    cumulativeDistances[i] = total;
  }

  return {
    points,
    coords,
    cumulativeDistances,
    totalDistance: total
  };
}

/**
 * High-performance binary-search interpolation of coordinate position along the track (O(log N)).
 */
export function interpolateAtProgress(
  track: JourneyTrackData,
  progress: number
): InterpolatedState {
  const { points, coords, cumulativeDistances, totalDistance } = track;
  const clampedProgress = Math.max(0, Math.min(1, progress));

  if (points.length === 0) {
    return { currentPosition: null, traveledPath: [], traveledDistanceMeters: 0 };
  }

  if (points.length === 1 || totalDistance === 0) {
    return {
      currentPosition: points[0],
      traveledPath: [[points[0].lat, points[0].lng]],
      traveledDistanceMeters: 0,
      currentTimestamp: points[0].timestamp
    };
  }

  if (clampedProgress <= 0) {
    return {
      currentPosition: points[0],
      traveledPath: [[points[0].lat, points[0].lng]],
      traveledDistanceMeters: 0,
      currentTimestamp: points[0].timestamp
    };
  }

  if (clampedProgress >= 1) {
    return {
      currentPosition: points[points.length - 1],
      traveledPath: coords || points.map(p => [p.lat, p.lng]),
      traveledDistanceMeters: totalDistance,
      currentTimestamp: points[points.length - 1].timestamp
    };
  }

  const targetDist = clampedProgress * totalDistance;

  // Binary search for segment index where cumulativeDistances[i] >= targetDist in O(log N)
  let low = 1;
  let high = cumulativeDistances.length - 1;
  let segIndex = high;

  while (low <= high) {
    const mid = (low + high) >> 1;
    if (cumulativeDistances[mid] >= targetDist) {
      segIndex = mid;
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }

  const prevIndex = segIndex - 1;
  const prevDist = cumulativeDistances[prevIndex];
  const nextDist = cumulativeDistances[segIndex];
  const segmentLength = nextDist - prevDist;

  const segmentRatio = segmentLength > 0 ? (targetDist - prevDist) / segmentLength : 0;

  const p1 = points[prevIndex];
  const p2 = points[segIndex];

  const lat = p1.lat + (p2.lat - p1.lat) * segmentRatio;
  const lng = p1.lng + (p2.lng - p1.lng) * segmentRatio;

  let currentTimestamp = p1.timestamp;
  if (p1.timestamp && p2.timestamp) {
    const t1 = new Date(p1.timestamp).getTime();
    const t2 = new Date(p2.timestamp).getTime();
    const interpolatedTime = t1 + (t2 - t1) * segmentRatio;
    currentTimestamp = new Date(interpolatedTime).toISOString();
  }

  // Pre-allocated coordinate slice without re-mapping objects on every frame
  const traveledPath: [number, number][] = (coords ? coords.slice(0, segIndex) : points.slice(0, segIndex).map(p => [p.lat, p.lng]));
  traveledPath.push([lat, lng]);

  const heading = calculateBearing(p1.lat, p1.lng, p2.lat, p2.lng);

  return {
    currentPosition: {
      lat,
      lng,
      timestamp: currentTimestamp
    },
    traveledPath,
    traveledDistanceMeters: targetDist,
    currentTimestamp,
    heading
  };
}

export interface UseJourneyAnimatorOptions {
  baseDurationMs?: number; // Base duration for full route at 1x speed (default 25000ms)
}

export function useJourneyAnimator(
  journey: Journey | null,
  options: UseJourneyAnimatorOptions = {}
) {
  const baseDurationMs = options.baseDurationMs ?? 25000;
  
  const [status, setStatus] = useState<AnimationStatus>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [speed, setSpeed] = useState<number>(1);

  const trackData = useMemo<JourneyTrackData>(() => {
    if (!journey || journey.points.length === 0) {
      return { points: [], coords: [], cumulativeDistances: [], totalDistance: 0 };
    }
    return prepareJourneyTrack(journey.points);
  }, [journey]);

  // Reset or ready state when journey changes
  useEffect(() => {
    if (journey && journey.points.length > 0) {
      setStatus('ready');
      setProgress(0);
    } else {
      setStatus('idle');
      setProgress(0);
    }
  }, [journey]);

  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const progressRef = useRef<number>(0);
  const statusRef = useRef<AnimationStatus>(status);
  const speedRef = useRef<number>(speed);

  // Keep refs updated with current state
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  const stopLoop = useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    lastTimeRef.current = null;
  }, []);

  const animate = useCallback((now: number) => {
    if (statusRef.current !== 'playing') {
      stopLoop();
      return;
    }

    if (lastTimeRef.current === null) {
      lastTimeRef.current = now;
    }

    const delta = now - lastTimeRef.current;
    lastTimeRef.current = now;

    const effectiveDuration = baseDurationMs / speedRef.current;
    const addedProgress = delta / effectiveDuration;
    const nextProgress = progressRef.current + addedProgress;

    if (nextProgress >= 1) {
      progressRef.current = 1;
      setProgress(1);
      setStatus('completed');
      stopLoop();
      return;
    }

    progressRef.current = nextProgress;
    setProgress(nextProgress);

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [baseDurationMs, stopLoop]);

  const play = useCallback(() => {
    if (status === 'completed' || progressRef.current >= 1) {
      progressRef.current = 0;
      setProgress(0);
    }
    setStatus('playing');
  }, [status]);

  const pause = useCallback(() => {
    setStatus('paused');
    stopLoop();
  }, [stopLoop]);

  const togglePlay = useCallback(() => {
    if (status === 'playing') {
      pause();
    } else {
      play();
    }
  }, [status, pause, play]);

  const restart = useCallback(() => {
    stopLoop();
    progressRef.current = 0;
    setProgress(0);
    setStatus('ready');
  }, [stopLoop]);

  const seek = useCallback((newProgress: number) => {
    const clamped = Math.max(0, Math.min(1, newProgress));
    progressRef.current = clamped;
    setProgress(clamped);

    if (clamped >= 1) {
      setStatus('completed');
      stopLoop();
    } else if (statusRef.current === 'completed') {
      setStatus('paused');
    }
  }, [stopLoop]);

  const reset = useCallback(() => {
    stopLoop();
    progressRef.current = 0;
    setProgress(0);
    setStatus(journey && journey.points.length > 0 ? 'ready' : 'idle');
  }, [journey, stopLoop]);

  // Effect to manage RAF loop start when status becomes 'playing'
  useEffect(() => {
    if (status === 'playing') {
      lastTimeRef.current = null;
      animationFrameRef.current = requestAnimationFrame(animate);
    } else {
      stopLoop();
    }

    return () => {
      stopLoop();
    };
  }, [status, animate, stopLoop]);

  // Derive interpolated state from progress
  const interpolatedState = useMemo<InterpolatedState>(() => {
    return interpolateAtProgress(trackData, progress);
  }, [trackData, progress]);

  return {
    status,
    progress,
    speed,
    setSpeed,
    play,
    pause,
    togglePlay,
    restart,
    seek,
    reset,
    interpolatedState,
    totalDistanceMeters: trackData.totalDistance
  };
}
