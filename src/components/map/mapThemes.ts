export interface MapTheme {
  id: string;
  name: string;
  icon: string;
  url: string;
  referenceUrl?: string; // Optional transparent label layer (e.g. city names & highway labels)
  attribution: string;
  maxZoom?: number;
  subdomains?: string[];
  cssFilter?: string; // CSS filter applied to tile pane for color transformation
  trackColors: {
    neonGlow: string;
    laserGlow: string;
    coreLine: string;
  };
}

export const MAP_THEMES: Record<string, MapTheme> = {
  osm: {
    id: 'osm',
    name: 'Jalanan',
    icon: '🧭',
    url: 'https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png',
    attribution: '&copy; Stadia Maps &copy; OpenMapTiles &copy; OpenStreetMap',
    trackColors: {
      neonGlow: 'rgba(220, 38, 38, 0.35)',
      laserGlow: '#dc2626',
      coreLine: '#ffffff'
    }
  },
  dark: {
    id: 'dark',
    name: 'Midnight',
    icon: '🌙',
    url: 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png',
    attribution: '&copy; Stadia Maps &copy; OpenMapTiles &copy; OpenStreetMap',
    trackColors: {
      neonGlow: 'rgba(99, 102, 241, 0.4)',
      laserGlow: '#818cf8',
      coreLine: '#ffffff'
    }
  },
  satellite: {
    id: 'satellite',
    name: 'Satelit',
    icon: '🛰️',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    referenceUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri, Maxar, Earthstar Geographics',
    trackColors: {
      neonGlow: 'rgba(236, 72, 153, 0.5)',
      laserGlow: '#06b6d4',
      coreLine: '#ffffff'
    }
  },
  terrain: {
    id: 'terrain',
    name: 'Topografi',
    icon: '🌍',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom',
    trackColors: {
      neonGlow: 'rgba(56, 189, 248, 0.5)',
      laserGlow: '#38bdf8',
      coreLine: '#ffffff'
    }
  }
};

export const DEFAULT_THEME_ID = 'dark';
