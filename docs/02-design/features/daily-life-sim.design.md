# 일상 생활 3D 시뮬레이터 MVP — 설계서

> **기획 참조:** [docs/01-plan/features/daily-life-sim.plan.md](../../01-plan/features/daily-life-sim.plan.md)

본 문서는 기획서의 FR-HOUSE, FR-CHAR, FR-SCHED, FR-HUD를 구현 가능한 수준으로 구체화한다.

---

## 1. 기술 스택

| 계층 | 선택 | 비고 |
|------|------|------|
| 빌드 | **Vite** | 빠른 HMR, ESM 기본 |
| UI | **React 18+** | HUD·상태 바인딩 |
| 언어 | **TypeScript** | 스케줄·상태 타입 안전 |
| 3D | **Three.js** + **@react-three/fiber (R3F)** | 선언적 씬 그래프 |
| 3D 유틸 | `@react-three/drei` | OrbitControls, Text, Html 등 |
| 상태 | React `useReducer` + Context (MVP) | 재생 FSM·시뮬 시각 단일 소스 |
| 스타일 | CSS Modules 또는 간단 전역 CSS | HUD 레이아웃 |

### 1.1 의존성 (예시)

```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "three": "^0.16x.0",
    "@react-three/fiber": "^8.x",
    "@react-three/drei": "^9.x"
  },
  "devDependencies": {
    "vite": "^5.x",
    "@vitejs/plugin-react": "^4.x",
    "typescript": "^5.x"
  }
}
```

---

## 2. 프로젝트 파일 구조

```
3D_WEB_SIMULATOR/
├── docs/
│   ├── 01-plan/features/daily-life-sim.plan.md
│   └── 02-design/features/daily-life-sim.design.md
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
└── src/
    ├── main.tsx                 # React 진입
    ├── App.tsx                  # Canvas + HUD 레이아웃
    ├── index.css                # 전역·HUD 토큰
    ├── types/
    │   ├── schedule.ts          # Anchor, Activity, Chore
    │   ├── house.ts             # RoomId, Waypoint
    │   └── character.ts         # CharacterLook
    ├── data/
    │   ├── houseLayout.ts       # 방 경계·waypoint 좌표
    │   ├── defaultSchedule.ts   # 하루 앵커·활동
    │   └── characterPresets.ts  # Look 프리셋
    ├── state/
    │   ├── playbackReducer.ts   # FSM + simTime
    │   └── PlaybackProvider.tsx
    ├── scene/
    │   ├── SceneRoot.tsx        # Lights, Camera, Controls
    │   ├── House.tsx            # 방 메시 조립
    │   ├── rooms/               # Room*.tsx (거실, 주방 등)
    │   ├── Character.tsx        # 이동·Look 적용
    │   └── useCharacterTarget.ts# 현재 스케줄 → waypoint
    └── hud/
        ├── HudOverlay.tsx       # 상단·하단 바
        ├── TimeDisplay.tsx
        ├── ActivityPanel.tsx
        └── PlaybackControls.tsx
```

**모듈 경계**

- `data/*`: 순수 데이터, React 비의존
- `state/*`: 시뮬레이션 시각·재생 FSM
- `scene/*`: R3F 전용, `useFrame`에서 simTime 소비
- `hud/*`: DOM 오버레이, Context 구독

---

## 3. 집 레이아웃 (House Layout)

### 3.1 좌표계

- **단위:** 1 unit ≈ 1m
- **Y-up**, 바닥 `y = 0`
- 집 전체를 원점 근처에 배치; 카메라는 대각선에서 조망

### 3.2 방 구성 (MVP)

| RoomId | 한글명 | 대략 위치 (x, z) | 주요 Waypoint | 비고 |
|--------|--------|------------------|---------------|------|
| `living` | 거실 | (0, 0) | `living_sofa`, `living_center` | TV·소파 |
| `kitchen` | 주방 | (6, 0) | `kitchen_sink`, `kitchen_table` | 설거지 chore |
| `bedroom` | 침실 | (0, -5) | `bedroom_bed`, `bedroom_desk` | |
| `bathroom` | 욕실 | (6, -5) | `bathroom_sink` | 소형 |
| `entry` | 현관 | (3, 3) | `entry_mat` | 방 간 허브 |

