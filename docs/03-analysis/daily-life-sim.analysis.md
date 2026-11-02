# 일상 생활 3D 시뮬레이터 MVP — 분석 (Check)

> **분석 유형**: 설계 대비 구현 갭 분석  
> **분석일**: 2026-11-02  
> **설계서**: [daily-life-sim.design.md](../02-design/features/daily-life-sim.design.md)  
> **기획서**: [daily-life-sim.plan.md](../01-plan/features/daily-life-sim.plan.md)

---

## 1. 분석 개요

### 1.1 목적

MVP 구현이 기획 FR 및 설계서와 일치하는지 **Check** 단계에서 검증하고, 허용 가능한 구조·도메인 차이를 문서화한다.

### 1.2 범위

| 항목 | 경로 |
|------|------|
| 설계 | `docs/02-design/features/daily-life-sim.design.md` |
| 구현 | `src/` (scene, sim, world, character, ui) |
| 검증 환경 | 로컬 Vite dev 서버 `http://localhost:5174/` |

---

## 2. 검증 방법

| 방법 | 결과 | 비고 |
|------|------|------|
| 브라우저 수동 확인 | ✅ 통과 | 집·가구 렌더, 캐릭터 색상, 재생·시계 진행, Wait→Walk→Act 전환 |
| TypeScript | ✅ 통과 | `tsc -p tsconfig.app.json --noEmit` (build 스크립트 내) |
| 프로덕션 빌드 | ✅ 통과 | `npm run build` (tsc + vite build) |

---

## 3. 기능 요구사항 (FR) 대비 구현

> **종합**: P0·P1 FR 및 MVP 제외 항목 모두 **PASS** (제외 FR은 범위 준수로 PASS 처리).

### FR-HOUSE — 집(공간)

| ID | 요구사항 | 우선순위 | 결과 | 근거 |
|----|----------|----------|------|------|
| FR-HOUSE-01 | 단일 층 주택 3D 렌더 | P0 | ✅ PASS | `House.tsx` + R3F Canvas |
| FR-HOUSE-02 | 방 구역 구분 | P0 | ✅ PASS | 거실·주방·침실·욕실 등 바닥/벽 구획 |
| FR-HOUSE-03 | 바닥 영역·waypoint | P0 | ✅ PASS | `world/layout.ts` station/waypoint |
| FR-HOUSE-04 | 단순 메시 가구 | P0 | ✅ PASS | 프리미티브 기반 가구·표면 |
| FR-HOUSE-05 | Orbit 조망 | P1 | ✅ PASS | `Scene.tsx` OrbitControls |

### FR-CHAR — 캐릭터

| ID | 요구사항 | 우선순위 | 결과 | 근거 |
|----|----------|----------|------|------|
| FR-CHAR-01 | 단일 캐릭터 | P0 | ✅ PASS | `Character.tsx` 1명 |
| FR-CHAR-02 | CharacterLook 색상 샘플링 | P0 | ✅ PASS | `sampleColors.ts`·사진 기반 색 적용 확인 |
| FR-CHAR-03 | 스케줄 waypoint 이동·활동 | P0 | ✅ PASS | pathfinding + `SimPhase` Walk/Act |
| FR-CHAR-04 | 바닥 Y 유지 | P0 | ✅ PASS | 이동 시 고정 바닥 높이 |
| FR-CHAR-05 | 다중·고급 애니 제외 | — | ✅ PASS | MVP 범위 외 미구현(기획 준수) |

### FR-SCHED — 스케줄

| ID | 요구사항 | 우선순위 | 결과 | 근거 |
|----|----------|----------|------|------|
| FR-SCHED-01 | 하루 타임라인 | P0 | ✅ PASS | 07:00 시작, `DAY_END` 23:00 |
| FR-SCHED-02 | 앵커·활동·waypoint·chore | P0 | ✅ PASS | `tasks.ts` + `schedule.ts` |
| FR-SCHED-03 | 재생·simTime 진행 | P0 | ✅ PASS | Play 시 HUD 시계 전진 |
| FR-SCHED-04 | 일시정지·재개·속도 | P0/P1 | ✅ PASS | Pause/Play, 1x 필수 충족 |
| FR-SCHED-05 | 구간 자동 전환 | P0 | ✅ PASS | Wait→Walk→Act→다음 항목 |
| FR-SCHED-06 | 편집 UI 제외 | — | ✅ PASS | 코드 상수·스토어로만 제공 |

**스케줄 내용 (검증 증거)**

- 앵커: 기상, 세수, 아침/점심/저녁 요리·식사, 샤워, **취침 준비**(30분)
- 기본 삽입 chore: **침대 정리(makeBed)**, **설거지(dishes)**, **노트북 업무(laptopWork)** — `buildSchedule` 갭 채우기

### FR-HUD — HUD

