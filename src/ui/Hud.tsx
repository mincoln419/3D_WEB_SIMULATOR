import { useRef } from 'react'
import { OPTIONAL_CHORES, minutesToHHMM, DAY_END_MINUTES, DAY_START_MINUTES } from '../sim/tasks'
import { useSimulationStore, progressForItem } from '../sim/simulationStore'
import { loadImageFromFile, sampleCharacterLookFromImage } from '../character/sampleColors'
import { formatScheduleTime } from '../sim/schedule'
import { SceneHost } from '../scene/Scene'

export function DailyLifeApp() {
  return (
    <div className="app-shell">
      <main className="canvas-wrap">
        <SceneHost />
      </main>
      <HudPanel />
    </div>
  )
}

function HudPanel() {
  const fileRef = useRef<HTMLInputElement>(null)
  const simMinutes = useSimulationStore((s) => s.simMinutes)
  const playing = useSimulationStore((s) => s.playing)
  const speed = useSimulationStore((s) => s.speed)
  const schedule = useSimulationStore((s) => s.schedule)
  const unassigned = useSimulationStore((s) => s.unassigned)
  const selectedChores = useSimulationStore((s) => s.selectedChores)
  const phase = useSimulationStore((s) => s.phase)
  const togglePlay = useSimulationStore((s) => s.togglePlay)
  const setSpeed = useSimulationStore((s) => s.setSpeed)
  const setSelectedChores = useSimulationStore((s) => s.setSelectedChores)
  const setLook = useSimulationStore((s) => s.setLook)

  const dayProgress =
    ((simMinutes - DAY_START_MINUTES) / (DAY_END_MINUTES - DAY_START_MINUTES)) * 100

  const onPhoto = async (file: File | undefined) => {
    if (!file) return
    try {
      const img = await loadImageFromFile(file)
      setLook(sampleCharacterLookFromImage(img))
    } catch {
      /* ignore */
    }
  }

  const toggleChore = (id: string) => {
    const next = selectedChores.includes(id)
      ? selectedChores.filter((c) => c !== id)
      : [...selectedChores, id]
    setSelectedChores(next)
  }

  return (
    <aside className="hud-panel">
      <h1 className="hud-title">일상 3D 시뮬</h1>

      <section className="hud-section">
        <h2>캐릭터 사진</h2>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hud-file"
          onChange={(e) => onPhoto(e.target.files?.[0])}
        />
        <p className="hud-hint">상·중·하단 색으로 머리·피부·옷을 추출합니다.</p>
      </section>

      <section className="hud-section">
        <h2>집안일 선택</h2>
        <ul className="chore-list">
          {OPTIONAL_CHORES.map((c) => (
            <li key={c.id}>
              <label>
                <input
                  type="checkbox"
                  checked={selectedChores.includes(c.id)}
                  onChange={() => toggleChore(c.id)}
                />
                {c.labelKo} ({c.durationMinutes}분)
              </label>
            </li>
          ))}
        </ul>
        {unassigned.length > 0 && (
          <p className="hud-warn">
            배치 불가:{' '}
            {unassigned
              .map((id) => OPTIONAL_CHORES.find((c) => c.id === id)?.labelKo ?? id)
              .join(', ')}
          </p>
        )}
      </section>

      <section className="hud-section hud-clock">
        <div className="clock">{minutesToHHMM(simMinutes)}</div>
        <div className="phase">상태: {phase}</div>
        <div className="controls">
          <button type="button" className="btn primary" onClick={togglePlay}>
            {playing ? '일시정지' : '재생'}
          </button>
          <div className="speed-group">
            {([5, 20, 60] as const).map((s) => (
              <button
                key={s}
                type="button"
                className={`btn ${speed === s ? 'active' : ''}`}
                onClick={() => setSpeed(s)}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
        <div className="day-bar">
          <div
            className="day-bar-fill"
            style={{ width: `${Math.min(100, Math.max(0, dayProgress))}%` }}
          />
        </div>
      </section>

      <section className="hud-section hud-schedule">
        <h2>오늘 일정</h2>
        <ul className="schedule-list">
          {schedule.map((item) => {
            const active = simMinutes >= item.startMinutes && simMinutes < item.endMinutes
            const prog = progressForItem(item, simMinutes)
            return (
              <li key={item.id} className={active ? 'active' : ''}>
                <div className="schedule-row">
                  <span className="time">
                    {formatScheduleTime(item.startMinutes)}–{formatScheduleTime(item.endMinutes)}
                  </span>
                  <span className="label">
                    {item.labelKo}
                    {item.isChore && <span className="badge">집안일</span>}
                  </span>
                </div>
                <div className="item-bar">
                  <div className="item-bar-fill" style={{ width: `${prog * 100}%` }} />
                </div>
              </li>
            )
          })}
        </ul>
      </section>
    </aside>
  )
}
