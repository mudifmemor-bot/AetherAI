import { ThreeElements } from '@react-three/fiber'

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {
      points: ThreeElements['points']
      mesh: ThreeElements['mesh']
      group: ThreeElements['group']
      ambientLight: ThreeElements['ambientLight']
      pointLight: ThreeElements['pointLight']
      line: ThreeElements['line']
    }
  }
}
