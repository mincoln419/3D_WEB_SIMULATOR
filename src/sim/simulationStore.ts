import { create } from 'zustand'
import * as THREE from 'three'
import type { CharacterLook } from '../character/sampleColors'
import { DEFAULT_LOOK } from '../character/sampleColors'
import type { AnimState } from '../character/Character'
import { buildSchedule, type ScheduledItem } from './schedule'
import { buildPath, pathLength, yawToward, type PathPoint } from './pathfinding'
import { getStationRoom, STATIONS, type RoomId } from '../world/layout'
import { DAY_END_MINUTES, DAY_START_MINUTES } from './tasks'

export type SimPhase = 'Wait' | 'Walk' | 'Act' | 'DayEnd'
export type SpeedMultiplier = 5 | 20 | 60

/** At 20x default: 1 sim minute per real second */
const BASE_SIM_MINUTES_PER_REAL_SECOND = 1

interface SimulationState {
  playing: boolean
  speed: SpeedMultiplier
  simMinutes: number
  phase: SimPhase
  schedule: ScheduledItem[]
  unassigned: string[]
  selectedChores: string[]
  currentIndex: number
  look: CharacterLook
  position: THREE.Vector3
  rotationY: number
  animState: AnimState
  currentRoom: RoomId
  path: PathPoint[]
  pathProgress: number
  walkRealSeconds: number
  actRemainingSimMinutes: number
  waitTargetMinutes: number
  setLook: (look: CharacterLook) => void
  setSelectedChores: (ids: string[]) => void
  togglePlay: () => void
  setSpeed: (s: SpeedMultiplier) => void
  rebuildSchedule: () => void
  tick: (deltaRealSeconds: number) => void
}

function initialSchedule(chores: string[]) {
  return buildSchedule(chores)
}

export const DEFAULT_SELECTED_CHORES = ['makeBed', 'dishes', 'laptopWork'] as const

function startItem(state: SimulationState, item: ScheduledItem): Partial<SimulationState> {
  const fromRoom = state.currentRoom
  const path = buildPath(fromRoom, item.stationId, {
    x: state.position.x,
    z: state.position.z,
  })
  const len = pathLength(path)
  const walkRealSeconds = Math.min(2, Math.max(1, len * 0.35))

  return {
    phase: 'Walk',
    path,
    pathProgress: 0,
    walkRealSeconds,
    actRemainingSimMinutes: item.durationMinutes,
    animState: 'walk',
    waitTargetMinutes: item.startMinutes,
  }
}

