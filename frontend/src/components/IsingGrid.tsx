import { useMemo } from 'react'
import { motion } from 'framer-motion'

interface IsingGridProps {
  spins: number[]
  size: number
  onSpinClick?: (index: number) => void
}

export function IsingGrid({ spins, size: _size, onSpinClick }: IsingGridProps) {
  const gridSize = Math.sqrt(spins.length)

  const grid = useMemo(() => {
    const rows: number[][] = []
    for (let i = 0; i < gridSize; i++) {
      rows.push(spins.slice(i * gridSize, (i + 1) * gridSize))
    }
    return rows
  }, [spins, gridSize])

  return (
    <div className="p-4 bg-dark-card rounded-lg neon-border">
      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
      >
        {grid.map((row, i) =>
          row.map((spin, j) => {
            const idx = i * gridSize + j
            return (
              <motion.button
                key={idx}
                onClick={() => onSpinClick?.(idx)}
                className={`aspect-square rounded-sm transition-colors ${
                  spin === 1
                    ? 'bg-neon-cyan shadow-neon-cyan'
                    : 'bg-neon-orange shadow-neon-orange'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.01 }}
              />
            )
          })
        )}
      </div>
      <div className="mt-4 flex justify-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-neon-cyan rounded-sm" />
          <span className="text-gray-400">+1</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-neon-orange rounded-sm" />
          <span className="text-gray-400">-1</span>
        </div>
      </div>
    </div>
  )
}
