import { motion } from 'framer-motion'
import { Atom, Binary, Cpu, Network, BarChart3, Sparkles, ArrowRight } from 'lucide-react'

interface HomePageProps {
  onNavigate: (page: string) => void
}

const features = [
  {
    icon: Atom,
    title: 'Ising模型',
    desc: '经典自旋玻璃系统，H = -Σ Jij·si·sj',
    page: 'ising',
    color: 'text-neon-cyan'
  },
  {
    icon: Binary,
    title: 'QUBO/PUBO',
    desc: '二次/多次无约束二元优化',
    page: 'qubo',
    color: 'text-neon-orange'
  },
  {
    icon: Cpu,
    title: 'k-SAT生成',
    desc: '可满足性问题实例生成器',
    page: 'sat',
    color: 'text-neon-pink'
  },
  {
    icon: Network,
    title: '断连图',
    desc: '能量景观的树状分层结构',
    page: 'dg',
    color: 'text-emerald-400'
  },
  {
    icon: BarChart3,
    title: '模拟退火',
    desc: '温度调度与能量演化对比',
    page: 'annealing',
    color: 'text-amber-400'
  },
  {
    icon: Sparkles,
    title: 'GWL采样',
    desc: 'Generalized Wang-Landau算法',
    page: 'gwl',
    color: 'text-purple-400'
  }
]

export function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        {/* 背景网格动画 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 opacity-20">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-px bg-gradient-to-b from-transparent via-neon-cyan to-transparent"
                style={{
                  left: `${(i + 1) * 5}%`,
                  height: '100%',
                }}
                animate={{
                  opacity: [0.2, 0.5, 0.2],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
              />
            ))}
          </div>
          {/* 浮动原子 */}
          <motion.div
            className="absolute top-20 right-[15%] text-neon-cyan/30"
            animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
            transition={{ duration: 6, repeat: Infinity }}
          >
            <Atom size={80} />
          </motion.div>
          <motion.div
            className="absolute bottom-40 left-[10%] text-neon-orange/30"
            animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
            transition={{ duration: 8, repeat: Infinity }}
          >
            <Network size={60} />
          </motion.div>
        </div>

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="text-white">Ising</span>
              <span className="text-neon-cyan">Viz</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 mb-4">
              量子能量景观可视化平台
            </p>
            <p className="text-base text-gray-500 max-w-2xl mx-auto mb-8">
              基于论文《组合优化问题在Ising机器中的能量景观》，
              <br />
              实现完整的Ising/QUBO模型、断连图分析、GWL采样算法可视化
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              <motion.button
                onClick={() => onNavigate('ising')}
                className="px-8 py-4 bg-neon-cyan text-dark-bg font-semibold rounded-xl flex items-center gap-2 hover:bg-neon-cyan/90 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                开始探索 <ArrowRight className="w-5 h-5" />
              </motion.button>
              <motion.button
                onClick={() => onNavigate('dg')}
                className="px-8 py-4 border border-neon-orange text-neon-orange font-semibold rounded-xl hover:bg-neon-orange/10 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                断连图可视化
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 功能卡片 */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            className="text-3xl font-bold text-center text-white mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            核心功能模块
          </motion.h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, idx) => (
              <motion.div
                key={f.page}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => onNavigate(f.page)}
                className="group bg-dark-card border border-gray-800 rounded-2xl p-6 cursor-pointer hover:border-gray-600 transition-all hover:shadow-lg hover:shadow-neon-cyan/5"
              >
                <div className={`w-12 h-12 rounded-xl bg-dark-bg flex items-center justify-center mb-4 ${f.color} group-hover:scale-110 transition-transform`}>
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm">{f.desc}</p>
                <div className="mt-4 flex items-center gap-1 text-sm text-gray-600 group-hover:text-neon-cyan transition-colors">
                  进入模块 <ArrowRight className="w-4 h-4" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 论文概要 */}
      <section className="py-16 px-4 bg-dark-card/50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-2xl font-bold text-white mb-6">理论基础</h2>

            {/* 论文引用卡片 */}
            <div className="mb-8 p-5 bg-dark-bg rounded-xl border border-neon-cyan/30 text-left">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-neon-cyan/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-neon-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-neon-cyan font-semibold mb-1">参考论文</h4>
                  <p className="text-white text-sm font-medium mb-1">
                    Energy landscapes of combinatorial optimization in Ising machines
                  </p>
                  <p className="text-gray-400 text-xs mb-2">
                    组合优化问题在Ising机器中的能量景观
                  </p>
                  <p className="text-gray-500 text-xs">
                    本平台基于该论文实现了Ising模型、QUBO问题、断连图分析、GWL采样等核心算法的可视化
                  </p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="p-4 bg-dark-bg rounded-xl border border-gray-800">
                <h4 className="text-neon-cyan font-semibold mb-2">Ising哈密顿量</h4>
                <p className="text-gray-400 text-sm font-mono">
                  H = -Σ<sub>ij</sub> J<sub>ij</sub>s<sub>i</sub>s<sub>j</sub> - Σ<sub>i</sub> h<sub>i</sub>s<sub>i</sub>
                </p>
                <p className="text-gray-500 text-xs mt-2">s ∈ {'{-1, +1}'}，描述自旋相互作用</p>
              </div>
              <div className="p-4 bg-dark-bg rounded-xl border border-gray-800">
                <h4 className="text-neon-orange font-semibold mb-2">QUBO模型</h4>
                <p className="text-gray-400 text-sm font-mono">
                  f(x) = Σ<sub>ij</sub> Q<sub>ij</sub>x<sub>i</sub>x<sub>j</sub>
                </p>
                <p className="text-gray-500 text-xs mt-2">x ∈ {'{0, 1}'}，等价于Ising模型</p>
              </div>
              <div className="p-4 bg-dark-bg rounded-xl border border-gray-800">
                <h4 className="text-neon-pink font-semibold mb-2">断连图</h4>
                <p className="text-gray-400 text-sm">
                  通过能量势垒连接局部极小值
                </p>
                <p className="text-gray-500 text-xs mt-2">可视化漏斗状能量景观结构</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-800">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-500 text-sm mb-4">
            本项目由
            <a href="https://www.aliyun.com/product/esa" target="_blank" rel="noopener noreferrer" className="text-neon-cyan hover:underline mx-1">
              阿里云ESA
            </a>
            提供加速、计算和保护
          </p>
          <img
            src="https://img.alicdn.com/imgextra/i3/O1CN01H1UU3i1Cti9lYtFrs_!!6000000000139-2-tps-7534-844.png"
            alt="阿里云ESA"
            className="h-8 mx-auto opacity-60 hover:opacity-100 transition-opacity"
          />
        </div>
      </footer>
    </div>
  )
}
