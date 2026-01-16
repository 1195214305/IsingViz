import { useMemo } from 'react'
import Plot from 'react-plotly.js'

interface EnergyLandscapeProps {
  states: { state: number[], energy: number }[]
  title?: string
}

export function EnergyLandscape3D({ states, title = '能量景观' }: EnergyLandscapeProps) {
  const plotData = useMemo(() => {
    const n = states[0]?.state.length || 0
    if (n < 2) return null

    // 使用前两个自旋作为x,y坐标
    const x: number[] = []
    const y: number[] = []
    const z: number[] = []
    const colors: number[] = []

    states.forEach(({ state, energy }) => {
      x.push(state[0])
      y.push(state[1])
      z.push(energy)
      colors.push(energy)
    })

    return { x, y, z, colors }
  }, [states])

  if (!plotData) return <div>数据不足</div>

  return (
    <div className="plotly-container">
      <Plot
        data={[{
          type: 'scatter3d',
          mode: 'markers',
          x: plotData.x,
          y: plotData.y,
          z: plotData.z,
          marker: {
            size: 6,
            color: plotData.colors,
            colorscale: [[0, '#00e5cc'], [1, '#ff6b35']],
            opacity: 0.8,
          },
        }]}
        layout={{
          title: { text: title, font: { color: '#e0e0e0' } },
          paper_bgcolor: '#12121a',
          plot_bgcolor: '#12121a',
          scene: {
            xaxis: { title: 'S1', color: '#666', gridcolor: '#333' },
            yaxis: { title: 'S2', color: '#666', gridcolor: '#333' },
            zaxis: { title: 'Energy', color: '#666', gridcolor: '#333' },
            bgcolor: '#12121a',
          },
          margin: { l: 0, r: 0, t: 40, b: 0 },
          autosize: true,
        }}
        style={{ width: '100%', height: '400px' }}
        config={{ responsive: true }}
      />
    </div>
  )
}