export const useSimulationStore = create<SimulationState>((set, get) => {
  const defaultChores = [...DEFAULT_SELECTED_CHORES]
  const { items, unassigned } = initialSchedule(defaultChores)

  return {
    playing: false,
    speed: 20,
    simMinutes: DAY_START_MINUTES,
    phase: 'Wait',
    schedule: items,
    unassigned,
    selectedChores: defaultChores,
    currentIndex: 0,
    look: DEFAULT_LOOK,
    position: new THREE.Vector3(STATIONS.bed.position.x, 0, STATIONS.bed.position.z),
    rotationY: 0,
    animState: 'idle',
    currentRoom: 'bedroom',
    path: [],
    pathProgress: 0,
    walkRealSeconds: 1.5,
    actRemainingSimMinutes: 0,
    waitTargetMinutes: items[0]?.startMinutes ?? DAY_START_MINUTES,

    setLook: (look) => set({ look }),
    setSelectedChores: (ids) => {
      set({ selectedChores: ids })
      get().rebuildSchedule()
    },
    setSpeed: (speed) => set({ speed }),
    togglePlay: () => set((s) => ({ playing: !s.playing })),

    rebuildSchedule: () => {
      const { selectedChores } = get()
      const { items: newItems, unassigned: ua } = buildSchedule(selectedChores)
      set({
        schedule: newItems,
        unassigned: ua,
        currentIndex: 0,
        simMinutes: DAY_START_MINUTES,
        phase: 'Wait',
        waitTargetMinutes: newItems[0]?.startMinutes ?? DAY_START_MINUTES,
        path: [],
        pathProgress: 0,
      })
    },

    tick: (deltaRealSeconds) => {
      const state = get()
      if (!state.playing) return

      const simAdvance = deltaRealSeconds * (state.speed / 20) * BASE_SIM_MINUTES_PER_REAL_SECOND
      const {
        simMinutes: simStart,
        phase,
        currentIndex,
        schedule,
        position,
        rotationY,
        path,
        pathProgress,
        walkRealSeconds,
        actRemainingSimMinutes,
        waitTargetMinutes,
      } = state
      let simMinutes = simStart
      let rotation = rotationY

      if (simMinutes >= DAY_END_MINUTES || currentIndex >= schedule.length) {
        set({ phase: 'DayEnd', playing: false, animState: 'idle' })
        return
      }

      const item = schedule[currentIndex]

      if (phase === 'Wait') {
        simMinutes += simAdvance
        if (simMinutes >= waitTargetMinutes) {
          const next = startItem(state, item)
          set({ simMinutes, ...next })
        } else {
          set({ simMinutes, animState: 'idle' })
        }
        return
      }

      if (phase === 'Walk') {
        const nextProgress = pathProgress + deltaRealSeconds / walkRealSeconds
        const pos = new THREE.Vector3().copy(position)
        if (path.length === 1) {
          pos.set(path[0].x, path[0].y, path[0].z)
          rotation = yawToward({ x: pos.x, y: 0, z: pos.z }, path[0])
        } else if (path.length > 1) {
          const totalSeg = path.length - 1
          const t = Math.min(1, nextProgress) * totalSeg
          const seg = Math.min(totalSeg - 1, Math.floor(t))
          const localT = t - seg
          const a = path[seg]
          const b = path[seg + 1]
          pos.set(a.x + (b.x - a.x) * localT, 0, a.z + (b.z - a.z) * localT)
          rotation = yawToward(a, b)
        }

        if (nextProgress >= 1) {
          const stationRoom = getStationRoom(item.stationId)
          const anim: AnimState =
            item.anim === 'sit' ? 'sit' : item.anim === 'actStanding' ? 'actStanding' : 'idle'
          set({
            phase: 'Act',
            position: pos,
            rotationY: rotation,
            currentRoom: stationRoom,
            pathProgress: 1,
            animState: anim,
            actRemainingSimMinutes: item.durationMinutes,
            simMinutes: Math.max(simMinutes, item.startMinutes),
          })
        } else {
          set({
            position: pos,
            rotationY: rotation,
            pathProgress: nextProgress,
            animState: 'walk',
            simMinutes: simMinutes + 1 / 60,
          })
        }
        return
      }

      if (phase === 'Act') {
        simMinutes += simAdvance
        const actLeft = actRemainingSimMinutes - simAdvance
        if (actLeft <= 0 || simMinutes >= item.endMinutes) {
          const nextIndex = currentIndex + 1
          if (nextIndex >= schedule.length) {
            set({
              simMinutes: Math.min(simMinutes, DAY_END_MINUTES),
              phase: 'DayEnd',
              playing: false,
              currentIndex: nextIndex,
              animState: 'idle',
            })
            return
          }
          const nextItem = schedule[nextIndex]
          set({
            simMinutes,
            currentIndex: nextIndex,
            phase: 'Wait',
            waitTargetMinutes: nextItem.startMinutes,
            animState: 'idle',
            actRemainingSimMinutes: 0,
          })
        } else {
          set({ simMinutes, actRemainingSimMinutes: actLeft })
        }
      }
    },
  }
})

export function getActiveScheduleItem(simMinutes: number, schedule: ScheduledItem[]): ScheduledItem | null {
  for (const item of schedule) {
    if (simMinutes >= item.startMinutes && simMinutes < item.endMinutes) return item
  }
  return null
}

export function progressForItem(item: ScheduledItem, simMinutes: number): number {
  if (simMinutes <= item.startMinutes) return 0
  if (simMinutes >= item.endMinutes) return 1
  return (simMinutes - item.startMinutes) / item.durationMinutes
}
