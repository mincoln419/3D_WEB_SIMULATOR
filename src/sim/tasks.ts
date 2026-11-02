import type { StationId } from '../world/layout'

export type TaskKind = 'anchor' | 'chore'

export interface TaskDef {
  id: string
  kind: TaskKind
  labelKo: string
  durationMinutes: number
  stationId: StationId
  /** Minutes from midnight for anchors */
  anchorMinutes?: number
  priority?: number
  /** Prefer gap after meals (dishes) */
  preferAfterMeal?: boolean
  anim?: 'sit' | 'actStanding' | 'idle'
}

export const ANCHORS: TaskDef[] = [
  { id: 'wake', kind: 'anchor', labelKo: '기상', durationMinutes: 5, stationId: 'bed', anchorMinutes: 7 * 60, anim: 'idle' },
  {
    id: 'washFace',
    kind: 'anchor',
    labelKo: '세수',
    durationMinutes: 10,
    stationId: 'washbasin',
    anchorMinutes: 7 * 60 + 5,
    anim: 'actStanding',
  },
  {
    id: 'breakfastCook',
    kind: 'anchor',
    labelKo: '아침 요리',
    durationMinutes: 25,
    stationId: 'stove',
    anchorMinutes: 7 * 60 + 20,
    anim: 'actStanding',
  },
  {
    id: 'breakfastEat',
    kind: 'anchor',
    labelKo: '아침 식사',
    durationMinutes: 20,
    stationId: 'diningTable',
    anchorMinutes: 7 * 60 + 45,
    anim: 'sit',
  },
  {
    id: 'lunchCook',
    kind: 'anchor',
    labelKo: '점심 요리',
    durationMinutes: 30,
    stationId: 'stove',
    anchorMinutes: 12 * 60,
    anim: 'actStanding',
  },
  {
    id: 'lunchEat',
    kind: 'anchor',
    labelKo: '점심 식사',
    durationMinutes: 30,
    stationId: 'diningTable',
    anchorMinutes: 12 * 60 + 30,
    anim: 'sit',
  },
  {
    id: 'dinnerCook',
    kind: 'anchor',
    labelKo: '저녁 요리',
    durationMinutes: 40,
    stationId: 'stove',
    anchorMinutes: 18 * 60 + 30,
    anim: 'actStanding',
  },
  {
    id: 'dinnerEat',
    kind: 'anchor',
    labelKo: '저녁 식사',
    durationMinutes: 30,
    stationId: 'diningTable',
    anchorMinutes: 19 * 60 + 10,
    anim: 'sit',
  },
  {
    id: 'shower',
    kind: 'anchor',
    labelKo: '샤워',
    durationMinutes: 15,
    stationId: 'shower',
    anchorMinutes: 21 * 60 + 30,
    anim: 'actStanding',
  },
  {
    id: 'sleep',
    kind: 'anchor',
    labelKo: '취침 준비',
    durationMinutes: 30,
    stationId: 'bed',
    anchorMinutes: 22 * 60 + 30,
    anim: 'idle',
  },
]

/** End of playable day (sleep segment ends 23:00) */
export const SLEEP_END_MINUTES = 22 * 60 + 30 + 30

export const OPTIONAL_CHORES: TaskDef[] = [
  { id: 'makeBed', kind: 'chore', labelKo: '침대 정리', durationMinutes: 10, stationId: 'bed', priority: 3, anim: 'actStanding' },
  { id: 'laptopWork', kind: 'chore', labelKo: '노트북 업무', durationMinutes: 90, stationId: 'chair', priority: 5, anim: 'sit' },
  { id: 'dishes', kind: 'chore', labelKo: '설거지', durationMinutes: 15, stationId: 'sink', priority: 8, preferAfterMeal: true, anim: 'actStanding' },
  { id: 'livingClean', kind: 'chore', labelKo: '거실 청소', durationMinutes: 20, stationId: 'sofa', priority: 4, anim: 'actStanding' },
  { id: 'bathClean', kind: 'chore', labelKo: '욕실 청소', durationMinutes: 15, stationId: 'toilet', priority: 2, anim: 'actStanding' },
  { id: 'wardrobeOrganize', kind: 'chore', labelKo: '옷장 정리', durationMinutes: 15, stationId: 'wardrobe', priority: 2, anim: 'actStanding' },
  { id: 'deskTidy', kind: 'chore', labelKo: '책상 정리', durationMinutes: 10, stationId: 'desk', priority: 3, anim: 'actStanding' },
]

export const DAY_START_MINUTES = 7 * 60
export const DAY_END_MINUTES = SLEEP_END_MINUTES

export function minutesToHHMM(m: number): string {
  const total = Math.floor(m) % (24 * 60)
  const h = Math.floor(total / 60)
  const min = total % 60
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`
}

export function taskById(id: string): TaskDef | undefined {
  return [...ANCHORS, ...OPTIONAL_CHORES].find((t) => t.id === id)
}
