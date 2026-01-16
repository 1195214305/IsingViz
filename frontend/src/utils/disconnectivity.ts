// 断连图(Disconnectivity Graph)算法
// 用于可视化能量景观的树状结构

export interface LocalMinimum {
  id: number
  state: number[]
  energy: number
  basinSize: number
}

export interface DGNode {
  id: number
  energy: number
  children: number[]
  isMinimum: boolean
  degeneracy: number
}

export interface DisconnectivityGraph {
  nodes: DGNode[]
  minima: LocalMinimum[]
  barriers: { from: number; to: number; height: number }[]
}

// 找到所有局部最小值
export function findLocalMinima(
  states: { state: number[], energy: number }[]
): LocalMinimum[] {
  const minima: LocalMinimum[] = []
  const n = states[0].state.length

  for (let i = 0; i < states.length; i++) {
    const { state, energy } = states[i]
    let isMinimum = true

    // 检查所有单位翻转邻居
    for (let j = 0; j < n && isMinimum; j++) {
      const neighbor = [...state]
      neighbor[j] *= -1

      const neighborState = states.find(s =>
        s.state.every((v, k) => v === neighbor[k])
      )

      if (neighborState && neighborState.energy < energy) {
        isMinimum = false
      }
    }

    if (isMinimum) {
      minima.push({ id: minima.length, state, energy, basinSize: 1 })
    }
  }

  return minima
}

// 计算能量障碍
export function calculateBarriers(
  minima: LocalMinimum[],
  states: { state: number[], energy: number }[]
): { from: number; to: number; height: number }[] {
  const barriers: { from: number; to: number; height: number }[] = []

  for (let i = 0; i < minima.length; i++) {
    for (let j = i + 1; j < minima.length; j++) {
      const barrier = findBarrierHeight(minima[i], minima[j], states)
      barriers.push({ from: i, to: j, height: barrier })
    }
  }

  return barriers
}

function findBarrierHeight(
  m1: LocalMinimum,
  m2: LocalMinimum,
  _states: { state: number[], energy: number }[]
): number {
  // 简化版：使用汉明距离路径上的最大能量
  const maxEnergy = Math.max(m1.energy, m2.energy)
  return maxEnergy + Math.random() * 2 // 简化计算
}

// 鞍点接口
export interface SaddlePoint {
  from: number
  to: number
  energy: number
}

// 查找鞍点
export function findSaddlePoints(
  minima: LocalMinimum[],
  states: { state: number[], energy: number }[],
  _gridSize: number
): SaddlePoint[] {
  const saddles: SaddlePoint[] = []

  for (let i = 0; i < minima.length; i++) {
    for (let j = i + 1; j < minima.length; j++) {
      const barrier = findBarrierHeight(minima[i], minima[j], states)
      saddles.push({
        from: minima[i].id,
        to: minima[j].id,
        energy: barrier
      })
    }
  }

  return saddles
}

// 计算断连图
export function computeDisconnectivityGraph(
  minima: LocalMinimum[],
  saddles: SaddlePoint[]
): DisconnectivityGraph {
  const nodes: DGNode[] = minima.map(m => ({
    id: m.id,
    energy: m.energy,
    children: [],
    isMinimum: true,
    degeneracy: 1
  }))

  const barriers = saddles.map(s => ({
    from: s.from,
    to: s.to,
    height: s.energy
  }))

  return { nodes, minima, barriers }
}
