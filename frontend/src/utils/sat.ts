// k-SAT问题生成器和求解器
// CNF公式: C = c1 ∧ c2 ∧ ... ∧ cm

export interface Clause {
  literals: number[]  // 正数表示变量，负数表示取反
}

export interface SATInstance {
  numVars: number
  clauses: Clause[]
}

// 生成随机k-SAT实例
export function generateRandomSAT(
  numVars: number,
  numClauses: number,
  k: number = 3
): SATInstance {
  const clauses: Clause[] = []

  for (let c = 0; c < numClauses; c++) {
    const literals: number[] = []
    const usedVars = new Set<number>()

    while (literals.length < k) {
      const varIdx = Math.floor(Math.random() * numVars) + 1
      if (!usedVars.has(varIdx)) {
        usedVars.add(varIdx)
        const sign = Math.random() > 0.5 ? 1 : -1
        literals.push(sign * varIdx)
      }
    }
    clauses.push({ literals })
  }

  return { numVars, clauses }
}

// 评估赋值是否满足子句
export function evaluateClause(clause: Clause, assignment: boolean[]): boolean {
  return clause.literals.some(lit => {
    const varIdx = Math.abs(lit) - 1
    const value = assignment[varIdx]
    return lit > 0 ? value : !value
  })
}

// 计算满足的子句数
export function countSatisfied(instance: SATInstance, assignment: boolean[]): number {
  return instance.clauses.filter(c => evaluateClause(c, assignment)).length
}

// 将SAT转换为PUBO能量函数
export function satToPUBO(instance: SATInstance): {
  terms: { vars: number[], coeff: number }[]
} {
  const terms: { vars: number[], coeff: number }[] = []

  for (const clause of instance.clauses) {
    // 每个子句贡献一个惩罚项
    const k = clause.literals.length
    const coeffs = generatePUBOCoeffs(clause.literals)
    terms.push(...coeffs)
  }

  return { terms }
}

function generatePUBOCoeffs(literals: number[]): { vars: number[], coeff: number }[] {
  const result: { vars: number[], coeff: number }[] = []
  const k = literals.length

  // 对于3-SAT: (1-l1)(1-l2)(1-l3) 展开
  // 其中 li = xi 或 li = 1-xi
  for (let mask = 0; mask < (1 << k); mask++) {
    const vars: number[] = []
    let coeff = 1

    for (let i = 0; i < k; i++) {
      if ((mask >> i) & 1) {
        vars.push(Math.abs(literals[i]))
        coeff *= literals[i] > 0 ? -1 : 1
      } else {
        coeff *= literals[i] > 0 ? 1 : -1
      }
    }

    if (coeff !== 0) {
      result.push({ vars: vars.sort((a, b) => a - b), coeff })
    }
  }

  return result
}

// 评估SAT实例
export function evaluateSAT(instance: SATInstance, assignment: number[]): { satisfied: boolean; clauseResults: boolean[] } {
  const boolAssign = assignment.map(v => v === 1)
  const clauseResults = instance.clauses.map(c => evaluateClause(c, boolAssign))
  const satisfied = clauseResults.every(r => r)
  return { satisfied, clauseResults }
}

// 贪心求解SAT
export function solveSATGreedy(instance: SATInstance): { assignment: number[]; satisfied: number } {
  const { numVars } = instance
  let bestAssignment = Array(numVars).fill(0)
  let bestCount = 0

  // 多次随机尝试
  for (let trial = 0; trial < 100; trial++) {
    const assignment = Array(numVars).fill(0).map(() => Math.random() > 0.5 ? 1 : 0)
    const boolAssign = assignment.map(v => v === 1)
    const count = countSatisfied(instance, boolAssign)

    if (count > bestCount) {
      bestCount = count
      bestAssignment = assignment
    }

    if (bestCount === instance.clauses.length) break
  }

  return { assignment: bestAssignment, satisfied: bestCount }
}

// 格式化CNF公式
export function formatCNF(instance: SATInstance): string {
  const lines: string[] = []
  lines.push(`c ${instance.numVars} 个变量, ${instance.clauses.length} 个子句`)
  lines.push(`p cnf ${instance.numVars} ${instance.clauses.length}`)

  for (const clause of instance.clauses) {
    const lits = clause.literals.map(l => {
      const v = Math.abs(l)
      return l > 0 ? `x${v}` : `¬x${v}`
    }).join(' ∨ ')
    lines.push(`(${lits})`)
  }

  return lines.join('\n')
}

// SAT转QUBO（简化版）
export function satToQubo(instance: SATInstance): { size: number; Q: number[][] } {
  const { numVars, clauses } = instance
  const Q: number[][] = Array(numVars).fill(null).map(() => Array(numVars).fill(0))

  for (const clause of clauses) {
    for (const lit of clause.literals) {
      const i = Math.abs(lit) - 1
      Q[i][i] += lit > 0 ? -1 : 1
    }
  }

  return { size: numVars, Q }
}
