import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, RotateCcw, Thermometer, Zap } from 'lucide-react'
import { IsingGrid } from '../components/IsingGrid'
import { EnergyLandscape3D } from '../components/EnergyLandscape3D'
import { createRandomIsing, computeIsingEnergy, metropolisStep, flipSpin, enumerateAllStates } from '../utils/ising'

export function IsingPage() {
  const [size, setSize] = useState(4)
  const [temperature, setTemperature] = useState(1.0)
  const [coupling, setCoupling] = useState(1.0)
  const [config, setConfig] = useState(() => createRandomIsing(4, coupling))
  const [running, setRunning] = useState(false)
  const [energy, setEnergy] = useState(() => computeIsingEnergy(config))
  const [history, setHistory] = useState<{ state: number[], energy: number }[]>([])

  const handleReset = useCallback(() => {
    const newConfig = createRandomIsing(size, coupling)
    setConfig(newConfig)
    setEnergy(computeIsingEnergy(newConfig))
    setHistory([])
    setRunning(false)
  }, [size, coupling])

  const handleSpinClick = useCallback((idx: number) => {
    const newConfig = flipSpin(config, idx)
    const newEnergy = computeIsingEnergy(newConfig)
    setConfig(newConfig)
    setEnergy(newEnergy)
    setHistory(h => [...h, { state: [...newConfig.spins], energy: newEnergy }])
  }, [config])

  const runStep = useCallback(() => {
    const result = metropolisStep(config, temperature)
    setConfig(result)
    const newEnergy = computeIsingEnergy(result)
    setEnergy(newEnergy)
    setHistory(h => [...h.slice(-200), { state: [...result.spins], energy: newEnergy }])
  }, [config, temperature])

  // 自动运行
  useState(() => {
    let interval: ReturnType<typeof setInterval> | null = null
    if (running) {
      interval = setInterval(runStep, 100)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  })

  // 枚举所有状态用于3D可视化
  const allStates = size <= 4 ? enumerateAllStates(config) : history

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">Ising模型模拟器</h1>
        <p className="text-gray-400">
          哈密顿量 H = -Σ J<sub>ij</sub>·s<sub>i</sub>·s<sub>j</sub>，自旋 s ∈ {'{-1, +1}'}
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* 控制面板 */}
        <div className="space-y-6">
          <div className="bg-dark-card border border-gray-800 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-neon-cyan" />
              参数设置
            </h3>

            <div className="space-y-4">
              <div>
                <label className="flex justify-between text-sm text-gray-400 mb-1">
                  <span>系统大小</span>
                  <span className="text-neon-cyan">{size}×{size}</span>
                </label>
                <input
                  type="range"
                  min="2"
                  max="8"
                  value={size}
                  onChange={(e) => {
                    setSize(parseInt(e.target.value))
                    handleReset()
                  }}
                  className="w-full accent-neon-cyan"
                />
              </div>

              <div>
                <label className="flex justify-between text-sm text-gray-400 mb-1">
                  <span>耦合强度 J</span>
                  <span className="text-neon-orange">{coupling.toFixed(1)}</span>
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="3"
                  step="0.1"
                  value={coupling}
                  onChange={(e) => setCoupling(parseFloat(e.target.value))}
                  className="w-full accent-neon-orange"
                />
              </div>

              <div>
                <label className="flex justify-between text-sm text-gray-400 mb-1">
                  <span>温度 T</span>
                  <span className="text-neon-pink">{temperature.toFixed(2)}</span>
                </label>
                <input
                  type="range"
                  min="0.01"
                  max="5"
                  step="0.01"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full accent-neon-pink"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setRunning(!running)}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors ${
                  running
                    ? 'bg-neon-pink text-white'
                    : 'bg-neon-cyan text-dark-bg'
                }`}
              >
                {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {running ? '暂停' : '运行'}
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 能量显示 */}
          <div className="bg-dark-card border border-gray-800 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-neon-orange" />
              系统状态
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">当前能量</span>
                <span className="text-2xl font-mono text-neon-cyan">{energy.toFixed(4)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">自旋数量</span>
                <span className="text-lg font-mono text-gray-300">{size * size}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">采样步数</span>
                <span className="text-lg font-mono text-gray-300">{history.length}</span>
              </div>
            </div>
          </div>

          {/* 公式说明 */}
          <div className="bg-dark-card border border-gray-800 rounded-xl p-5">
            <h4 className="text-sm font-medium text-gray-400 mb-3">Metropolis-Hastings</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              接受概率: P<sub>accept</sub> = min(1, exp(-ΔE/T))
              <br /><br />
              当 ΔE {'<'} 0 时总是接受（能量降低）
              <br />
              当 ΔE {'>'} 0 时以概率 exp(-ΔE/T) 接受
            </p>
          </div>
        </div>

        {/* 自旋网格 */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-dark-card border border-gray-800 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-white mb-4">自旋构型</h3>
            <p className="text-xs text-gray-500 mb-4">点击格点翻转自旋</p>
            <IsingGrid
              spins={config.spins}
              size={size}
              onSpinClick={handleSpinClick}
            />
          </div>

          {/* 3D能量景观 */}
          {allStates.length > 0 && (
            <EnergyLandscape3D
              states={allStates}
              title={size <= 4 ? `完整能量景观 (${allStates.length} 个状态)` : `采样轨迹 (${allStates.length} 步)`}
            />
          )}
        </div>
      </div>
    </div>
  )
}
