import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Play, RotateCcw, Binary, ArrowRightLeft } from 'lucide-react'
import { EnergyLandscape3D } from '../components/EnergyLandscape3D'
import {
  createRandomQUBO, computeQUBOEnergy, quboToIsing,
  simulatedAnnealingQUBO, enumerateAllQUBOStates
} from '../utils/qubo'

export function QUBOPage() {
  const [size, setSize] = useState(6)
  const [density, setDensity] = useState(0.5)
  const [qubo, setQubo] = useState(() => createRandomQUBO(6, 0.5))
  const [solution, setSolution] = useState<number[] | null>(null)
  const [bestEnergy, setBestEnergy] = useState<number | null>(null)
  const [running, setRunning] = useState(false)
  const [allStates, setAllStates] = useState<{ state: number[], energy: number }[]>([])

  const handleGenerate = useCallback(() => {
    const newQubo = createRandomQUBO(size, density)
    setQubo(newQubo)
    setSolution(null)
    setBestEnergy(null)
    setAllStates([])
  }, [size, density])

  const handleSolve = useCallback(async () => {
    setRunning(true)

    // 模拟异步计算
    await new Promise(r => setTimeout(r, 100))

    const result = simulatedAnnealingQUBO(qubo, {
      initTemp: 10,
      finalTemp: 0.01,
      steps: 5000,
      coolingRate: 0.995
    })

    setSolution(result.bestState)
    setBestEnergy(result.bestEnergy)

    // 如果size较小，枚举所有状态
    if (size <= 8) {
      const states = enumerateAllQUBOStates(qubo)
      setAllStates(states)
    } else {
      // 使用采样历史
      setAllStates(result.history.map(h => ({ state: [], energy: h.energy })))
    }

    setRunning(false)
  }, [qubo, size])

  const ising = quboToIsing(qubo)

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">QUBO/PUBO 优化器</h1>
        <p className="text-gray-400">
          二次无约束二元优化: f(x) = Σ Q<sub>ij</sub>·x<sub>i</sub>·x<sub>j</sub>，x ∈ {'{0, 1}'}
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* 控制面板 */}
        <div className="space-y-6">
          <div className="bg-dark-card border border-gray-800 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Binary className="w-5 h-5 text-neon-orange" />
              问题配置
            </h3>

            <div className="space-y-4">
              <div>
                <label className="flex justify-between text-sm text-gray-400 mb-1">
                  <span>变量数量</span>
                  <span className="text-neon-cyan">{size}</span>
                </label>
                <input
                  type="range"
                  min="3"
                  max="12"
                  value={size}
                  onChange={(e) => setSize(parseInt(e.target.value))}
                  className="w-full accent-neon-cyan"
                />
              </div>

              <div>
                <label className="flex justify-between text-sm text-gray-400 mb-1">
                  <span>矩阵密度</span>
                  <span className="text-neon-orange">{(density * 100).toFixed(0)}%</span>
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={density}
                  onChange={(e) => setDensity(parseFloat(e.target.value))}
                  className="w-full accent-neon-orange"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={handleGenerate}
                className="flex-1 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                生成
              </button>
              <button
                onClick={handleSolve}
                disabled={running}
                className="flex-1 py-2 bg-neon-cyan text-dark-bg rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Play className="w-4 h-4" />
                {running ? '求解中...' : '求解'}
              </button>
            </div>
          </div>

          {/* 结果显示 */}
          {bestEnergy !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-dark-card border border-neon-cyan/30 rounded-xl p-5"
            >
              <h3 className="text-lg font-semibold text-neon-cyan mb-4">求解结果</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">最优能量</span>
                  <span className="text-2xl font-mono text-neon-cyan">{bestEnergy.toFixed(4)}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-sm">最优解 x*</span>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {solution?.map((v, i) => (
                      <span
                        key={i}
                        className={`w-8 h-8 rounded flex items-center justify-center text-sm font-mono ${
                          v === 1 ? 'bg-neon-cyan text-dark-bg' : 'bg-gray-800 text-gray-400'
                        }`}
                      >
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* QUBO到Ising转换 */}
          <div className="bg-dark-card border border-gray-800 rounded-xl p-5">
            <h4 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4" />
              QUBO → Ising 转换
            </h4>
            <p className="text-xs text-gray-500 leading-relaxed mb-3">
              s<sub>i</sub> = 2x<sub>i</sub> - 1
              <br />
              将二元变量 x ∈ {'{0,1}'} 映射到自旋 s ∈ {'{-1,+1}'}
            </p>
            <div className="text-xs text-gray-600">
              <div>Ising 耦合矩阵维度: {ising.size}×{ising.size}</div>
              <div>外场项数: {ising.h.filter(v => v !== 0).length}</div>
            </div>
          </div>
        </div>

        {/* 矩阵和可视化 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Q矩阵可视化 */}
          <div className="bg-dark-card border border-gray-800 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-white mb-4">QUBO 矩阵 Q</h3>
            <div className="overflow-auto">
              <div
                className="grid gap-1"
                style={{
                  gridTemplateColumns: `repeat(${Math.min(size, 12)}, minmax(0, 1fr))`,
                  maxWidth: '100%'
                }}
              >
                {qubo.Q.slice(0, 12).map((row, i) =>
                  row.slice(0, 12).map((val, j) => (
                    <div
                      key={`${i}-${j}`}
                      className="aspect-square rounded text-xs flex items-center justify-center font-mono"
                      style={{
                        backgroundColor: val === 0
                          ? '#1a1a24'
                          : val > 0
                            ? `rgba(255, 107, 53, ${Math.min(Math.abs(val) / 5, 1)})`
                            : `rgba(0, 229, 204, ${Math.min(Math.abs(val) / 5, 1)})`,
                        color: Math.abs(val) > 2 ? '#fff' : '#888'
                      }}
                      title={`Q[${i}][${j}] = ${val.toFixed(2)}`}
                    >
                      {size <= 8 ? val.toFixed(1) : ''}
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-neon-cyan/50"></div>
                <span>负值</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-neon-orange/50"></div>
                <span>正值</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-dark-bg"></div>
                <span>零</span>
              </div>
            </div>
          </div>

          {/* 能量景观 */}
          {allStates.length > 0 && (
            <EnergyLandscape3D
              states={allStates}
              title={`QUBO 能量景观 (${allStates.length} 个状态)`}
            />
          )}
        </div>
      </div>
    </div>
  )
}
