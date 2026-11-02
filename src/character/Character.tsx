import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { CharacterLook } from './sampleColors'

export type AnimState = 'idle' | 'walk' | 'actStanding' | 'sit'

export interface CharacterProps {
  look: CharacterLook
  position: THREE.Vector3
  rotationY: number
  animState: AnimState
}

export function Character({ look, position, rotationY, animState }: CharacterProps) {
  const root = useRef<THREE.Group>(null!)
  const leftLeg = useRef<THREE.Group>(null!)
  const rightLeg = useRef<THREE.Group>(null!)
  const leftArm = useRef<THREE.Group>(null!)
  const rightArm = useRef<THREE.Group>(null!)
  const body = useRef<THREE.Group>(null!)
  const t = useRef(0)

  useFrame((_, delta) => {
    t.current += delta
    const g = root.current
    if (!g) return
    g.position.copy(position)
    g.rotation.y = rotationY

    const phase = t.current * 8
    leftLeg.current.rotation.x = 0
    rightLeg.current.rotation.x = 0
    leftArm.current.rotation.x = 0
    rightArm.current.rotation.x = 0
    body.current.position.y = 0.55

    if (animState === 'walk') {
      const swing = Math.sin(phase) * 0.45
      leftLeg.current.rotation.x = swing
      rightLeg.current.rotation.x = -swing
      leftArm.current.rotation.x = -swing * 0.5
      rightArm.current.rotation.x = swing * 0.5
      body.current.position.y = 0.55 + Math.abs(Math.sin(phase * 2)) * 0.04
    } else if (animState === 'actStanding') {
      const w = Math.sin(t.current * 5) * 0.35
      rightArm.current.rotation.x = -0.8 + w
      leftArm.current.rotation.x = -0.4 - w * 0.5
    } else if (animState === 'sit') {
      leftLeg.current.rotation.x = -1.2
      rightLeg.current.rotation.x = -1.2
      body.current.position.y = 0.35
    }
  })

  const headY = 1.05
  const headR = 0.38

  return (
    <group ref={root}>
      <group ref={body} position={[0, 0.55, 0]}>
        <mesh position={[0, 0.15, 0]}>
          <capsuleGeometry args={[0.22, 0.35, 4, 8]} />
          <meshStandardMaterial color={look.clothes} />
        </mesh>
        <group ref={leftArm} position={[-0.28, 0.25, 0]}>
          <mesh position={[0, -0.15, 0]}>
            <capsuleGeometry args={[0.07, 0.18, 4, 6]} />
            <meshStandardMaterial color={look.skin} />
          </mesh>
        </group>
        <group ref={rightArm} position={[0.28, 0.25, 0]}>
          <mesh position={[0, -0.15, 0]}>
            <capsuleGeometry args={[0.07, 0.18, 4, 6]} />
            <meshStandardMaterial color={look.skin} />
          </mesh>
        </group>
      </group>
      <group ref={leftLeg} position={[-0.12, 0.35, 0]}>
        <mesh position={[0, -0.15, 0]}>
          <capsuleGeometry args={[0.08, 0.2, 4, 6]} />
          <meshStandardMaterial color={look.clothes} />
        </mesh>
      </group>
      <group ref={rightLeg} position={[0.12, 0.35, 0]}>
        <mesh position={[0, -0.15, 0]}>
          <capsuleGeometry args={[0.08, 0.2, 4, 6]} />
          <meshStandardMaterial color={look.clothes} />
        </mesh>
      </group>
      <mesh position={[0, headY, 0]}>
        <sphereGeometry args={[headR, 24, 24]} />
        <meshStandardMaterial color={look.skin} />
      </mesh>
      <mesh position={[0, headY + 0.12, 0]}>
        <sphereGeometry args={[headR * 0.92, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        <meshStandardMaterial color={look.hair} />
      </mesh>
      <mesh position={[-0.12, headY + 0.02, headR * 0.85]}>
        <sphereGeometry args={[0.09, 12, 12]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh position={[0.12, headY + 0.02, headR * 0.85]}>
        <sphereGeometry args={[0.09, 12, 12]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh position={[-0.12, headY + 0.02, headR * 0.95]}>
        <sphereGeometry args={[0.05, 10, 10]} />
        <meshStandardMaterial color={look.eye} />
      </mesh>
      <mesh position={[0.12, headY + 0.02, headR * 0.95]}>
        <sphereGeometry args={[0.05, 10, 10]} />
        <meshStandardMaterial color={look.eye} />
      </mesh>
      <mesh position={[-0.18, headY - 0.08, headR * 0.82]}>
        <sphereGeometry args={[0.045, 8, 8]} />
        <meshStandardMaterial color={look.cheek} transparent opacity={0.65} />
      </mesh>
      <mesh position={[0.18, headY - 0.08, headR * 0.82]}>
        <sphereGeometry args={[0.045, 8, 8]} />
        <meshStandardMaterial color={look.cheek} transparent opacity={0.65} />
      </mesh>
      <mesh position={[0, headY - 0.12, headR * 0.9]} rotation={[0, 0, 0]}>
        <sphereGeometry args={[0.035, 8, 8]} />
        <meshStandardMaterial color="#c53030" />
      </mesh>
    </group>
  )
}
