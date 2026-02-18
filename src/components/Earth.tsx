import { useRef, useMemo, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Line } from '@react-three/drei'
import * as THREE from 'three'

// Loading fallback
function Loader() {
  return (
    <mesh>
      <sphereGeometry args={[1, 32, 32]} />
      <meshBasicMaterial color="#333333" wireframe />
    </mesh>
  )
}

// Particle points representing Earth continents
function EarthParticles() {
  const pointsRef = useRef<THREE.Points>(null!)

  const geometry = useMemo(() => {
    const count = 8000
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const radius = 2 + Math.random() * 0.1

      const x = radius * Math.sin(phi) * Math.cos(theta)
      const y = radius * Math.sin(phi) * Math.sin(theta)
      const z = radius * Math.cos(phi)

      positions[i * 3] = x
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = z

      const brightness = 0.3 + Math.random() * 0.7
      colors[i * 3] = brightness
      colors[i * 3 + 1] = brightness
      colors[i * 3 + 2] = brightness
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    return geo
  }, [])

  useFrame(() => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.001
    }
  })

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial size={0.02} vertexColors transparent opacity={0.9} sizeAttenuation />
    </points>
  )
}

// Inner sphere
function InnerSphere() {
  return (
    <mesh>
      <sphereGeometry args={[1.95, 64, 64]} />
      <meshBasicMaterial color="#050505" />
    </mesh>
  )
}

// Atmosphere glow
function Atmosphere() {
  const atmosphereRef = useRef<THREE.Mesh>(null!)

  useFrame((state) => {
    if (atmosphereRef.current) {
      const material = atmosphereRef.current.material as THREE.ShaderMaterial
      if (material.uniforms && material.uniforms.uTime) {
        material.uniforms.uTime.value = state.clock.elapsedTime
      }
    }
  })

  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 } },
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
          float pulse = 0.8 + 0.2 * sin(uTime * 0.5);
          vec3 color = vec3(0.6, 0.6, 0.7) * intensity * pulse;
          gl_FragColor = vec4(color, intensity * 0.6);
        }
      `,
      transparent: true,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending
    })
  }, [])

  return (
    <mesh ref={atmosphereRef} scale={[1.3, 1.3, 1.3]}>
      <sphereGeometry args={[2, 64, 64]} />
      <primitive object={shaderMaterial} attach="material" />
    </mesh>
  )
}

// Data arcs
function DataArcs() {
  const arcsRef = useRef<THREE.Group>(null!)

  const arcs = useMemo(() => {
    const cities = [
      { lat: 40.7128, lon: -74.0060 },
      { lat: 51.5074, lon: -0.1278 },
      { lat: 35.6762, lon: 139.6503 },
      { lat: -33.8688, lon: 151.2093 },
      { lat: 25.2048, lon: 55.2708 },
      { lat: 1.3521, lon: 103.8198 },
      { lat: 37.7749, lon: -122.4194 },
      { lat: 19.0760, lon: 72.8777 }
    ]

    const arcData: { start: THREE.Vector3; end: THREE.Vector3 }[] = []

    for (let i = 0; i < cities.length; i++) {
      for (let j = i + 1; j < cities.length; j++) {
        if (Math.random() > 0.6) continue

        const lat1 = cities[i].lat * Math.PI / 180
        const lon1 = cities[i].lon * Math.PI / 180
        const lat2 = cities[j].lat * Math.PI / 180
        const lon2 = cities[j].lon * Math.PI / 180

        const x1 = 2.1 * Math.cos(lat1) * Math.cos(lon1)
        const y1 = 2.1 * Math.sin(lat1)
        const z1 = 2.1 * Math.cos(lat1) * Math.sin(lon1)

        const x2 = 2.1 * Math.cos(lat2) * Math.cos(lon2)
        const y2 = 2.1 * Math.sin(lat2)
        const z2 = 2.1 * Math.cos(lat2) * Math.sin(lon2)

        arcData.push({
          start: new THREE.Vector3(x1, y1, z1),
          end: new THREE.Vector3(x2, y2, z2)
        })
      }
    }

    return arcData
  }, [])

  useFrame(() => {
    if (arcsRef.current) {
      arcsRef.current.rotation.y += 0.0005
    }
  })

  return (
    <group ref={arcsRef}>
      {arcs.map((arc, index) => (
        <DataArc key={index} start={arc.start} end={arc.end} />
      ))}
    </group>
  )
}

function DataArc({ start, end }: { start: THREE.Vector3; end: THREE.Vector3 }) {
  const curve = useMemo(() => {
    const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5)
    const distance = start.distanceTo(end)
    mid.normalize().multiplyScalar(2 + distance * 0.5)
    return new THREE.QuadraticBezierCurve3(start, mid, end)
  }, [start, end])

  const points = useMemo(() => curve.getPoints(30), [curve])

  return (
    <Line points={points} color="#888888" lineWidth={1} transparent opacity={0.4} />
  )
}

// City nodes
function CityNodes() {
  const nodesRef = useRef<THREE.Group>(null!)

  const positions = useMemo(() => {
    const cities = [
      { lat: 40.7128, lon: -74.0060 },
      { lat: 51.5074, lon: -0.1278 },
      { lat: 35.6762, lon: 139.6503 },
      { lat: -33.8688, lon: 151.2093 },
      { lat: 25.2048, lon: 55.2708 },
      { lat: 1.3521, lon: 103.8198 },
      { lat: 37.7749, lon: -122.4194 },
      { lat: 19.0760, lon: 72.8777 }
    ]

    return cities.map(city => {
      const lat = city.lat * Math.PI / 180
      const lon = city.lon * Math.PI / 180
      return new THREE.Vector3(
        2.15 * Math.cos(lat) * Math.cos(lon),
        2.15 * Math.sin(lat),
        2.15 * Math.cos(lat) * Math.sin(lon)
      )
    })
  }, [])

  useFrame(() => {
    if (nodesRef.current) {
      nodesRef.current.rotation.y += 0.001
    }
  })

  return (
    <group ref={nodesRef}>
      {positions.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.03, 16, 16]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
      ))}
    </group>
  )
}

// Main scene
function Scene() {
  return (
    <>
      <ambientLight intensity={0.1} />
      <pointLight position={[10, 10, 10]} intensity={0.5} color="#FFFFFF" />
      <pointLight position={[-10, -10, -10]} intensity={0.3} color="#888888" />
      <InnerSphere />
      <EarthParticles />
      <DataArcs />
      <CityNodes />
      <Atmosphere />
      <OrbitControls enableZoom enablePan={false} minDistance={3} maxDistance={8} dampingFactor={0.05} enableDamping />
    </>
  )
}

// Main Earth component with Suspense
export default function Earth() {
  return (
    <div className="canvas-container">
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }} gl={{ antialias: true, alpha: true }}>
        <Suspense fallback={<Loader />}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  )
}
