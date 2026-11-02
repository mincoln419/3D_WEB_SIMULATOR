import { Canvas } from '@react-three/fiber'
import { SceneContent } from './SceneContent'

export function SceneHost() {
  return <Canvas shadows style={{ flex: 1, background: '#dbeafe' }}><SceneContent /></Canvas>
}

export { SceneHost as Scene }
export { SimTick } from './SimTick'
