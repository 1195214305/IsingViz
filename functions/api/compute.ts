interface Env {}

interface ComputeRequest {
  type: 'ising' | 'qubo' | 'annealing'
  params: Record<string, unknown>
}

export async function onRequest(context: { request: Request; env: Env }): Promise<Response> {
  const { request } = context

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // 使用边缘缓存
  const cache = caches.default
  const url = new URL(request.url)

  if (request.method === 'GET') {
    // 获取计算状态信息
    return new Response(JSON.stringify({
      status: 'ready',
      version: '1.0.0',
      capabilities: ['ising', 'qubo', 'annealing', 'sat'],
      edgeLocation: request.headers.get('cf-ray')?.split('-')[1] || 'unknown'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  try {
    const body = await request.json() as ComputeRequest
    const { type, params } = body

    let result: unknown

    switch (type) {
      case 'ising': {
        // 边缘端Ising能量计算
        const { spins, J, h } = params as { spins: number[], J: number[][], h: number[] }
        const n = spins.length
        let energy = 0

        // 计算耦合能量
        for (let i = 0; i < n; i++) {
          for (let j = i + 1; j < n; j++) {
            if (J[i][j] !== 0) {
              energy -= J[i][j] * spins[i] * spins[j]
            }
          }
        }

        // 计算外场能量
        for (let i = 0; i < n; i++) {
          energy -= h[i] * spins[i]
        }

        result = { energy, computedAt: 'edge' }
        break
      }

      case 'qubo': {
        // 边缘端QUBO能量计算
        const { x, Q } = params as { x: number[], Q: number[][] }
        const n = x.length
        let energy = 0

        for (let i = 0; i < n; i++) {
          for (let j = 0; j < n; j++) {
            energy += Q[i][j] * x[i] * x[j]
          }
        }

        result = { energy, computedAt: 'edge' }
        break
      }

      case 'annealing': {
        // 边缘端快速模拟退火
        const { size, steps: maxSteps, initTemp, finalTemp } = params as {
          size: number
          steps: number
          initTemp: number
          finalTemp: number
        }

        const n = size * size
        let spins = Array.from({ length: n }, () => Math.random() < 0.5 ? -1 : 1)
        let temp = initTemp
        const coolingRate = Math.pow(finalTemp / initTemp, 1 / maxSteps)

        // 简单2D Ising能量函数
        const computeEnergy = (s: number[]) => {
          let e = 0
          for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
              const idx = i * size + j
              // 右邻居
              if (j < size - 1) e -= s[idx] * s[idx + 1]
              // 下邻居
              if (i < size - 1) e -= s[idx] * s[idx + size]
            }
          }
          return e
        }

        let energy = computeEnergy(spins)
        let bestEnergy = energy
        let bestSpins = [...spins]

        for (let step = 0; step < maxSteps; step++) {
          // 随机选择一个自旋翻转
          const idx = Math.floor(Math.random() * n)
          const newSpins = [...spins]
          newSpins[idx] *= -1

          const newEnergy = computeEnergy(newSpins)
          const dE = newEnergy - energy

          // Metropolis准则
          if (dE < 0 || Math.random() < Math.exp(-dE / temp)) {
            spins = newSpins
            energy = newEnergy

            if (energy < bestEnergy) {
              bestEnergy = energy
              bestSpins = [...spins]
            }
          }

          temp *= coolingRate
        }

        result = {
          bestEnergy,
          bestState: bestSpins,
          computedAt: 'edge',
          steps: maxSteps
        }
        break
      }

      default:
        return new Response(JSON.stringify({ error: 'Unknown compute type' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Computation failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}

export default { onRequest }
