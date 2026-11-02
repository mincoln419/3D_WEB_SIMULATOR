export type RoomId = 'bedroom' | 'study' | 'living' | 'bathroom'

export type StationId =
  | 'bed'
  | 'wardrobe'
  | 'nightstand'
  | 'desk'
  | 'chair'
  | 'laptop'
  | 'bookshelf'
  | 'sofa'
  | 'tv'
  | 'diningTable'
  | 'stove'
  | 'sink'
  | 'fridge'
  | 'toilet'
  | 'washbasin'
  | 'shower'

export interface Vec3 {
  x: number
  y: number
  z: number
}

export interface Station {
  id: StationId
  roomId: RoomId
  position: Vec3
  rotationY?: number
}

export interface DoorWaypoint {
  id: string
  roomId: RoomId
  position: Vec3
}

export interface WallSegment {
  x1: number
  z1: number
  x2: number
  z2: number
  height?: number
}

export interface RoomLayout {
  id: RoomId
  labelKo: string
  floorColor: string
  center: Vec3
  size: { width: number; depth: number }
}

export const WALL_HEIGHT = 1.2

export const ROOMS: Record<RoomId, RoomLayout> = {
  living: {
    id: 'living',
    labelKo: '거실·주방',
    floorColor: '#f5e6d3',
    center: { x: 0, y: 0, z: 0 },
    size: { width: 10, depth: 8 },
  },
  bedroom: {
    id: 'bedroom',
    labelKo: '침실',
    floorColor: '#e8dff5',
    center: { x: -8, y: 0, z: 0 },
    size: { width: 6, depth: 6 },
  },
  study: {
    id: 'study',
    labelKo: '서재',
    floorColor: '#dff0e8',
    center: { x: 8, y: 0, z: 0 },
    size: { width: 5, depth: 5 },
  },
  bathroom: {
    id: 'bathroom',
    labelKo: '욕실',
    floorColor: '#dfe8f5',
    center: { x: 0, y: 0, z: -7 },
    size: { width: 5, depth: 4 },
  },
}

/** Living hub door positions for inter-room routing */
export const DOORS: DoorWaypoint[] = [
  { id: 'door_living_bedroom', roomId: 'living', position: { x: -5, y: 0, z: 0 } },
  { id: 'door_bedroom_living', roomId: 'bedroom', position: { x: -5, y: 0, z: 0 } },
  { id: 'door_living_study', roomId: 'living', position: { x: 5, y: 0, z: 0 } },
  { id: 'door_study_living', roomId: 'study', position: { x: 5.5, y: 0, z: 0 } },
  { id: 'door_living_bathroom', roomId: 'living', position: { x: 0, y: 0, z: -4 } },
  { id: 'door_bathroom_living', roomId: 'bathroom', position: { x: 0, y: 0, z: -5 } },
]

export const STATIONS: Record<StationId, Station> = {
  sofa: { id: 'sofa', roomId: 'living', position: { x: -1, y: 0, z: 1.5 }, rotationY: Math.PI },
  tv: { id: 'tv', roomId: 'living', position: { x: -1, y: 0, z: 3.2 } },
  diningTable: { id: 'diningTable', roomId: 'living', position: { x: 2, y: 0, z: -1 } },
  stove: { id: 'stove', roomId: 'living', position: { x: 3.5, y: 0, z: -2.5 } },
  sink: { id: 'sink', roomId: 'living', position: { x: 3.5, y: 0, z: -0.5 } },
  fridge: { id: 'fridge', roomId: 'living', position: { x: 4.5, y: 0, z: -2.5 } },
  bed: { id: 'bed', roomId: 'bedroom', position: { x: -8, y: 0, z: -1.5 } },
  wardrobe: { id: 'wardrobe', roomId: 'bedroom', position: { x: -10, y: 0, z: 1.5 } },
  nightstand: { id: 'nightstand', roomId: 'bedroom', position: { x: -6.5, y: 0, z: -1.5 } },
  desk: { id: 'desk', roomId: 'study', position: { x: 8, y: 0, z: -0.5 } },
  chair: { id: 'chair', roomId: 'study', position: { x: 8, y: 0, z: 0.8 } },
  laptop: { id: 'laptop', roomId: 'study', position: { x: 8, y: 0.75, z: -0.5 } },
  bookshelf: { id: 'bookshelf', roomId: 'study', position: { x: 10, y: 0, z: 1 } },
  toilet: { id: 'toilet', roomId: 'bathroom', position: { x: -1.5, y: 0, z: -7 } },
  washbasin: { id: 'washbasin', roomId: 'bathroom', position: { x: 0.5, y: 0, z: -6.2 } },
  shower: { id: 'shower', roomId: 'bathroom', position: { x: 1.5, y: 0, z: -8 } },
}

export function getStationPosition(stationId: StationId): Vec3 {
  return STATIONS[stationId].position
}

export function getStationRoom(stationId: StationId): RoomId {
  return STATIONS[stationId].roomId
}

/** Outer walls + partial dividers (~2m door gaps at z=±1 or x=±1) */
export const WALL_SEGMENTS: WallSegment[] = [
  // Living — north
  { x1: -5, z1: 4, x2: 5, z2: 4 },
  // Living — east (x=5), gap z∈[-1,1] for study
  { x1: 5, z1: 4, x2: 5, z2: 1 },
  { x1: 5, z1: -1, x2: 5, z2: -4 },
  // Living — south (z=-4), gap x∈[-1,1] for bathroom
  { x1: 5, z1: -4, x2: 1, z2: -4 },
  { x1: -1, z1: -4, x2: -5, z2: -4 },
  // Living — west (x=-5), gap z∈[-1,1] for bedroom
  { x1: -5, z1: 4, x2: -5, z2: 1 },
  { x1: -5, z1: -1, x2: -5, z2: -4 },
  // Bedroom (east open at x=-5, z∈[-1,1])
  { x1: -11, z1: 3, x2: -5, z2: 3 },
  { x1: -11, z1: -3, x2: -5, z2: -3 },
  { x1: -11, z1: -3, x2: -11, z2: 3 },
  // Study — west (x=5.5), gap z∈[-1,1]
  { x1: 5.5, z1: 2.5, x2: 10.5, z2: 2.5 },
  { x1: 10.5, z1: 2.5, x2: 10.5, z2: -2.5 },
  { x1: 10.5, z1: -2.5, x2: 5.5, z2: -2.5 },
  { x1: 5.5, z1: -2.5, x2: 5.5, z2: -1 },
  { x1: 5.5, z1: 1, x2: 5.5, z2: 2.5 },
  // Bathroom — north (z=-5), gap x∈[-1,1]
  { x1: -2.5, z1: -5, x2: -1, z2: -5 },
  { x1: 1, z1: -5, x2: 2.5, z2: -5 },
  { x1: 2.5, z1: -5, x2: 2.5, z2: -9 },
  { x1: 2.5, z1: -9, x2: -2.5, z2: -9 },
  { x1: -2.5, z1: -9, x2: -2.5, z2: -5 },
]

export const HOUSE_CENTER: Vec3 = { x: 0, y: 0, z: -0.5 }
