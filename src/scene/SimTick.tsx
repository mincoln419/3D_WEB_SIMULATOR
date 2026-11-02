import { useFrame } from '@react-three/fiber'
import { useSimulationStore } from '../sim/simulationStore'

export function SimTick() {
  const tick = useSimulationStore((s) => s.tick)
  useFrame((_, delta) => tick(delta))
  return null
}
