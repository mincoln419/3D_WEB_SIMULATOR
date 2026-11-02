import { useSimulationStore } from '../sim/simulationStore'

export function useSceneCharacterState() {
  const look = useSimulationStore((s) => s.look)
  const position = useSimulationStore((s) => s.position)
  const rotationY = useSimulationStore((s) => s.rotationY)
  const animState = useSimulationStore((s) => s.animState)
  return { look, position, rotationY, animState }
}
