import type { Journey, GPSPoint } from '../../types';
import { calculateTotalDistance } from '../../features/timeline/distance';

export type SampleJourney = Journey & { title: string; description: string };

function createSyntheticJourney(
  title: string,
  rawCoords: [number, number][],
  startTimeStr: string,
  stepMinutes: number
): SampleJourney {
  const startDate = new Date(startTimeStr);
  
  const points: GPSPoint[] = rawCoords.map(([lat, lng], i) => {
    const timestamp = new Date(startDate.getTime() + i * stepMinutes * 60 * 1000).toISOString();
    return {
      lat,
      lng,
      timestamp,
      accuracy: 5 + (i % 3)
    };
  });

  const totalDistanceMeters = calculateTotalDistance(points);
  const startTime = points[0].timestamp;
  const endTime = points[points.length - 1].timestamp;
  const durationMs = new Date(endTime!).getTime() - new Date(startTime!).getTime();

  return {
    title,
    description: `${(totalDistanceMeters / 1000).toFixed(1)} km · ${points.length} titik GPS`,
    points,
    totalDistanceMeters,
    startTime,
    endTime,
    durationMs
  };
}

// 1. Pacific Coast Scenic Highway (SF to Monterey Bay along California Highway 1 / Cabrillo Highway)
export const samplePacificCoast = createSyntheticJourney(
  'Jalan Raya Pesisir Pasifik',
  [
    [37.7935, -122.3965], // SF Ferry Building / Market St
    [37.7750, -122.4190], // Market St & Van Ness Ave
    [37.7730, -122.4350], // Fell St / Panhandle
    [37.7650, -122.4750], // Lincoln Way (Golden Gate Park South)
    [37.7550, -122.5080], // Great Highway / Ocean Beach
    [37.7330, -122.5020], // Sloat Blvd / SF Zoo
    [37.7050, -122.4920], // Skyline Blvd / Highway 35
    [37.6750, -122.4850], // Highway 1 / Skyline Junction (Daly City)
    [37.6450, -122.4880], // Highway 1 Manor Dr (Pacifica)
    [37.6250, -122.4920], // Highway 1 Sharp Park / Pacifica Pier
    [37.6050, -122.4980], // Highway 1 Rockaway Beach
    [37.5950, -122.5020], // Highway 1 Linda Mar Beach
    [37.5850, -122.5100], // Tom Lantos Tunnels (Devil's Slide Highway)
    [37.5400, -122.5120], // Highway 1 Montara (Main St)
    [37.5250, -122.5100], // Highway 1 Moss Beach
    [37.5000, -122.4700], // Highway 1 El Granada (Capistrano Rd)
    [37.4650, -122.4300], // Highway 1 Half Moon Bay (Highway 92 junction)
    [37.4400, -122.4250], // Highway 1 Higgins Canyon
    [37.4100, -122.4200], // Highway 1 Cowell Ranch
    [37.3250, -122.3950], // Highway 1 San Gregorio (Highway 84 junction)
    [37.2950, -122.4050], // Highway 1 Pomponio State Beach
    [37.2600, -122.4080], // Highway 1 Pescadero Creek Rd
    [37.2250, -122.4000], // Highway 1 Bean Hollow
    [37.1850, -122.3900], // Highway 1 Pigeon Point Lighthouse
    [37.1600, -122.3650], // Highway 1 Gazos Creek
    [37.1200, -122.3300], // Highway 1 Año Nuevo State Reserve
    [37.0950, -122.2780], // Highway 1 Waddell Creek (County Line)
    [37.0700, -122.2580], // Highway 1 Greyhound Rock
    [37.0450, -122.2350], // Highway 1 Scott Creek
    [37.0116, -122.1936], // Highway 1 Davenport
    [37.0050, -122.1850], // Highway 1 Swanton Rd
    [36.9950, -122.1690], // Highway 1 Bonny Doon
    [36.9850, -122.1480], // Highway 1 Laguna Creek
    [36.9750, -122.1220], // Highway 1 Four Mile Beach
    [36.9680, -122.0950], // Highway 1 Wilder Ranch Coastal Highway
    [36.9620, -122.0680], // Highway 1 Western Dr (Santa Cruz)
    [36.9680, -122.0450], // Highway 1 Bay St / Mission St
    [36.9740, -122.0300], // Highway 1 Chestnut St / Highway 17
    [36.9820, -122.0180], // Highway 1 Ocean St / Soquel Ave
    [36.9800, -121.9750], // Highway 1 towards Capitola
    [36.9780, -121.9650], // Highway 1 41st Ave (Capitola)
    [36.9750, -121.9350], // Highway 1 Park Ave / Cabrillo Highway
    [36.9700, -121.9050], // Highway 1 State Beach Dr (Aptos)
    [36.9600, -121.8750], // Highway 1 Rio Del Mar Blvd
    [36.9300, -121.8350], // Highway 1 San Andreas Rd / Buena Vista
    [36.9100, -121.7850], // Highway 1 Watsonville (Airport Blvd)
    [36.8850, -121.7650], // Highway 1 Watsonville (Riverside Dr)
    [36.8040, -121.7870], // Highway 1 Moss Landing (Elkhorn Slough)
    [36.7650, -121.7750], // Highway 1 Molera Rd
    [36.7550, -121.7550], // Highway 1 Castroville Interchange
    [36.7000, -121.7950], // Highway 1 Marina (Reservation Rd)
    [36.6650, -121.8200], // Highway 1 Imjin Pkwy
    [36.6350, -121.8400], // Highway 1 Lightfighter Dr (Seaside)
    [36.6150, -121.8500], // Highway 1 Fremont Blvd (Sand City)
    [36.6020, -121.8650], // Highway 1 Del Monte Ave
    [36.6050, -121.8920]  // Monterey Cannery Row & Fisherman's Wharf
  ],
  '2024-06-15T09:00:00Z',
  3
);

