import { RoundedBox } from '@react-three/drei'
import { ROOMS, WALL_HEIGHT, WALL_SEGMENTS, STATIONS, type StationId } from './layout'

function Floor({ cx, cz, w, d, color }: { cx: number; cz: number; w: number; d: number; color: string }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[cx, 0.01, cz]} receiveShadow>
      <planeGeometry args={[w, d]} />
      <meshStandardMaterial color={color} />
    </mesh>
  )
}

function Wall({ x1, z1, x2, z2 }: { x1: number; z1: number; x2: number; z2: number }) {
  const mx = (x1 + x2) / 2
  const mz = (z1 + z2) / 2
  const len = Math.hypot(x2 - x1, z2 - z1)
  const angle = Math.atan2(z2 - z1, x2 - x1)
  return (
    <mesh position={[mx, WALL_HEIGHT / 2, mz]} rotation={[0, -angle, 0]}>
      <boxGeometry args={[len, WALL_HEIGHT, 0.12]} />
      <meshStandardMaterial color="#faf8f5" />
    </mesh>
  )
}

function Furniture({ stationId }: { stationId: StationId }) {
  const s = STATIONS[stationId]
  const { x, y, z } = s.position
  const ry = s.rotationY ?? 0
  const pastel = (h: number) => `hsl(${h}, 45%, 78%)`

  switch (stationId) {
    case 'bed':
      return (
        <group position={[x, y, z]} rotation={[0, ry, 0]}>
          <RoundedBox args={[2.2, 0.45, 1.6]} radius={0.08} position={[0, 0.25, 0]}>
            <meshStandardMaterial color={pastel(220)} />
          </RoundedBox>
          <RoundedBox args={[0.5, 0.2, 0.5]} radius={0.05} position={[-0.7, 0.55, -0.4]}>
            <meshStandardMaterial color="#fff5f5" />
          </RoundedBox>
        </group>
      )
    case 'sofa':
      return (
        <group position={[x, y, z]} rotation={[0, ry, 0]}>
          <RoundedBox args={[2.4, 0.55, 1]} radius={0.1} position={[0, 0.3, 0]}>
            <meshStandardMaterial color={pastel(25)} />
          </RoundedBox>
          <RoundedBox args={[2.4, 0.5, 0.25]} radius={0.05} position={[0, 0.55, 0.45]}>
            <meshStandardMaterial color={pastel(30)} />
          </RoundedBox>
        </group>
      )
    case 'tv':
      return (
        <group position={[x, y, z]}>
          <RoundedBox args={[1.6, 0.9, 0.08]} radius={0.03} position={[0, 0.7, 0]}>
            <meshStandardMaterial color="#4a5568" />
          </RoundedBox>
          <mesh position={[0, 0.35, 0]}>
            <boxGeometry args={[0.4, 0.35, 0.35]} />
            <meshStandardMaterial color={pastel(200)} />
          </mesh>
        </group>
      )
    case 'diningTable':
      return (
        <group position={[x, y, z]}>
          <RoundedBox args={[1.4, 0.08, 0.9]} radius={0.04} position={[0, 0.75, 0]}>
            <meshStandardMaterial color={pastel(35)} />
          </RoundedBox>
          {[0.5, -0.5].map((dx) =>
            [0.35, -0.35].map((dz) => (
              <mesh key={`${dx}-${dz}`} position={[dx, 0.375, dz]}>
                <cylinderGeometry args={[0.04, 0.04, 0.75, 8]} />
                <meshStandardMaterial color={pastel(35)} />
              </mesh>
            )),
          )}
        </group>
      )
    case 'stove':
      return (
        <group position={[x, y, z]}>
          <RoundedBox args={[0.9, 0.9, 0.6]} radius={0.06} position={[0, 0.45, 0]}>
            <meshStandardMaterial color="#e2e8f0" />
          </RoundedBox>
          <mesh position={[0, 0.92, 0]}>
            <boxGeometry args={[0.75, 0.04, 0.45]} />
            <meshStandardMaterial color="#718096" />
          </mesh>
        </group>
      )
    case 'sink':
      return (
        <group position={[x, y, z]}>
          <RoundedBox args={[1.2, 0.85, 0.55]} radius={0.05} position={[0, 0.425, 0]}>
            <meshStandardMaterial color={pastel(195)} />
          </RoundedBox>
        </group>
      )
    case 'fridge':
      return (
        <RoundedBox args={[0.75, 1.6, 0.65]} radius={0.06} position={[x, 0.8, z]}>
          <meshStandardMaterial color="#f7fafc" />
        </RoundedBox>
      )
    case 'desk':
      return (
        <group position={[x, y, z]}>
          <RoundedBox args={[1.4, 0.08, 0.7]} radius={0.04} position={[0, 0.75, 0]}>
            <meshStandardMaterial color={pastel(28)} />
          </RoundedBox>
          <mesh position={[-0.55, 0.375, 0]}>
            <boxGeometry args={[0.08, 0.75, 0.6]} />
            <meshStandardMaterial color={pastel(28)} />
          </mesh>
          <mesh position={[0.55, 0.375, 0]}>
            <boxGeometry args={[0.08, 0.75, 0.6]} />
            <meshStandardMaterial color={pastel(28)} />
          </mesh>
        </group>
      )
    case 'chair':
      return (
        <group position={[x, y, z]}>
          <RoundedBox args={[0.45, 0.08, 0.45]} radius={0.04} position={[0, 0.45, 0]}>
            <meshStandardMaterial color={pastel(260)} />
          </RoundedBox>
          <RoundedBox args={[0.45, 0.5, 0.08]} radius={0.03} position={[0, 0.7, -0.18]}>
            <meshStandardMaterial color={pastel(260)} />
          </RoundedBox>
        </group>
      )
    case 'bookshelf':
      return (
        <RoundedBox args={[0.35, 1.4, 1]} radius={0.04} position={[x, 0.7, z]}>
          <meshStandardMaterial color={pastel(15)} />
        </RoundedBox>
      )
    case 'wardrobe':
      return (
        <RoundedBox args={[1.2, 1.8, 0.5]} radius={0.05} position={[x, 0.9, z]}>
          <meshStandardMaterial color={pastel(40)} />
        </RoundedBox>
      )
    case 'nightstand':
      return (
        <RoundedBox args={[0.45, 0.45, 0.4]} radius={0.05} position={[x, 0.225, z]}>
          <meshStandardMaterial color={pastel(35)} />
        </RoundedBox>
      )
    case 'toilet':
      return (
        <group position={[x, y, z]}>
          <mesh position={[0, 0.35, 0]}>
            <cylinderGeometry args={[0.22, 0.25, 0.35, 12]} />
            <meshStandardMaterial color="#fff" />
          </mesh>
          <RoundedBox args={[0.35, 0.35, 0.25]} radius={0.05} position={[0, 0.65, -0.1]}>
            <meshStandardMaterial color="#fff" />
          </RoundedBox>
        </group>
      )
    case 'washbasin':
      return (
        <group position={[x, y, z]}>
          <RoundedBox args={[0.9, 0.75, 0.45]} radius={0.05} position={[0, 0.375, 0]}>
            <meshStandardMaterial color="#fff" />
          </RoundedBox>
          <mesh position={[0, 0.82, 0.05]}>
            <sphereGeometry args={[0.18, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#cbd5e0" />
          </mesh>
        </group>
      )
    case 'shower':
      return (
        <group position={[x, y, z]}>
          <mesh position={[0, 0.6, 0]}>
            <boxGeometry args={[0.9, 1.2, 0.9]} />
            <meshStandardMaterial color="#bee3f8" transparent opacity={0.35} />
          </mesh>
        </group>
      )
    case 'laptop':
      return (
        <group position={[x, y, z]}>
          <mesh rotation={[-0.3, 0, 0]}>
            <boxGeometry args={[0.35, 0.22, 0.02]} />
            <meshStandardMaterial color="#2d3748" />
          </mesh>
        </group>
      )
    default:
      return null
  }
}

const FURNITURE_IDS = Object.keys(STATIONS) as StationId[]

export function House() {
  return (
    <group>
      {Object.values(ROOMS).map((room) => (
        <Floor
          key={room.id}
          cx={room.center.x}
          cz={room.center.z}
          w={room.size.width}
          d={room.size.depth}
          color={room.floorColor}
        />
      ))}
      {WALL_SEGMENTS.map((w, i) => (
        <Wall key={i} x1={w.x1} z1={w.z1} x2={w.x2} z2={w.z2} />
      ))}
      {FURNITURE_IDS.filter((id) => id !== 'laptop').map((id) => (
        <Furniture key={id} stationId={id} />
      ))}
      <Furniture stationId="laptop" />
    </group>
  )
}
