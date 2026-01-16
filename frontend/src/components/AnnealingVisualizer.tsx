import { useMemo, useRef, useEffect } from 'react'
import * as d3 from 'd3'

interface AnnealingVisualizerProps {
  history: { step: number; energy: number; temp: number }[]
  bestEnergy: number
}

export function AnnealingVisualizer({ history, bestEnergy }: AnnealingVisualizerProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || history.length === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const width = 700
    const height = 350
    const margin = { top: 30, right: 80, bottom: 50, left: 70 }
    const w = width - margin.left - margin.right
    const h = height - margin.top - margin.bottom

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    // 比例尺
    const xScale = d3.scaleLinear()
      .domain([0, history.length - 1])
      .range([0, w])

    const energies = history.map(h => h.energy)
    const temps = history.map(h => h.temp)

    const yEnergyScale = d3.scaleLinear()
      .domain([Math.min(...energies) * 1.1, Math.max(...energies) * 1.1])
      .range([h, 0])

    const yTempScale = d3.scaleLinear()
      .domain([0, Math.max(...temps) * 1.1])
      .range([h, 0])

    // 坐标轴
    g.append('g')
      .attr('transform', `translate(0,${h})`)
      .call(d3.axisBottom(xScale).ticks(10))
      .selectAll('text').style('fill', '#888')

    g.append('g')
      .call(d3.axisLeft(yEnergyScale).ticks(8))
      .selectAll('text').style('fill', '#00e5cc')

    g.append('g')
      .attr('transform', `translate(${w},0)`)
      .call(d3.axisRight(yTempScale).ticks(8))
      .selectAll('text').style('fill', '#ff6b35')

    // 轴标签
    g.append('text')
      .attr('x', w / 2)
      .attr('y', h + 40)
      .attr('fill', '#888')
      .attr('text-anchor', 'middle')
      .text('迭代步数')

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -50)
      .attr('x', -h / 2)
      .attr('fill', '#00e5cc')
      .attr('text-anchor', 'middle')
      .text('能量 E')

    g.append('text')
      .attr('transform', 'rotate(90)')
      .attr('y', -w - 60)
      .attr('x', h / 2)
      .attr('fill', '#ff6b35')
      .attr('text-anchor', 'middle')
      .text('温度 T')

    // 能量曲线
    const energyLine = d3.line<{ step: number; energy: number }>()
      .x((d, i) => xScale(i))
      .y(d => yEnergyScale(d.energy))
      .curve(d3.curveMonotoneX)

    g.append('path')
      .datum(history)
      .attr('fill', 'none')
      .attr('stroke', '#00e5cc')
      .attr('stroke-width', 2)
      .attr('d', energyLine)

    // 温度曲线
    const tempLine = d3.line<{ step: number; temp: number }>()
      .x((d, i) => xScale(i))
      .y(d => yTempScale(d.temp))
      .curve(d3.curveMonotoneX)

    g.append('path')
      .datum(history)
      .attr('fill', 'none')
      .attr('stroke', '#ff6b35')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,3')
      .attr('d', tempLine)

    // 最优能量线
    g.append('line')
      .attr('x1', 0)
      .attr('y1', yEnergyScale(bestEnergy))
      .attr('x2', w)
      .attr('y2', yEnergyScale(bestEnergy))
      .attr('stroke', '#ff2e88')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '8,4')

    g.append('text')
      .attr('x', 10)
      .attr('y', yEnergyScale(bestEnergy) - 5)
      .attr('fill', '#ff2e88')
      .style('font-size', '12px')
      .text(`最优: ${bestEnergy.toFixed(4)}`)

    // 图例
    const legend = svg.append('g').attr('transform', `translate(${margin.left + 10}, 15)`)

    legend.append('line').attr('x1', 0).attr('y1', 0).attr('x2', 20).attr('y2', 0)
      .attr('stroke', '#00e5cc').attr('stroke-width', 2)
    legend.append('text').attr('x', 25).attr('y', 4).attr('fill', '#888').style('font-size', '12px').text('能量')

    legend.append('line').attr('x1', 80).attr('y1', 0).attr('x2', 100).attr('y2', 0)
      .attr('stroke', '#ff6b35').attr('stroke-width', 2).attr('stroke-dasharray', '5,3')
    legend.append('text').attr('x', 105).attr('y', 4).attr('fill', '#888').style('font-size', '12px').text('温度')

    legend.append('line').attr('x1', 165).attr('y1', 0).attr('x2', 185).attr('y2', 0)
      .attr('stroke', '#ff2e88').attr('stroke-width', 1.5).attr('stroke-dasharray', '8,4')
    legend.append('text').attr('x', 190).attr('y', 4).attr('fill', '#888').style('font-size', '12px').text('最优能量')

  }, [history, bestEnergy])

  return (
    <div className="bg-dark-card rounded-xl border border-gray-800 p-4 overflow-hidden">
      <svg ref={svgRef} viewBox="0 0 700 350" className="w-full" />
    </div>
  )
}
