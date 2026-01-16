// Ising模型核心算法
// H = -Σ Jij·si·sj - Σ hi·si

export interface IsingConfig {
  size: number
  J: number[][]  // 耦合矩阵
  h: number[]    // 外场
  spins: number[] // 自旋状态 {-1, 1}
}

// 计算Ising模型能量
export function calculateIsingEnergy(config: IsingConfig): number {
  const { size, J, h, spins } = config
  let energy = 0

  // 耦合项 -Σ Jij·si·sj
  for (let i = 0; i < size; i++) {
    for (let j = i + 1; j < size; j++) {
      energy -= J[i][j] * spins[i] * spins[j]
    }
  }

  // 外场项 -Σ hi·si
  for (let i = 0; i < size; i++) {
    energy -= h[i] * spins[i]
  }

  return energy
}

// 生成随机Ising配置
export function generateRandomIsing(size: number): IsingConfig {
  const J: number[][] = Array(size).fill(null).map(() => Array(size).fill(0))
  const h: number[] = Array(size).fill(0)
  const spins: number[] = Array(size).fill(0).map(() => Math.random() > 0.5 ? 1 : -1)

  // 随机耦合强度
  for (let i = 0; i < size; i++) {
    for (let j = i + 1; j < size; j++) {
      J[i][j] = (Math.random() - 0.5) * 2
      J[j][i] = J[i][j]
    }
    h[i] = (Math.random() - 0.5) * 0.5
  }

  return { size, J, h, spins }
}

// 翻转单个自旋后的能量变化
export function deltaEnergy(config: IsingConfig, flipIndex: number): number {
  const { size, J, h, spins } = config
  let delta = 0

  for (let j = 0; j < size; j++) {
    if (j !== flipIndex) {
      delta += 2 * J[flipIndex][j] * spins[flipIndex] * spins[j]
    }
  }
  delta += 2 * h[flipIndex] * spins[flipIndex]

  return delta
}

// 枚举所有状态的能量（小规模）
export function enumerateAllStates(config: IsingConfig): { state: number[], energy: number }[] {
  const { size } = config
  const results: { state: number[], energy: number }[] = []
  const totalStates = Math.pow(2, size)

  for (let i = 0; i < totalStates; i++) {
    const state: number[] = []
    for (let j = 0; j < size; j++) {
      state.push((i >> j) & 1 ? 1 : -1)
    }

    const tempConfig = { ...config, spins: state }
    const energy = calculateIsingEnergy(tempConfig)
    results.push({ state: [...state], energy })
  }

  return results.sort((a, b) => a.energy - b.energy)
}

// 别名函数
export const createRandomIsing = (gridSize: number, _coupling?: number): IsingConfig => {
  const n = gridSize * gridSize
  return generateRandomIsing(n)
}

export const computeIsingEnergy = calculateIsingEnergy

// 翻转自旋
export function flipSpin(config: IsingConfig, index: number): IsingConfig {
  const newSpins = [...config.spins]
  newSpins[index] *= -1
  return { ...config, spins: newSpins }
}

// Metropolis步骤
export function metropolisStep(config: IsingConfig, temperature: number): IsingConfig {
  const n = config.size
  const idx = Math.floor(Math.random() * n)
  const dE = deltaEnergy(config, idx)

  if (dE <= 0 || Math.random() < Math.exp(-dE / temperature)) {
    return flipSpin(config, idx)
  }
  return config
}
