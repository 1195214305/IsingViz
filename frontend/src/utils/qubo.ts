// QUBO (Quadratic Unconstrained Binary Optimization)
// f(x) = Σ Qij·xi·xj, xi ∈ {0, 1}

export interface QUBOConfig {
  size: number
  Q: number[][]  // QUBO矩阵
  x: number[]    // 二进制变量
}

// 计算QUBO能量
export function calculateQUBOEnergy(config: QUBOConfig): number {
  const { size, Q, x } = config
  let energy = 0

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      energy += Q[i][j] * x[i] * x[j]
    }
  }

  return energy
}

// 生成随机QUBO实例
export function generateRandomQUBO(size: number): QUBOConfig {
  const Q: number[][] = Array(size).fill(null).map(() => Array(size).fill(0))
  const x: number[] = Array(size).fill(0).map(() => Math.random() > 0.5 ? 1 : 0)

  for (let i = 0; i < size; i++) {
    for (let j = i; j < size; j++) {
      Q[i][j] = (Math.random() - 0.5) * 2
      if (i !== j) Q[j][i] = Q[i][j]
    }
  }

  return { size, Q, x }
}

// Ising到QUBO的转换
export function isingToQUBO(J: number[][], h: number[]): number[][] {
  const n = h.length
  const Q: number[][] = Array(n).fill(null).map(() => Array(n).fill(0))

  for (let i = 0; i < n; i++) {
    Q[i][i] = -2 * h[i]
    for (let j = 0; j < n; j++) {
      if (i !== j) {
        Q[i][i] -= 2 * J[i][j]
      }
    }
  }

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      Q[i][j] = 4 * J[i][j]
      Q[j][i] = Q[i][j]
    }
  }

  return Q
}

// 枚举所有QUBO状态
export function enumerateQUBOStates(config: QUBOConfig): { state: number[], energy: number }[] {
  const { size } = config
  const results: { state: number[], energy: number }[] = []
  const totalStates = Math.pow(2, size)

  for (let i = 0; i < totalStates; i++) {
    const state: number[] = []
    for (let j = 0; j < size; j++) {
      state.push((i >> j) & 1)
    }

    const tempConfig = { ...config, x: state }
    const energy = calculateQUBOEnergy(tempConfig)
    results.push({ state: [...state], energy })
  }

  return results.sort((a, b) => a.energy - b.energy)
}

// 别名函数
export const createRandomQUBO = (size: number, _density?: number): QUBOConfig => {
  return generateRandomQUBO(size)
}

export const computeQUBOEnergy = calculateQUBOEnergy
export const enumerateAllQUBOStates = enumerateQUBOStates

// QUBO到Ising转换
export function quboToIsing(qubo: QUBOConfig): { size: number; J: number[][]; h: number[] } {
  const { size, Q } = qubo
  const J: number[][] = Array(size).fill(null).map(() => Array(size).fill(0))
  const h: number[] = Array(size).fill(0)

  for (let i = 0; i < size; i++) {
    h[i] = Q[i][i] / 2
    for (let j = i + 1; j < size; j++) {
      J[i][j] = Q[i][j] / 4
      J[j][i] = J[i][j]
    }
  }

  return { size, J, h }
}

// 模拟退火求解QUBO
export interface SAQUBOResult {
  bestState: number[]
  bestEnergy: number
  history: { step: number; energy: number; temp: number }[]
}

export function simulatedAnnealingQUBO(
  qubo: QUBOConfig,
  options: { initTemp: number; finalTemp: number; steps: number; coolingRate: number }
): SAQUBOResult {
  const { size } = qubo
  let x = Array(size).fill(0).map(() => Math.random() > 0.5 ? 1 : 0)
  let energy = calculateQUBOEnergy({ ...qubo, x })
  let bestEnergy = energy
  let bestState = [...x]
  let temp = options.initTemp

  const history: { step: number; energy: number; temp: number }[] = []

  for (let step = 0; step < options.steps; step++) {
    // 随机翻转一个bit
    const idx = Math.floor(Math.random() * size)
    const newX = [...x]
    newX[idx] = 1 - newX[idx]

    const newEnergy = calculateQUBOEnergy({ ...qubo, x: newX })
    const dE = newEnergy - energy

    if (dE <= 0 || Math.random() < Math.exp(-dE / temp)) {
      x = newX
      energy = newEnergy

      if (energy < bestEnergy) {
        bestEnergy = energy
        bestState = [...x]
      }
    }

    temp *= options.coolingRate

    if (step % 10 === 0) {
      history.push({ step, energy, temp })
    }
  }

  return { bestState, bestEnergy, history }
}
