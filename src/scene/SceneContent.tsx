import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { House } from '../world/House'
import { SimTick } from './SimTick'
import { SceneCharacter } from './SceneCharacter'

export function SceneContent() {
  return <><SimTick /><PerspectiveCamera makeDefault position={[14, 12, 14]} fov={42} /><OrbitControls target={[0, 0.5, -0.5]} maxPolarAngle={Math.PI / 2.2} minDistance={8} maxDistance={28} enablePan={false} /><ambientLight intensity={0.65} /><directionalLight position={[8, 14, 6]} intensity={1.1} castShadow /><House /><SceneCharacter /></>
}
