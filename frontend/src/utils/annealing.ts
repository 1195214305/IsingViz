// 模拟退火算法实现

export interface SAResult {
  bestState: number[]
  bestEnergy: number
  history: { step: number; energy: number; temp: number }[]
}

export function simulatedAnnealing(
  energyFn: (state: number[]) => number,
  initialState: number[],
  options: {
    maxSteps?: number
    initialTemp?: number
    coolingRate?: number
  } = {}
): SAResult {
  const {
    maxSteps = 1000,
    initialTemp = 10,
    coolingRate = 0.995
  } = options

  let state = [...initialState]
  let energy = energyFn(state)
  let bestState = [...state]
  let bestEnergy = energy
  let temp = initialTemp
  const history: { step: number; energy: number; temp: number }[] = []

  for (let step = 0; step < maxSteps; step++) {
    // 随机翻转一个位
    const flipIdx = Math.floor(Math.random() * state.length)
    const newState = [...state]
    newState[flipIdx] = state[flipIdx] === 1 ? -1 : 1

    const newEnergy = energyFn(newState)
    const delta = newEnergy - energy

    // Metropolis准则
    if (delta < 0 || Math.random() < Math.exp(-delta / temp)) {
      state = newState
      energy = newEnergy

      if (energy < bestEnergy) {
        bestState = [...state]
        bestEnergy = energy
      }
    }

    history.push({ step, energy, temp })
    temp *= coolingRate
  }

  return { bestState, bestEnergy, history }
}
