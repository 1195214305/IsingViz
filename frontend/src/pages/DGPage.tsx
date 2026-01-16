import { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Play, RotateCcw, Network, Info } from 'lucide-react'
import { DisconnectivityGraph } from '../components/DisconnectivityGraph'
import { createRandomIsing, computeIsingEnergy, enumerateAllStates } from '../utils/ising'
import { findLocalMinima, findSaddlePoints, computeDisconnectivityGraph } from '../utils/disconnectivity'
import type { LocalMinimum, SaddlePoint } from '../utils/disconnectivity'

export function DGPage() {
  const [size, setSize] = useState(3)
  const [coupling, setCoupling] = useState(1.0)
  const [minima, setMinima] = useState<LocalMinimum[]>([])
  const [saddles, setSaddles] = useState<SaddlePoint[]>([])
  const [computing, setComputing] = useState(false)
  const [stats, setStats] = useState<{
    numStates: number
    numMinima: number
    avgBarrier: number
    globalMin: number
  } | null>(null)

  const computeDG = useCallback(async () => {
    setComputing(true)

    // 创建Ising配置
    const config = createRandomIsing(size, coupling)

    // 枚举所有状态
    const allStates = enumerateAllStates(config)

    // 查找局部极小值
    const localMinima = findLocalMinima(allStates)

    // 查找鞍点
    const saddlePoints = findSaddlePoints(localMinima, allStates, size)

    // 防止空数组导致错误
    if (localMinima.length === 0) {
      setMinima([])
      setSaddles([])
      setStats(null)
      setComputing(false)
      return
    }

    // 计算统计信息
    const globalMin = Math.min(...localMinima.map(m => m.energy))
    const barriers = saddlePoints.map(s => s.energy - Math.max(
      localMinima.find(m => m.id === s.from)?.energy || 0,
      localMinima.find(m => m.id === s.to)?.energy || 0
    ))
    const avgBarrier = barriers.length > 0
      ? barriers.reduce((a, b) => a + b, 0) / barriers.length
      : 0

    setMinima(localMinima)
    setSaddles(saddlePoints)
    setStats({
      numStates: allStates.length,
      numMinima: localMinima.length,
      avgBarrier,
      globalMin
    })

    setComputing(false)
  }, [size, coupling])

  useEffect(() => {
    computeDG()
  }, [])

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">断连图 (Disconnectivity Graph)</h1>
        <p className="text-gray-400">
          可视化能量景观的分层漏斗结构，展示局部极小值和能量势垒
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* 控制面板 */}
        <div className="space-y-6">
          <div className="bg-dark-card border border-gray-800 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Network className="w-5 h-5 text-emerald-400" />
              参数设置
            </h3>

            <div className="space-y-4">
              <div>
                <label className="flex justify-between text-sm text-gray-400 mb-1">
                  <span>系统大小</span>
                  <span className="text-neon-cyan">{size}×{size} = {size * size} 自旋</span>
                </label>
                <input
                  type="range"
                  min="2"
                  max="4"
                  value={size}
                  onChange={(e) => setSize(parseInt(e.target.value))}
                  className="w-full accent-neon-cyan"
                />
                <p className="text-xs text-gray-600 mt-1">
                  状态空间: 2<sup>{size * size}</sup> = {Math.pow(2, size * size)} 个状态
                </p>
              </div>

              <div>
                <label className="flex justify-between text-sm text-gray-400 mb-1">
                  <span>耦合强度 J</span>
                  <span className="text-neon-orange">{coupling.toFixed(1)}</span>
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={coupling}
                  onChange={(e) => setCoupling(parseFloat(e.target.value))}
                  className="w-full accent-neon-orange"
                />
              </div>
            </div>

            <button
              onClick={computeDG}
              disabled={computing}
              className="w-full mt-6 py-2 bg-emerald-500 text-white rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {computing ? (
                <>计算中...</>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  计算断连图
                </>
              )}
            </button>
          </div>

          {/* 统计信息 */}
          {stats && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-dark-card border border-gray-800 rounded-xl p-5"
            >
              <h3 className="text-lg font-semibold text-white mb-4">景观统计</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">状态总数</span>
                  <span className="text-white font-mono">{stats.numStates}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">局部极小值</span>
                  <span className="text-neon-cyan font-mono">{stats.numMinima}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">全局最小能量</span>
                  <span className="text-emerald-400 font-mono">{stats.globalMin.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">平均势垒高度</span>
                  <span className="text-neon-orange font-mono">{stats.avgBarrier.toFixed(4)}</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* 概念说明 */}
          <div className="bg-dark-card border border-gray-800 rounded-xl p-5">
            <h4 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
              <Info className="w-4 h-4" />
              什么是断连图？
            </h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              断连图是一种可视化能量景观的树状图。每个叶子节点代表一个局部极小值，
              它们通过鞍点连接在一起。鞍点的能量越高，表示两个盆地之间的势垒越大，
              系统从一个状态跃迁到另一个状态越困难。
            </p>
          </div>
        </div>

        {/* 断连图可视化 */}
        <div className="lg:col-span-3 space-y-6">
          {minima.length > 0 && (
            <DisconnectivityGraph
              minima={minima}
              saddles={saddles}
              width={800}
              height={500}
            />
          )}

          {/* 极小值列表 */}
          <div className="bg-dark-card border border-gray-800 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-white mb-4">局部极小值详情</h3>
            <div className="overflow-auto max-h-64">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-800">
                    <th className="pb-2 pr-4">ID</th>
                    <th className="pb-2 pr-4">能量</th>
                    <th className="pb-2 pr-4">盆地大小</th>
                    <th className="pb-2">自旋构型</th>
                  </tr>
                </thead>
                <tbody>
                  {minima.slice(0, 20).map(m => (
                    <tr key={m.id} className="border-b border-gray-800/50">
                      <td className="py-2 pr-4 text-neon-cyan">M{m.id}</td>
                      <td className="py-2 pr-4 font-mono text-white">{m.energy.toFixed(4)}</td>
                      <td className="py-2 pr-4 text-gray-400">{m.basinSize}</td>
                      <td className="py-2 font-mono text-xs text-gray-500">
                        [{m.state.slice(0, 8).map(s => s > 0 ? '+' : '-').join('')}
                        {m.state.length > 8 ? '...' : ''}]
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 理论说明 */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-dark-card border border-gray-800 rounded-xl p-5">
              <h4 className="text-neon-cyan font-semibold mb-3">漏斗状景观</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                好的优化问题通常具有漏斗状（funnel-like）能量景观，
                即存在一个主导的低能量盆地，系统容易收敛到全局最优解。
                断连图中这种结构表现为一个深而宽的主漏斗。
              </p>
            </div>
            <div className="bg-dark-card border border-gray-800 rounded-xl p-5">
              <h4 className="text-neon-orange font-semibold mb-3">玻璃态景观</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                难的优化问题通常具有玻璃态（glassy）能量景观，
                存在大量相互竞争的局部极小值，被高势垒分隔。
                这使得优化算法容易陷入局部最优，难以找到全局最优解。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