| ID | 요구사항 | 우선순위 | 결과 | 근거 |
|----|----------|----------|------|------|
| FR-HUD-01 | 시뮬 시각 표시 | P0 | ✅ PASS | `Hud.tsx` |
| FR-HUD-02 | 활동명·방/chore 라벨 | P0 | ✅ PASS | 현재 항목·phase 표시 |
| FR-HUD-03 | 재생/일시정지 | P0 | ✅ PASS | Play/Pause 컨트롤 |
| FR-HUD-04 | 하루 진행률 | P1 | ✅ PASS | 진행 표시 |
| FR-HUD-05 | Look 프리셋(2~3+) | P1 | ✅ PASS | 색상 샘플/프리셋 |
| FR-HUD-06 | HTML 오버레이 HUD | P0 | ✅ PASS | Canvas 위 DOM 레이아웃 |

---

## 4. 설계 대비 구조 매핑

| 설계 (§2) | 구현 | 상태 |
|-----------|------|------|
| `SceneRoot.tsx` | `scene/Scene.tsx` (Canvas·조명·컨트롤) | ✅ |
| SceneHost / tick | `SimTick.tsx`, `SceneContent.tsx` | ✅ (분할) |
| `PlaybackProvider` + reducer | `simulationStore.ts` (Zustand) | ⚠️ 기술 선택 차이, 동작 동일 |
| `defaultSchedule.ts` | `sim/tasks.ts` + `schedule.ts` | ✅ |
| `houseLayout.ts` | `world/layout.ts` | ✅ |
| `HudOverlay` | `ui/Hud.tsx` | ✅ |

---

## 5. Match Rate

```
┌─────────────────────────────────────────────┐
│  Overall Match Rate: ~95%                    │
├─────────────────────────────────────────────┤
│  ✅ FR 체크리스트:     전 항목 PASS           │
│  ⚠️ 설계 파일명/상태:  Zustand, scene 분할    │
│  ❌ P0 미구현:         없음                   │
└─────────────────────────────────────────────┘
```

**~95% 산정 근거**: 기능·UX는 기획/설계 의도와 일치. 잔여 5%는 설계서의 디렉터리·Context/reducer 명칭과 실제 `zustand`·`scene/*` 모듈 분할, 스케줄 데이터 파일명 차이(동작 동등).

---

## 6. 검증 증거 (브라우저 · 빌드)

1. **3D 씬**: 단일 주택, 벽·바닥·기본 가구가 보임.
2. **캐릭터**: 사진/샘플 기반 **CharacterLook** 색상이 몸·의상에 반영됨.
3. **재생**: Play 클릭 시 **시뮬레이션 시계**가 앞으로 진행.
4. **FSM**: 캐릭터 phase **Wait → Walk → Act** 순환 확인 (`simulationStore.ts`).
5. **일과**: 기상·세수·아침/점심/저녁 요리·식사·샤워·취침 준비 및 기본 chore 3종 스케줄 반영.
6. **빌드**: `npm run build` — TypeScript 검사 및 Vite 번들 성공.

---

## 7. 정당화된 차이 (Design ↔ Implementation)

| 항목 | 설계/기획 기대 | 실제 구현 | 정당화 |
|------|----------------|-----------|--------|
| SceneHost | 단일 `SceneRoot` | `Scene.tsx` + `SimTick.tsx` + `SceneContent.tsx` + `SceneCharacter.tsx` | 관심사 분리(틱·콘텐츠·캐릭터), R3F 성능·가독성 |
| 상태 관리 | Context + useReducer | Zustand (`simulationStore.ts`) | MVP 단일 스토어, HUD·씬 동기 단순화 |
| sleep 세그먼트 | 설계 예시 "취침 준비" | `sleep` 30분 **취침 준비** (`tasks.ts`) | **overnight 수면 시뮬 제외** — 하루 단위 데모에 적합 |
| 하루 종료 | `endSim` 예: 23:00 | `DAY_END_MINUTES` = 23:00 | 취침 준비 종료 시점과 일치 |
| House 역할 | rooms/ 하위 분할 (설계 예) | `world/House.tsx` 단일 조립 | MVP 메시 수 적음, 동일 FR 충족 |

---

## 8. 권장 후속 (설계 문서)

- [ ] 설계 §2 파일 트리를 `scene/*`, `sim/*`, `world/*` 실구조로 갱신
- [ ] §6 FSM을 `SimPhase` (Wait/Walk/Act/DayEnd) 용어로 정렬
- [ ] 상태 관리를 Zustand로 명시 (Context는 대안)

---

## 9. Check 결론

**MVP P0(및 검증된 P1) 요구사항은 구현·브라우저·빌드로 확인되었으며, Check 단계를 통과한다.**  
Act 단계 보고서: [daily-life-sim.report.md](../04-report/daily-life-sim.report.md)

---

## 버전 이력

| 버전 | 날짜 | 변경 | 작성 |
|------|------|------|------|
| 0.1 | 2026-11-02 | 초안 (shell 미검증) | — |
| 1.0 | 2026-11-02 | 브라우저·빌드 검증 반영, FR 전체 PASS, Match ~95% | PDCA Check |