방은 **바닥 Plane + 벽 Box** 로 구획; `houseLayout.ts`에 각 waypoint의 `[x, y, z]` 와 `roomId` 를 정의한다.

### 3.3 이동 규칙

- 캐릭터 위치는 매 프레임 **선형 보간(lerp)** 으로 현재 waypoint에 접근
- 속도: `moveSpeed` (m/s), MVP 기본 `1.5`
- 방 전환 시에도 동일 waypoint ID만 사용(문 애니메이션 없음)

```typescript
// types/house.ts (개념)
export type RoomId = 'living' | 'kitchen' | 'bedroom' | 'bathroom' | 'entry';

export interface Waypoint {
  id: string;
  roomId: RoomId;
  position: [number, number, number];
  label?: string;
}
```

---

## 4. CharacterLook — 색상 샘플링

MVP는 **단일 캡슐/박스 조합 캐릭터** 또는 **간단 GLB**에 **MeshStandardMaterial color** 를 적용한다.

### 4.1 Look 스키마

```typescript
export interface CharacterLook {
  id: string;
  name: string;
  skin: string;      // hex
  hair: string;
  top: string;
  bottom: string;
  accent?: string;
}
```

### 4.2 샘플링 방식

1. **프리셋:** `characterPresets.ts`에 3종 이상 정의
2. **런타임:** HUD에서 프리셋 선택 → Context `lookId` 변경 → `Character`가 파트별 material.color 갱신
3. (P1) **URL/hash 색상:** query `?skin=...` 파싱 — MVP optional

파트 매핑 예: `body` → skin, `hairMesh` → hair, `shirt` → top, `pants` → bottom

---

## 5. 스케줄 — 앵커·집안일(Chores)

### 5.1 데이터 모델

```typescript
export type ActivityKind = 'rest' | 'chore' | 'commute' | 'work' | 'meal';

export interface ScheduleSegment {
  anchor: string;           // "HH:mm" 24h
  activityId: string;
  label: string;            // HUD 표시
  kind: ActivityKind;
  roomId: RoomId;
  waypointId: string;
  isChore: boolean;         // kind === 'chore' 와 동기 권장
}

export interface DaySchedule {
  dayLabel: string;
  startSim: string;         // 타임라인 시작 (예: "06:00")
  endSim: string;           // 예: "23:00"
  segments: ScheduleSegment[]; // anchor 오름차순
}
```

### 5.2 앵커 해석

- `segments[i].anchor <= simTime < segments[i+1].anchor` → i번 구간 활성
- 마지막 구간은 `endSim` 전까지 유지
- `simTime`은 **분 단위 float** 또는 **초-from-midnight** 내부 표현 후 HUD에 HH:mm 포맷

### 5.3 Chore 예시 (defaultSchedule)

| Anchor | Label | Room | Waypoint | isChore |
|--------|-------|------|----------|---------|
| 07:00 | 아침 준비 | bathroom | bathroom_sink | false |
| 07:45 | 설거지 | kitchen | kitchen_sink | **true** |
| 08:30 | 거실 정리 | living | living_center | **true** |
| 12:30 | 점심 | kitchen | kitchen_table | false |
| 19:00 | 저녁 설거지 | kitchen | kitchen_sink | **true** |
| 22:30 | 취침 준비 | bedroom | bedroom_bed | false |

### 5.4 simTime 진행

- `playing` 상태: `simTime += deltaRealSeconds * speed * simMinutesPerRealSecond`
- MVP: `simMinutesPerRealSecond = 1` (1 real sec = 1 sim minute), `speed = 1`

---

## 6. 재생 상태 머신 (Playback FSM)

### 6.1 상태

```
                    ┌─────────────┐
         ┌─────────│    idle     │─────────┐
         │         └─────────────┘         │
         │ play (t=start)                  │ stop / endOfDay
         ▼                                 ▼
┌─────────────────┐              pause    ┌─────────────┐
│    playing      │◄───────────────────│   paused    │
└─────────────────┘      play          └─────────────┘
         │                                 │
         └──────── endOfDay ───────────────┘
                    → idle (simTime reset optional)
```

