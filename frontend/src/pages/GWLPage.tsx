import { useState, useCallback, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, RotateCcw, Sparkles, BarChart } from 'lucide-react'
import * as d3 from 'd3'
import { createRandomIsing, computeIsingEnergy } from '../utils/ising'

interface GWLState {
  histogram: number[]
  weights: number[]
  energyBins: number[]
  currentEnergy: number
  iteration: number
  flatnessRatio: number
}

export function GWLPage() {
  const [size, setSize] = useState(4)
  const [numBins, setNumBins] = useState(50)
  const [flatnessCriterion, setFlatnessCriterion] = useState(0.8)
  const [running, setRunning] = useState(false)
  const [gwlState, setGwlState] = useState<GWLState | null>(null)

  const svgRef = useRef<SVGSVGElement>(null)
  const animationRef = useRef<number | null>(null)

  // 初始化GWL状态
  const initGWL = useCallback(() => {
    const config = createRandomIsing(size, 1.0)
    const n = size * size

    // 估计能量范围
    const minE = -2 * n
    const maxE = 2 * n

    const binWidth = (maxE - minE) / numBins
    const energyBins = Array.from({ length: numBins + 1 }, (_, i) => minE + i * binWidth)

    setGwlState({
      histogram: new Array(numBins).fill(0),
      weights: new Array(numBins).fill(0), // log(g(E))
      energyBins,
      currentEnergy: computeIsingEnergy(config),
      iteration: 0,
      flatnessRatio: 0
    })
  }, [size, numBins])

  useEffect(() => {
    initGWL()
  }, [])

  // GWL步骤
  const gwlStep = useCallback(() => {
    if (!gwlState) return

    setGwlState(prev => {
      if (!prev) return prev

      const newHist = [...prev.histogram]
      const newWeights = [...prev.weights]

      // 找到当前能量对应的bin
      const binIdx = Math.min(
        Math.max(0, Math.floor((prev.currentEnergy - prev.energyBins[0]) /
          (prev.energyBins[1] - prev.energyBins[0]))),
        numBins - 1
      )

      // 更新直方图和权重
      newHist[binIdx]++
      newWeights[binIdx] += Math.log(1.5) // 修改因子

      // 模拟能量变化（简化）
      const deltaE = (Math.random() - 0.5) * 4
      const newEnergy = prev.currentEnergy + deltaE

      // Wang-Landau 接受准则
      const newBinIdx = Math.min(
        Math.max(0, Math.floor((newEnergy - prev.energyBins[0]) /
          (prev.energyBins[1] - prev.energyBins[0]))),
        numBins - 1
      )

      const acceptProb = Math.exp(newWeights[binIdx] - newWeights[newBinIdx])
      const accepted = Math.random() < acceptProb

      // 计算直方图平坦度
      const nonZeroHist = newHist.filter(h => h > 0)
      const avgHist = nonZeroHist.reduce((a, b) => a + b, 0) / nonZeroHist.length
      const minHist = Math.min(...nonZeroHist)
      const flatness = avgHist > 0 ? minHist / avgHist : 0

      return {
        histogram: newHist,
        weights: newWeights,
        energyBins: prev.energyBins,
        currentEnergy: accepted ? newEnergy : prev.currentEnergy,
        iteration: prev.iteration + 1,
        flatnessRatio: flatness
      }
    })
  }, [gwlState, numBins])

  // 运行动画
  useEffect(() => {
    if (running) {
      const step = () => {
        for (let i = 0; i < 10; i++) gwlStep()
        animationRef.current = requestAnimationFrame(step)
      }
      animationRef.current = requestAnimationFrame(step)
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [running, gwlStep])

  // D3可视化
  useEffect(() => {
    if (!svgRef.current || !gwlState) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const width = 700
    const height = 400
    const margin = { top: 40, right: 60, bottom: 60, left: 70 }
    const w = width - margin.left - margin.right
    const h = height - margin.top - margin.bottom

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    // X轴：能量
    const xScale = d3.scaleLinear()
      .domain([gwlState.energyBins[0], gwlState.energyBins[gwlState.energyBins.length - 1]])
      .range([0, w])

    // Y轴：log(g(E)) 或 直方图
    const maxWeight = Math.max(...gwlState.weights, 1)
    const yScale = d3.scaleLinear()
      .domain([0, maxWeight * 1.1])
      .range([h, 0])

    const maxHist = Math.max(...gwlState.histogram, 1)
    const yHistScale = d3.scaleLinear()
      .domain([0, maxHist * 1.1])
      .range([h, 0])

    // 坐标轴
    g.append('g')
      .attr('transform', `translate(0,${h})`)
      .call(d3.axisBottom(xScale).ticks(10))
      .selectAll('text').style('fill', '#888')

    g.append('g')
      .call(d3.axisLeft(yScale).ticks(8))
      .selectAll('text').style('fill', '#00e5cc')

    g.append('g')
      .attr('transform', `translate(${w},0)`)
      .call(d3.axisRight(yHistScale).ticks(8))
      .selectAll('text').style('fill', '#ff6b35')

    // 轴标签
    g.append('text')
      .attr('x', w / 2)
      .attr('y', h + 45)
      .attr('fill', '#888')
      .attr('text-anchor', 'middle')
      .text('能量 E')

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -50)
      .attr('x', -h / 2)
      .attr('fill', '#00e5cc')
      .attr('text-anchor', 'middle')
      .text('ln g(E)')

    // 绘制权重曲线 (DOS)
    const binWidth = w / numBins
    gwlState.weights.forEach((weight, i) => {
      if (weight > 0) {
        g.append('rect')
          .attr('x', i * binWidth)
          .attr('y', yScale(weight))
          .attr('width', binWidth - 1)
          .attr('height', h - yScale(weight))
          .attr('fill', '#00e5cc')
          .attr('opacity', 0.6)
      }
    })

    // 绘制直方图
    gwlState.histogram.forEach((count, i) => {
      if (count > 0) {
        g.append('rect')
          .attr('x', i * binWidth + binWidth * 0.2)
          .attr('y', yHistScale(count))
          .attr('width', binWidth * 0.6 - 1)
          .attr('height', h - yHistScale(count))
          .attr('fill', '#ff6b35')
          .attr('opacity', 0.4)
      }
    })

    // 当前能量位置
    const currentX = xScale(gwlState.currentEnergy)
    g.append('line')
      .attr('x1', currentX)
      .attr('y1', 0)
      .attr('x2', currentX)
      .attr('y2', h)
      .attr('stroke', '#ff2e88')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,3')

    // 标题
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 25)
      .attr('text-anchor', 'middle')
      .attr('fill', '#fff')
      .style('font-size', '16px')
      .style('font-weight', '600')
      .text('Wang-Landau 采样 - 态密度估计')

  }, [gwlState, numBins])

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">GWL 采样算法</h1>
        <p className="text-gray-400">
          Generalized Wang-Landau 算法：估计态密度 g(E) 并实现平坦直方图采样
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* 控制面板 */}
        <div className="space-y-6">
          <div className="bg-dark-card border border-gray-800 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              GWL 参数
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
                  max="6"
                  value={size}
                  onChange={(e) => setSize(parseInt(e.target.value))}
                  className="w-full accent-neon-cyan"
                  disabled={running}
                />
              </div>

              <div>
                <label className="flex justify-between text-sm text-gray-400 mb-1">
                  <span>能量区间数</span>
                  <span className="text-neon-orange">{numBins}</span>
                </label>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={numBins}
                  onChange={(e) => setNumBins(parseInt(e.target.value))}
                  className="w-full accent-neon-orange"
                  disabled={running}
                />
              </div>

              <div>
                <label className="flex justify-between text-sm text-gray-400 mb-1">
                  <span>平坦度准则</span>
                  <span className="text-purple-400">{(flatnessCriterion * 100).toFixed(0)}%</span>
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="0.95"
                  step="0.05"
                  value={flatnessCriterion}
                  onChange={(e) => setFlatnessCriterion(parseFloat(e.target.value))}
                  className="w-full accent-purple-400"
                  disabled={running}
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setRunning(!running)}
                className={`flex-1 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
                  running
                    ? 'bg-neon-pink text-white'
                    : 'bg-purple-500 text-white'
                }`}
              >
                {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {running ? '暂停' : '运行'}
              </button>
              <button
                onClick={() => {
                  setRunning(false)
                  initGWL()
                }}
                className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 状态统计 */}
          {gwlState && (
            <div className="bg-dark-card border border-gray-800 rounded-xl p-5">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <BarChart className="w-5 h-5 text-neon-cyan" />
                采样状态
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">迭代次数</span>
                  <span className="text-white font-mono">{gwlState.iteration.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">当前能量</span>
                  <span className="text-neon-cyan font-mono">{gwlState.currentEnergy.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">直方图平坦度</span>
                  <span className={`font-mono ${
                    gwlState.flatnessRatio >= flatnessCriterion ? 'text-emerald-400' : 'text-neon-orange'
                  }`}>
                    {(gwlState.flatnessRatio * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2 mt-2">
                  <div
                    className="h-2 rounded-full transition-all bg-gradient-to-r from-neon-cyan to-purple-500"
                    style={{ width: `${Math.min(gwlState.flatnessRatio / flatnessCriterion * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 可视化 */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-dark-card border border-gray-800 rounded-xl p-4 overflow-hidden">
            <svg ref={svgRef} viewBox="0 0 700 400" className="w-full" />
            <div className="mt-4 flex items-center gap-6 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-neon-cyan/60"></div>
                <span>ln g(E) - 态密度</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-neon-orange/40"></div>
                <span>直方图 H(E)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-neon-pink"></div>
                <span>当前能量</span>
              </div>
            </div>
          </div>

          {/* 算法说明 */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-dark-card border border-gray-800 rounded-xl p-5">
              <h4 className="text-purple-400 font-semibold mb-3">Wang-Landau 算法核心</h4>
              <ol className="text-xs text-gray-400 space-y-2 list-decimal list-inside">
                <li>初始化权重 g(E) = 1 对所有能量</li>
                <li>提议移动，接受概率 ∝ g(E)/g(E')</li>
                <li>更新权重 g(E) → f·g(E)，f {'>'} 1</li>
                <li>更新直方图 H(E) += 1</li>
                <li>若 H(E) 足够平坦，减小 f，重置 H</li>
                <li>重复直到 f → 1</li>
              </ol>
            </div>
            <div className="bg-dark-card border border-gray-800 rounded-xl p-5">
              <h4 className="text-neon-cyan font-semibold mb-3">为什么用 GWL？</h4>
              <ul className="text-xs text-gray-400 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">✓</span>
                  克服能量势垒，高效探索状态空间
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">✓</span>
                  直接估计态密度 g(E)，可计算熵
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">✓</span>
                  一次采样可计算任意温度的物理量
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">✓</span>
                  平坦直方图确保所有能量区间被充分采样
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
