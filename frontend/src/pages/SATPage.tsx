import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Play, RotateCcw, FileCode, CheckCircle, XCircle } from 'lucide-react'
import { generateRandomSAT, satToQubo, evaluateSAT, solveSATGreedy, formatCNF } from '../utils/sat'
import type { SATInstance } from '../utils/sat'

export function SATPage() {
  const [numVars, setNumVars] = useState(5)
  const [numClauses, setNumClauses] = useState(10)
  const [k, setK] = useState(3)
  const [instance, setInstance] = useState<SATInstance | null>(null)
  const [solution, setSolution] = useState<number[] | null>(null)
  const [satisfied, setSatisfied] = useState<boolean | null>(null)
  const [clauseResults, setClauseResults] = useState<boolean[]>([])

  const handleGenerate = useCallback(() => {
    const sat = generateRandomSAT(numVars, numClauses, k)
    setInstance(sat)
    setSolution(null)
    setSatisfied(null)
    setClauseResults([])
  }, [numVars, numClauses, k])

  const handleSolve = useCallback(() => {
    if (!instance) return

    const result = solveSATGreedy(instance)
    setSolution(result.assignment)

    const evalResult = evaluateSAT(instance, result.assignment)
    setSatisfied(evalResult.satisfied)
    setClauseResults(evalResult.clauseResults)
  }, [instance])

  const qubo = instance ? satToQubo(instance) : null

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">k-SAT 问题生成器</h1>
        <p className="text-gray-400">
          生成随机 k-SAT 实例并转换为 QUBO 形式
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* 控制面板 */}
        <div className="space-y-6">
          <div className="bg-dark-card border border-gray-800 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FileCode className="w-5 h-5 text-neon-pink" />
              SAT 参数
            </h3>

            <div className="space-y-4">
              <div>
                <label className="flex justify-between text-sm text-gray-400 mb-1">
                  <span>变量数 n</span>
                  <span className="text-neon-cyan">{numVars}</span>
                </label>
                <input
                  type="range"
                  min="3"
                  max="20"
                  value={numVars}
                  onChange={(e) => setNumVars(parseInt(e.target.value))}
                  className="w-full accent-neon-cyan"
                />
              </div>

              <div>
                <label className="flex justify-between text-sm text-gray-400 mb-1">
                  <span>子句数 m</span>
                  <span className="text-neon-orange">{numClauses}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={numClauses}
                  onChange={(e) => setNumClauses(parseInt(e.target.value))}
                  className="w-full accent-neon-orange"
                />
              </div>

              <div>
                <label className="flex justify-between text-sm text-gray-400 mb-1">
                  <span>每子句文字数 k</span>
                  <span className="text-neon-pink">{k}</span>
                </label>
                <input
                  type="range"
                  min="2"
                  max="5"
                  value={k}
                  onChange={(e) => setK(parseInt(e.target.value))}
                  className="w-full accent-neon-pink"
                />
              </div>

              {/* 约束比 */}
              <div className="p-3 bg-dark-bg rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">约束比 α = m/n</span>
                  <span className="text-white font-mono">{(numClauses / numVars).toFixed(2)}</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  3-SAT 相变点: α ≈ 4.27
                </p>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={handleGenerate}
                className="flex-1 py-2 bg-neon-pink text-white rounded-lg font-medium flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                生成
              </button>
              <button
                onClick={handleSolve}
                disabled={!instance}
                className="flex-1 py-2 bg-neon-cyan text-dark-bg rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Play className="w-4 h-4" />
                求解
              </button>
            </div>
          </div>

          {/* 求解结果 */}
          {solution && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`bg-dark-card border rounded-xl p-5 ${
                satisfied ? 'border-emerald-500/30' : 'border-red-500/30'
              }`}
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                {satisfied ? (
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
                {satisfied ? '可满足' : '不可满足'}
              </h3>

              <div className="space-y-3">
                <div>
                  <span className="text-gray-400 text-sm">变量赋值</span>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {solution.map((v, i) => (
                      <span
                        key={i}
                        className={`px-2 py-1 rounded text-xs font-mono ${
                          v === 1 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-800 text-gray-400'
                        }`}
                      >
                        x<sub>{i + 1}</sub>={v}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-gray-400 text-sm">子句满足情况</span>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {clauseResults.map((sat, i) => (
                      <span
                        key={i}
                        className={`w-6 h-6 rounded text-xs flex items-center justify-center ${
                          sat ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {i + 1}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-sm text-gray-500">
                  满足子句: {clauseResults.filter(Boolean).length} / {clauseResults.length}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* CNF 公式和 QUBO */}
        <div className="lg:col-span-2 space-y-6">
          {/* CNF 公式 */}
          {instance && (
            <div className="bg-dark-card border border-gray-800 rounded-xl p-5">
              <h3 className="text-lg font-semibold text-white mb-4">CNF 公式</h3>
              <div className="bg-dark-bg rounded-lg p-4 font-mono text-sm overflow-auto max-h-64">
                <pre className="text-gray-300 whitespace-pre-wrap">
                  {formatCNF(instance)}
                </pre>
              </div>
              <div className="mt-3 text-xs text-gray-500">
                共 {instance.numVars} 个变量，{instance.clauses.length} 个子句
              </div>
            </div>
          )}

          {/* QUBO 转换 */}
          {qubo && (
            <div className="bg-dark-card border border-gray-800 rounded-xl p-5">
              <h3 className="text-lg font-semibold text-white mb-4">QUBO 矩阵</h3>
              <p className="text-xs text-gray-500 mb-4">
                SAT → QUBO 转换: 每个子句转换为惩罚项，目标函数最小化等价于满足所有子句
              </p>
              <div className="overflow-auto">
                <div
                  className="grid gap-1"
                  style={{
                    gridTemplateColumns: `repeat(${Math.min(qubo.size, 15)}, minmax(0, 1fr))`
                  }}
                >
                  {qubo.Q.slice(0, 15).map((row, i) =>
                    row.slice(0, 15).map((val, j) => (
                      <div
                        key={`${i}-${j}`}
                        className="aspect-square rounded text-xs flex items-center justify-center"
                        style={{
                          backgroundColor: val === 0
                            ? '#1a1a24'
                            : val > 0
                              ? `rgba(255, 46, 136, ${Math.min(Math.abs(val) / 3, 1)})`
                              : `rgba(0, 229, 204, ${Math.min(Math.abs(val) / 3, 1)})`
                        }}
                        title={`Q[${i}][${j}] = ${val.toFixed(2)}`}
                      />
                    ))
                  )}
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-500">
                QUBO 矩阵大小: {qubo.size} × {qubo.size}
              </div>
            </div>
          )}

          {/* 相变说明 */}
          <div className="bg-dark-card border border-gray-800 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-white mb-4">k-SAT 相变理论</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-dark-bg rounded-lg">
                <h4 className="text-neon-cyan font-semibold mb-2">约束比 α = m/n</h4>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li>• α 小：问题欠约束，容易满足</li>
                  <li>• α 大：问题过约束，通常无解</li>
                  <li>• α ≈ α<sub>c</sub>：相变点，最难求解</li>
                </ul>
              </div>
              <div className="p-4 bg-dark-bg rounded-lg">
                <h4 className="text-neon-orange font-semibold mb-2">临界值 α<sub>c</sub></h4>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li>• 2-SAT: α<sub>c</sub> = 1 (多项式可解)</li>
                  <li>• 3-SAT: α<sub>c</sub> ≈ 4.27</li>
                  <li>• 4-SAT: α<sub>c</sub> ≈ 9.93</li>
                  <li>• 5-SAT: α<sub>c</sub> ≈ 21.12</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
