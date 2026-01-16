import { motion } from 'framer-motion'
import { Home, Grid3X3, Network, Zap, Settings, BarChart3 } from 'lucide-react'

interface NavbarProps {
  currentPage: string
  onNavigate: (page: string) => void
}

const navItems = [
  { id: 'home', label: '首页', icon: Home },
  { id: 'ising', label: 'Ising模型', icon: Grid3X3 },
  { id: 'landscape', label: '能量景观', icon: Network },
  { id: 'sat', label: 'k-SAT', icon: Zap },
  { id: 'compare', label: '算法对比', icon: BarChart3 },
  { id: 'settings', label: '设置', icon: Settings },
]

export function Navbar({ currentPage, onNavigate }: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-bg/90 backdrop-blur-md border-b border-dark-border">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <motion.div
            className="flex items-center gap-2 cursor-pointer"
            whileHover={{ scale: 1.02 }}
            onClick={() => onNavigate('home')}
          >
            <div className="w-8 h-8 rounded bg-gradient-to-br from-neon-cyan to-neon-orange flex items-center justify-center">
              <span className="text-dark-bg font-bold text-sm">IV</span>
            </div>
            <span className="text-lg font-semibold text-white">IsingViz</span>
          </motion.div>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = currentPage === item.id
              return (
                <motion.button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`px-3 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors ${
                    isActive
                      ? 'bg-neon-cyan/20 text-neon-cyan'
                      : 'text-gray-400 hover:text-white hover:bg-dark-card'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </motion.button>
              )
            })}
          </div>

          <div className="md:hidden flex items-center">
            <select
              value={currentPage}
              onChange={(e) => onNavigate(e.target.value)}
              className="bg-dark-card text-white px-3 py-2 rounded-lg border border-dark-border"
            >
              {navItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </nav>
  )
}