| 상태 | simTime | 캐릭터 이동 | HUD |
|------|---------|-------------|-----|
| `idle` | 시작 앵커 또는 0 | 정지 | Play 활성 |
| `playing` | 증가 | waypoint 추적 | Pause 활성 |
| `paused` | 고정 | 정지 | Play 활성 |

### 6.2 Reducer 액션 (예시)

- `PLAY`, `PAUSE`, `TOGGLE`
- `TICK(deltaMs)` — playing일 때만 simTime 갱신
- `SET_SPEED(n)` — P1
- `SET_LOOK(presetId)`
- `RESET` — idle + simTime = startSim

### 6.3 현재 세그먼트 파생

```typescript
function getActiveSegment(schedule: DaySchedule, simMinutes: number): ScheduleSegment;
```

`App` 또는 `PlaybackProvider`에서 memoized selector로 `activeSegment` → Character + HUD에 전달.

---

## 7. HUD 레이아웃

### 7.1 구조 (HTML 오버레이)

```
┌──────────────────────────────────────────────────────────┐
│  [ 시뮬 시각 07:30 ]     [ 활동: 설거지 · chore ]        │  ← top bar
├──────────────────────────────────────────────────────────┤
│                                                          │
│                    3D Canvas (flex: 1)                   │
│                                                          │
├──────────────────────────────────────────────────────────┤
│  ◀ ▐▐ ▶   [========●====] 45%    Look: [프리셋 ▼]        │  ← bottom bar
└──────────────────────────────────────────────────────────┘
```

### 7.2 영역 spec

| 컴포넌트 | 위치 | 내용 |
|----------|------|------|
| `TimeDisplay` | 상단 좌 | `formatSimTime(simTime)`, 재생 중 subtle pulse (optional) |
| `ActivityPanel` | 상단 우 | `label`, `roomId` 한글명, chore 뱃지 |
| `PlaybackControls` | 하단 좌 | Play/Pause, (Reset P1) |
| Progress | 하단 중 | `(simTime - start) / (end - start)` progress bar |
| Look selector | 하단 우 | `<select>` 또는 버튼 그룹 |

### 7.3 스타일 가이드 (MVP)

- HUD 배경: `rgba(0,0,0,0.55)`, 텍스트 `#f5f5f5`
- Chore 뱃지: `#e8a838` 또는 기획 브랜드 보조색
- `pointer-events: auto` on HUD only; Canvas는 전체 영역
- z-index: HUD `10`, Canvas `0`

---

## 8. 씬·루프 통합

```text
main.tsx
  └─ PlaybackProvider
       └─ App
            ├─ Canvas (R3F)
            │    └─ SceneRoot → House + Character
            └─ HudOverlay (position: fixed inset 0, flex column)
```

- `useFrame` (Character): `playing`일 때 waypoint 방향 lerp
- `useEffect` + `requestAnimationFrame` 또는 `useFrame`에서 `TICK` dispatch (playing)
- `endSim` 도달 시 `PAUSE` 또는 `idle` + 토스트(optional)

---

## 9. 기획 FR 추적 매트릭스

| FR | 설계 대응 |
|----|-----------|
| FR-HOUSE-01~04 | §3 House + `houseLayout.ts` |
| FR-HOUSE-05 | `SceneRoot` OrbitControls |
| FR-CHAR-01~04 | §4 Character + waypoint lerp |
| FR-SCHED-01~05 | §5 schedule data + §6 FSM |
| FR-HUD-01~06 | §7 HudOverlay |

---

## 10. 리스크 및 완화

| 리스크 | 완화 |
|--------|------|
| R3F 리렌더 과다 | simTime은 ref + selector, material color만局部更新 |
| 스케줄·waypoint 불일치 | 빌드 시 zod/수동 테스트로 ID 검증 스크립트 (P1) |
| 저사양 GPU | 그림자 off, mesh count 최소 |

---

## 11. 구현 순서 (권장)

1. Vite scaffold + 빈 Canvas + OrbitControls
2. `houseLayout` + House meshes
3. PlaybackProvider + FSM + HUD shell
4. defaultSchedule + Character 이동
5. CharacterLook 프리셋 + chore 뱃지
6. 진행률 바·속도(P1)·폴리시
