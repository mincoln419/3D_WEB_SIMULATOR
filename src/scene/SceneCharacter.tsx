import { Character } from '../character/Character'
import { useSceneCharacterState } from './useSceneCharacterState'

export function SceneCharacter() {
  const { look, position, rotationY, animState } = useSceneCharacterState()
  return <Character look={look} position={position} rotationY={rotationY} animState={animState} />
}
