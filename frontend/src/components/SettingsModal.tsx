import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Key, Sliders, Save, Eye, EyeOff } from 'lucide-react'
import { useAppStore } from '../store'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { settings, updateSettings } = useAppStore()
  const [apiKey, setApiKey] = useState(settings.qwenApiKey)
  const [animSpeed, setAnimSpeed] = useState(settings.animationSpeed)
  const [showKey, setShowKey] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    updateSettings({
      qwenApiKey: apiKey,
      animationSpeed: animSpeed
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-dark-card border border-gray-700 rounded-2xl p-6 z-50"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Sliders className="w-6 h-6 text-neon-cyan" />
                <h2 className="text-xl font-bold text-white">系统设置</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-6">
              {/* API Key 设置 */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                  <Key className="w-4 h-4 text-neon-orange" />
                  通义千问 API Key
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  用于AI辅助分析和智能解释功能。可在阿里云百炼平台获取。
                </p>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-xxxxxxxxxxxxxxxxxxxx"
                    className="w-full bg-dark-bg border border-gray-700 rounded-lg px-4 py-3 pr-12 text-white placeholder-gray-500 focus:border-neon-cyan focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    {showKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* 动画速度 */}
              <div>
                <label className="flex items-center justify-between text-sm font-medium text-gray-300 mb-2">
                  <span>动画速度</span>
                  <span className="text-neon-cyan">{animSpeed}x</span>
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={animSpeed}
                  onChange={(e) => setAnimSpeed(parseFloat(e.target.value))}
                  className="w-full accent-neon-cyan"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>慢 0.5x</span>
                  <span>快 3x</span>
                </div>
              </div>

              {/* 关于信息 */}
              <div className="border-t border-gray-700 pt-4">
                <h3 className="text-sm font-medium text-gray-400 mb-2">关于 API Key</h3>
                <div className="text-xs text-gray-500 space-y-1">
                  <p>• API Key 仅存储在浏览器本地，不会上传到服务器</p>
                  <p>• 用于调用通义千问模型进行量子概念解释</p>
                  <p>• 可在 <a href="https://bailian.console.aliyun.com/" target="_blank" rel="noopener noreferrer" className="text-neon-cyan hover:underline">阿里云百炼平台</a> 免费获取</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-3 bg-neon-cyan text-dark-bg font-semibold rounded-lg hover:bg-neon-cyan/90 transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saved ? '已保存!' : '保存设置'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