// 2. Tokyo Urban Discovery (Shibuya -> Shinjuku -> Imperial Palace -> Asakusa)
export const sampleTokyoDiscovery = createSyntheticJourney(
  'Tur Kota Tokyo',
  [
    [35.6595, 139.7005], // Shibuya Crossing & Hachiko
    [35.6653, 139.7040], // Miyashita Park
    [35.6702, 139.7027], // Harajuku Takeshita-dori
    [35.6653, 139.7123], // Omotesando Avenue
    [35.6780, 139.7190], // Meiji Jingu Gaien
    [35.6860, 139.7100], // Shinjuku Gyoen National Garden
    [35.6938, 139.7034], // Shinjuku East / Kabukicho
    [35.6865, 139.7300], // Yotsuya Avenue
    [35.6850, 139.7450], // Hanzomon Gate
    [35.6852, 139.7528], // Kokyo Imperial Palace Gardens
    [35.6780, 139.7600], // Hibiya Park
    [35.6719, 139.7640], // Ginza 4-chome Crossing
    [35.6655, 139.7705], // Tsukiji Outer Market
    [35.6812, 139.7671], // Tokyo Station Marunouchi
    [35.6840, 139.7745], // Nihonbashi Bridge
    [35.6983, 139.7731], // Akihabara Electric Town
    [35.7100, 139.7744], // Ueno Park & Shinobazu Pond
    [35.7148, 139.7967]  // Senso-ji Temple, Asakusa
  ],
  '2024-05-10T11:00:00Z',
  6
);

// 3. Alpine Mountain Pass (Interlaken -> Brienz -> Meiringen -> Grimsel Pass -> Brig -> Visp -> Täsch -> Zermatt)
export const sampleAlpinePass = createSyntheticJourney(
  'Lintas Pegunungan Alpen Swiss',
  [
    [46.6863, 7.8632], // Interlaken
    [46.6850, 7.8950], // Bönigen
    [46.7110, 7.9620], // Iseltwald (Lake Brienz)
    [46.7550, 8.0350], // Brienz
    [46.7280, 8.1880], // Meiringen (Haslital Valley)
    [46.7020, 8.2280], // Innertkirchen
    [46.6550, 8.2880], // Guttannen
    [46.6150, 8.3050], // Handegg
    [46.5620, 8.3370], // Grimsel Pass Summit (2,164 m)
    [46.5620, 8.3610], // Gletsch (Rhone Glacier)
    [46.5330, 8.3480], // Oberwald (Goms Valley)
    [46.5050, 8.3050], // Ulrichen
    [46.4850, 8.2650], // Münster
    [46.4020, 8.1320], // Fiesch (Aletsch Area)
    [46.3550, 8.0450], // Mörel
    [46.3160, 7.9880], // Brig-Glis (Rhone Valley)
    [46.2930, 7.8810], // Visp
    [46.2320, 7.8710], // Stalden
    [46.2100, 7.8450], // Kalpetran
    [46.1780, 7.8010], // St. Niklaus (Mattertal Valley)
    [46.1320, 7.7850], // Herbriggen
    [46.0980, 7.7810], // Randa
    [46.0680, 7.7760], // Täsch
    [46.0207, 7.7491]  // Zermatt (Matterhorn View)
  ],
  '2024-07-22T08:30:00Z',
  8
);

// 4. Trans-Continental Cross-Country (New York to Los Angeles — 4,500+ km)
export const sampleCrossCountry = createSyntheticJourney(
  'Rute Lintas Benua Amerika',
  [
    [40.7128, -74.0060], // New York, NY (Times Square)
    [40.7357, -74.1724], // Newark, NJ
    [39.9526, -75.1652], // Philadelphia, PA
    [40.2732, -76.8867], // Harrisburg, PA (PA Turnpike)
    [40.4406, -79.9959], // Pittsburgh, PA
    [39.9612, -82.9988], // Columbus, OH (I-70 West)
    [39.7684, -86.1581], // Indianapolis, IN
    [38.6270, -90.1994], // St. Louis, MO (Gateway Arch)
    [38.9517, -92.3341], // Columbia, MO
    [39.0997, -94.5786], // Kansas City, MO
    [38.8403, -97.6114], // Salina, KS
    [39.7392, -104.9903], // Denver, CO (Rocky Mountains)
    [39.6403, -106.3742], // Vail Pass Summit (I-70)
    [39.5501, -107.3248], // Glenwood Canyon, CO
    [39.0639, -108.5506], // Grand Junction, CO
    [38.9908, -110.1596], // Green River, UT
    [38.5733, -109.5498], // Moab / Arches National Park
    [38.3032, -112.5841], // Beaver, UT (I-15 South)
    [37.1041, -113.5841], // St. George, UT / Virgin River Gorge
    [36.1699, -115.1398], // Las Vegas, NV (The Strip)
    [35.2828, -115.5484], // Mojave Desert
    [34.8958, -117.0173], // Barstow, CA (Historic Route 66)
    [34.1083, -117.2898], // San Bernardino, CA
    [34.1478, -118.1445], // Pasadena, CA (Rose Bowl)
    [34.0522, -118.2437], // Downtown Los Angeles, CA
    [34.0195, -118.4912]  // Santa Monica Pier (End of the Trail)
  ],
  '2024-08-01T06:00:00Z',
  50
);

export const ALL_SAMPLES = [
  samplePacificCoast,
  sampleTokyoDiscovery,
  sampleAlpinePass,
  sampleCrossCountry
];

// Default sample for quick one-click load
export const sampleJourney: Journey = samplePacificCoast;
