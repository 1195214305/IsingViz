import { useMemo, useRef, useEffect } from 'react'
import * as d3 from 'd3'
import type { LocalMinimum, SaddlePoint } from '../utils/disconnectivity'

interface DGProps {
  minima: LocalMinimum[]
  saddles: SaddlePoint[]
  width?: number
  height?: number
}

export function DisconnectivityGraph({ minima, saddles, width = 600, height = 500 }: DGProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || minima.length === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const margin = { top: 40, right: 40, bottom: 60, left: 80 }
    const w = width - margin.left - margin.right
    const h = height - margin.top - margin.bottom

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // 能量范围
    const energies = [...minima.map(m => m.energy), ...saddles.map(s => s.energy)]
    const minE = Math.min(...energies)
    const maxE = Math.max(...energies)

    // Y轴：能量
    const yScale = d3.scaleLinear()
      .domain([maxE + 0.1 * (maxE - minE), minE - 0.1 * (maxE - minE)])
      .range([0, h])

    // X轴：根据盆地大小排列
    const sortedMinima = [...minima].sort((a, b) => b.basinSize - a.basinSize)
    const xPositions = new Map<number, number>()
    sortedMinima.forEach((m, i) => {
      xPositions.set(m.id, (i + 0.5) * (w / sortedMinima.length))
    })

    // 绘制Y轴
    const yAxis = d3.axisLeft(yScale).ticks(8)
    g.append('g')
      .call(yAxis)
      .selectAll('text')
      .style('fill', '#888')
      .style('font-size', '12px')

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -60)
      .attr('x', -h / 2)
      .attr('fill', '#00e5cc')
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .text('能量 E')

    // 绘制鞍点连接线
    saddles.forEach(saddle => {
      const x1 = xPositions.get(saddle.from) || 0
      const x2 = xPositions.get(saddle.to) || 0
      const yE = yScale(saddle.energy)
      const y1 = yScale(minima.find(m => m.id === saddle.from)?.energy || 0)
      const y2 = yScale(minima.find(m => m.id === saddle.to)?.energy || 0)

      // 垂直线到鞍点
      g.append('line')
        .attr('x1', x1)
        .attr('y1', y1)
        .attr('x2', x1)
        .attr('y2', yE)
        .attr('stroke', '#ff6b35')
        .attr('stroke-width', 2)
        .attr('opacity', 0.8)

      g.append('line')
        .attr('x1', x2)
        .attr('y1', y2)
        .attr('x2', x2)
        .attr('y2', yE)
        .attr('stroke', '#ff6b35')
        .attr('stroke-width', 2)
        .attr('opacity', 0.8)

      // 水平连接
      g.append('line')
        .attr('x1', x1)
        .attr('y1', yE)
        .attr('x2', x2)
        .attr('y2', yE)
        .attr('stroke', '#ff6b35')
        .attr('stroke-width', 2)
        .attr('opacity', 0.8)
    })

    // 绘制局部极小值点
    sortedMinima.forEach(m => {
      const x = xPositions.get(m.id) || 0
      const y = yScale(m.energy)

      g.append('circle')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', Math.max(6, Math.sqrt(m.basinSize) * 3))
        .attr('fill', '#00e5cc')
        .attr('stroke', '#fff')
        .attr('stroke-width', 2)
        .style('cursor', 'pointer')
        .on('mouseover', function() {
          d3.select(this).attr('fill', '#ff2e88')
        })
        .on('mouseout', function() {
          d3.select(this).attr('fill', '#00e5cc')
        })
        .append('title')
        .text(`极小值 ${m.id}\n能量: ${m.energy.toFixed(4)}\n盆地大小: ${m.basinSize}`)

      // 标签
      g.append('text')
        .attr('x', x)
        .attr('y', y + 25)
        .attr('text-anchor', 'middle')
        .attr('fill', '#888')
        .style('font-size', '11px')
        .text(`M${m.id}`)
    })

    // 标题
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 25)
      .attr('text-anchor', 'middle')
      .attr('fill', '#fff')
      .style('font-size', '16px')
      .style('font-weight', '600')
      .text('断连图 (Disconnectivity Graph)')

  }, [minima, saddles, width, height])

  return (
    <div className="bg-dark-card rounded-xl border border-gray-800 p-4">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="w-full"
        style={{ maxWidth: width }}
      />
      <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-neon-cyan"></div>
          <span>局部极小值</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-neon-orange"></div>
          <span>能量势垒</span>
        </div>
        <div className="flex items-center gap-2">
          <span>圆圈大小 ∝ 盆地大小</span>
        </div>
      </div>
    </div>
  )
}
