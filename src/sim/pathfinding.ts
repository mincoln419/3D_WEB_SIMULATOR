import { DOORS, STATIONS, type RoomId, type StationId, type Vec3 } from '../world/layout'

export interface PathPoint {
  x: number
  y: number
  z: number
}

function vec(v: Vec3): PathPoint {
  return { x: v.x, y: v.y, z: v.z }
}

export const LIVING_HUB: Vec3 = { x: 0, y: 0, z: 0 }

function doorForRoom(roomId: RoomId, exitingToLiving: boolean): Vec3 {
  const candidates = DOORS.filter((d) => d.roomId === roomId)
  if (roomId === 'living') {
    return LIVING_HUB
  }
  if (exitingToLiving) {
    const id = `door_${roomId}_living`
    return candidates.find((d) => d.id === id)?.position ?? candidates[0].position
  }
  const id = `door_living_${roomId}`
  const fromLiving = DOORS.find((d) => d.id === id)
  return fromLiving?.position ?? candidates[0].position
}

export interface PathFromPosition {
  x: number
  y?: number
  z: number
}

function routeCore(fromRoom: RoomId, toRoom: RoomId, dest: PathPoint): PathPoint[] {
  if (fromRoom === toRoom) {
    return [dest]
  }

  const path: PathPoint[] = []
  if (fromRoom !== 'living') {
    path.push(vec(doorForRoom(fromRoom, true)))
    path.push(vec(LIVING_HUB))
  }
  if (toRoom !== 'living') {
    path.push(vec(doorForRoom(toRoom, false)))
  }
  path.push(dest)
  return path
}

export function buildPath(
  fromRoom: RoomId,
  toStationId: StationId,
  fromPosition?: PathFromPosition,
): PathPoint[] {
  const target = STATIONS[toStationId]
  const toRoom = target.roomId
  const dest = vec(target.position)
  const core = routeCore(fromRoom, toRoom, dest)

  if (!fromPosition) {
    return core
  }

  const start: PathPoint = { x: fromPosition.x, y: fromPosition.y ?? 0, z: fromPosition.z }
  if (core.length === 1 && core[0].x === start.x && core[0].z === start.z) {
    return core
  }
  return [start, ...core]
}

export function pathLength(points: PathPoint[]): number {
  let len = 0
  for (let i = 1; i < points.length; i++) {
    len += Math.hypot(points[i].x - points[i - 1].x, points[i].z - points[i - 1].z)
  }
  return len
}

export function yawToward(from: PathPoint, to: PathPoint): number {
  return Math.atan2(to.x - from.x, to.z - from.z)
}
