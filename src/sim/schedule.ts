import { ANCHORS, DAY_END_MINUTES, OPTIONAL_CHORES, type TaskDef, minutesToHHMM } from './tasks'

export interface ScheduledItem {
  id: string
  taskId: string
  labelKo: string
  startMinutes: number
  endMinutes: number
  durationMinutes: number
  stationId: TaskDef['stationId']
  isChore: boolean
  anim?: TaskDef['anim']
}

export interface ScheduleResult {
  items: ScheduledItem[]
  unassigned: string[]
}

interface Gap {
  start: number
  end: number
  afterMeal: boolean
}

const DAY_START = 7 * 60

function anchorItems(): ScheduledItem[] {
  return ANCHORS.map((a) => {
    const start = a.anchorMinutes ?? DAY_START
    return {
      id: `anchor-${a.id}`,
      taskId: a.id,
      labelKo: a.labelKo,
      startMinutes: start,
      endMinutes: start + a.durationMinutes,
      durationMinutes: a.durationMinutes,
      stationId: a.stationId,
      isChore: false,
      anim: a.anim,
    }
  }).sort((x, y) => x.startMinutes - y.startMinutes)
}

const MEAL_ENDS = new Set(
  ANCHORS.filter((a) => a.id.endsWith('Eat')).map((a) => (a.anchorMinutes ?? 0) + a.durationMinutes),
)

function findGaps(items: ScheduledItem[]): Gap[] {
  const gaps: Gap[] = []
  const sorted = [...items].sort((a, b) => a.startMinutes - b.startMinutes)
  let cursor = DAY_START
  for (const item of sorted) {
    if (item.startMinutes > cursor) {
      gaps.push({
        start: cursor,
        end: item.startMinutes,
        afterMeal: MEAL_ENDS.has(cursor) || [...MEAL_ENDS].some((m) => m > cursor && m <= item.startMinutes),
      })
    }
    cursor = Math.max(cursor, item.endMinutes)
  }
  if (cursor < DAY_END_MINUTES) {
    gaps.push({ start: cursor, end: DAY_END_MINUTES, afterMeal: false })
  }
  return gaps
}

export function buildSchedule(selectedChoreIds: string[]): ScheduleResult {
  const items = anchorItems()
  const unassigned: string[] = []
  const chores = selectedChoreIds
    .map((id) => OPTIONAL_CHORES.find((c) => c.id === id))
    .filter((c): c is TaskDef => !!c)
    .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))

  for (const chore of chores) {
    let gaps = findGaps(items)
    if (chore.preferAfterMeal) {
      gaps = [...gaps].sort((a, b) => {
        if (a.afterMeal !== b.afterMeal) return a.afterMeal ? -1 : 1
        return a.start - b.start
      })
    } else {
      gaps = [...gaps].sort((a, b) => a.start - b.start)
    }

    const gap = gaps.find((g) => g.end - g.start >= chore.durationMinutes)
    if (!gap) {
      unassigned.push(chore.id)
      continue
    }

    items.push({
      id: `chore-${chore.id}-${gap.start}`,
      taskId: chore.id,
      labelKo: chore.labelKo,
      startMinutes: gap.start,
      endMinutes: gap.start + chore.durationMinutes,
      durationMinutes: chore.durationMinutes,
      stationId: chore.stationId,
      isChore: true,
      anim: chore.anim,
    })
    items.sort((a, b) => a.startMinutes - b.startMinutes)
  }

  return { items, unassigned }
}

export function formatScheduleTime(m: number): string {
  return minutesToHHMM(m)
}
