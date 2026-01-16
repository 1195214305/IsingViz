import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Play, RotateCcw, Thermometer, TrendingDown } from 'lucide-react'
import { AnnealingVisualizer } from '../components/AnnealingVisualizer'
import { createRandomIsing, computeIsingEnergy } from '../utils/ising'
import { simulatedAnnealing, type SAResult } from '../utils/annealing'

export function AnnealingPage() {
  const [size, setSize] = useState(5)
  const [initTemp, setInitTemp] = useState(10)
  const [finalTemp, setFinalTemp] = useState(0.01)
  const [steps, setSteps] = useState(2000)
  const [coolingType, setCoolingType] = useState<'exponential' | 'linear' | 'logarithmic'>('exponential')
  const [result, setResult] = useState<SAResult | null>(null)
  const [running, setRunning] = useState(false)

  const runAnnealing = useCallback(async () => {
    setRunning(true)

    const config = createRandomIsing(size, 1.0)
    const energyFn = (state: number[]) => {
      const cfg = { ...config, spins: state }
      return computeIsingEnergy(cfg)
    }

    // 计算冷却率
    const coolingRate = coolingType === 'exponential'
      ? Math.pow(finalTemp / initTemp, 1 / steps)
      : 0.999

    const saResult = simulatedAnnealing(
      energyFn,
      size * size,
      {
        initTemp,
        finalTemp,
        steps,
        coolingRate
      }
    )

    setResult(saResult)
    setRunning(false)
  }, [size, initTemp, finalTemp, steps, coolingType])

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">模拟退火算法</h1>
        <p className="text-gray-400">
          通过模拟金属退火过程求解组合优化问题
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* 控制面板 */}
        <div className="space-y-6">
          <div className="bg-dark-card border border-gray-800 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-neon-orange" />
              退火参数
            </h3>

            <div className="space-y-4">
              <div>
                <label className="flex justify-between text-sm text-gray-400 mb-1">
                  <span>系统大小</span>
                  <span className="text-neon-cyan">{size}×{size}</span>
                </label>
                <input
                  type="range"
                  min="3"
                  max="10"
                  value={size}
                  onChange={(e) => setSize(parseInt(e.target.value))}
                  className="w-full accent-neon-cyan"
                />
              </div>

              <div>
                <label className="flex justify-between text-sm text-gray-400 mb-1">
                  <span>初始温度 T<sub>0</sub></span>
                  <span className="text-neon-orange">{initTemp}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={initTemp}
                  onChange={(e) => setInitTemp(parseInt(e.target.value))}
                  className="w-full accent-neon-orange"
                />
              </div>

              <div>
                <label className="flex justify-between text-sm text-gray-400 mb-1">
                  <span>终止温度 T<sub>f</sub></span>
                  <span className="text-neon-pink">{finalTemp}</span>
                </label>
                <input
                  type="range"
                  min="0.001"
                  max="1"
                  step="0.001"
                  value={finalTemp}
                  onChange={(e) => setFinalTemp(parseFloat(e.target.value))}
                  className="w-full accent-neon-pink"
                />
              </div>

              <div>
                <label className="flex justify-between text-sm text-gray-400 mb-1">
                  <span>迭代步数</span>
                  <span className="text-emerald-400">{steps}</span>
                </label>
                <input
                  type="range"
                  min="500"
                  max="10000"
                  step="100"
                  value={steps}
                  onChange={(e) => setSteps(parseInt(e.target.value))}
                  className="w-full accent-emerald-400"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">冷却调度</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['exponential', 'linear', 'logarithmic'] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => setCoolingType(type)}
                      className={`py-2 px-2 rounded text-xs font-medium transition-colors ${
                        coolingType === type
                          ? 'bg-neon-cyan text-dark-bg'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      {type === 'exponential' ? '指数' : type === 'linear' ? '线性' : '对数'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={runAnnealing}
              disabled={running}
              className="w-full mt-6 py-3 bg-neon-orange text-dark-bg rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {running ? (
                <>运行中...</>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  开始退火
                </>
              )}
            </button>
          </div>

          {/* 结果统计 */}
          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-dark-card border border-neon-cyan/30 rounded-xl p-5"
            >
              <h3 className="text-lg font-semibold text-neon-cyan mb-4 flex items-center gap-2">
                <TrendingDown className="w-5 h-5" />
                求解结果
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">最优能量</span>
                  <span className="text-2xl font-mono text-neon-cyan">{result.bestEnergy.toFixed(4)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">初始能量</span>
                  <span className="text-lg font-mono text-gray-300">
                    {result.history[0]?.energy.toFixed(4) || '-'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">能量降低</span>
                  <span className="text-lg font-mono text-emerald-400">
                    {((result.history[0]?.energy || 0) - result.bestEnergy).toFixed(4)}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* 可视化 */}
        <div className="lg:col-span-3 space-y-6">
          {result && (
            <AnnealingVisualizer
              history={result.history}
              bestEnergy={result.bestEnergy}
            />
          )}

          {/* 算法说明 */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-dark-card border border-gray-800 rounded-xl p-5">
              <h4 className="text-neon-cyan font-semibold mb-3">指数冷却</h4>
              <p className="text-xs text-gray-400 font-mono mb-2">T(t) = T₀ · α<sup>t</sup></p>
              <p className="text-xs text-gray-500">
                最常用的冷却调度，温度按指数衰减。α 通常取 0.9~0.99。
              </p>
            </div>
            <div className="bg-dark-card border border-gray-800 rounded-xl p-5">
              <h4 className="text-neon-orange font-semibold mb-3">线性冷却</h4>
              <p className="text-xs text-gray-400 font-mono mb-2">T(t) = T₀ - t·(T₀-T_f)/N</p>
              <p className="text-xs text-gray-500">
                温度线性下降，简单但可能收敛较慢。
              </p>
            </div>
            <div className="bg-dark-card border border-gray-800 rounded-xl p-5">
              <h4 className="text-neon-pink font-semibold mb-3">对数冷却</h4>
              <p className="text-xs text-gray-400 font-mono mb-2">T(t) = T₀ / ln(1+t)</p>
              <p className="text-xs text-gray-500">
                理论上保证收敛到全局最优，但实际中速度太慢。
              </p>
            </div>
          </div>

          {/* Metropolis准则 */}
          <div className="bg-dark-card border border-gray-800 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-white mb-4">Metropolis-Hastings 接受准则</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-400 mb-3">
                  在每一步，我们尝试一个随机移动（翻转一个自旋），根据能量变化决定是否接受：
                </p>
                <ul className="text-xs text-gray-500 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400">•</span>
                    如果 ΔE ≤ 0（能量降低），总是接受
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400">•</span>
                    如果 ΔE {'>'} 0（能量升高），以概率 exp(-ΔE/T) 接受
                  </li>
                </ul>
              </div>
              <div className="bg-dark-bg rounded-lg p-4">
                <p className="text-xs text-gray-400 mb-2">接受概率公式：</p>
                <p className="text-neon-cyan font-mono text-lg">
                  P<sub>accept</sub> = min(1, e<sup>-ΔE/T</sup>)
                </p>
                <p className="text-xs text-gray-500 mt-3">
                  高温时容易接受坏移动（探索），低温时倾向于只接受好移动（开发）
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
