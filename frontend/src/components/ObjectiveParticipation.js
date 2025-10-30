import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import './ObjectiveParticipation.css';

const ObjectiveParticipation = ({ stats }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!stats) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    // Role-based benchmarks for objectives per game
    const roleBenchmarks = {
      MIDDLE: { dragons: 0.8, barons: 0.12, turrets: 2.2 },
      TOP: { dragons: 0.7, barons: 0.10, turrets: 2.4 },
      JUNGLE: { dragons: 1.2, barons: 0.18, turrets: 1.8 },
      BOTTOM: { dragons: 0.75, barons: 0.11, turrets: 2.3 },
      SUPPORT: { dragons: 0.85, barons: 0.13, turrets: 1.9 }
    };

    const benchmark = roleBenchmarks[stats.primary_role] || roleBenchmarks.MIDDLE;

    // Prepare data
    const data = [
      {
        objective: 'Dragons',
        player: stats.avg_dragons || 0,
        benchmark: benchmark.dragons,
        icon: '🐉',
        color: '#e74c3c'
      },
      {
        objective: 'Barons',
        player: stats.avg_barons || 0,
        benchmark: benchmark.barons,
        icon: '👹',
        color: '#9b59b6'
      },
      {
        objective: 'Turrets',
        player: stats.avg_turrets || 0,
        benchmark: benchmark.turrets,
        icon: '🗼',
        color: '#3498db'
      }
    ];

    // Chart dimensions
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    const width = 500 - margin.left - margin.right;
    const height = 350 - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Scales
    const x0 = d3.scaleBand()
      .domain(data.map(d => d.objective))
      .range([0, width])
      .padding(0.3);

    const x1 = d3.scaleBand()
      .domain(['player', 'benchmark'])
      .range([0, x0.bandwidth()])
      .padding(0.1);

    const maxValue = d3.max(data, d => Math.max(d.player, d.benchmark)) * 1.2;

    const y = d3.scaleLinear()
      .domain([0, maxValue])
      .range([height, 0])
      .nice();

    // Add grid lines
    const gridLines = g.append('g')
      .attr('class', 'grid')
      .selectAll('line')
      .data(y.ticks(5))
      .enter()
      .append('line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', d => y(d))
      .attr('y2', d => y(d))
      .style('stroke', '#333')
      .style('stroke-width', '1px')
      .style('stroke-dasharray', '3,3')
      .style('opacity', 0.3);

    // Draw objective groups
    const objectiveGroups = g.selectAll('.objective-group')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'objective-group')
      .attr('transform', d => `translate(${x0(d.objective)}, 0)`);

    // Player bars
    objectiveGroups.append('rect')
      .attr('class', 'player-bar')
      .attr('x', x1('player'))
      .attr('y', height)
      .attr('width', x1.bandwidth())
      .attr('height', 0)
      .attr('rx', 4)
      .attr('ry', 4)
      .style('fill', d => d.color)
      .style('opacity', 0.9)
      .style('filter', d => `drop-shadow(0 0 6px ${d.color})`)
      .transition()
      .duration(1000)
      .delay((d, i) => i * 200)
      .attr('y', d => y(d.player))
      .attr('height', d => height - y(d.player));

    // Benchmark bars
    objectiveGroups.append('rect')
      .attr('class', 'benchmark-bar')
      .attr('x', x1('benchmark'))
      .attr('y', height)
      .attr('width', x1.bandwidth())
      .attr('height', 0)
      .attr('rx', 4)
      .attr('ry', 4)
      .style('fill', '#ffc107')
      .style('opacity', 0.7)
      .transition()
      .duration(1000)
      .delay((d, i) => i * 200 + 100)
      .attr('y', d => y(d.benchmark))
      .attr('height', d => height - y(d.benchmark));

    // Player value labels
    objectiveGroups.append('text')
      .attr('class', 'value-label')
      .attr('x', x1('player') + x1.bandwidth() / 2)
      .attr('y', d => y(d.player) - 5)
      .attr('text-anchor', 'middle')
      .style('fill', '#fff')
      .style('font-size', '12px')
      .style('font-weight', '700')
      .style('opacity', 0)
      .text(d => d.player.toFixed(2))
      .transition()
      .delay((d, i) => i * 200 + 1000)
      .duration(300)
      .style('opacity', 1);

    // Benchmark value labels
    objectiveGroups.append('text')
      .attr('class', 'value-label')
      .attr('x', x1('benchmark') + x1.bandwidth() / 2)
      .attr('y', d => y(d.benchmark) - 5)
      .attr('text-anchor', 'middle')
      .style('fill', '#ffc107')
      .style('font-size', '12px')
      .style('font-weight', '700')
      .style('opacity', 0)
      .text(d => d.benchmark.toFixed(2))
      .transition()
      .delay((d, i) => i * 200 + 1000)
      .duration(300)
      .style('opacity', 1);

    // X axis with icons and labels
    const xAxis = g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${height})`);

    data.forEach((d, i) => {
      const xPos = x0(d.objective) + x0.bandwidth() / 2;

      // Icon
      xAxis.append('text')
        .attr('x', xPos)
        .attr('y', 20)
        .attr('text-anchor', 'middle')
        .style('font-size', '24px')
        .text(d.icon);

      // Label
      xAxis.append('text')
        .attr('x', xPos)
        .attr('y', 48)
        .attr('text-anchor', 'middle')
        .style('fill', '#fff')
        .style('font-size', '13px')
        .style('font-weight', '600')
        .text(d.objective);
    });

    // Y axis
    const yAxis = d3.axisLeft(y)
      .ticks(5)
      .tickFormat(d => d.toFixed(1));

    g.append('g')
      .attr('class', 'y-axis')
      .call(yAxis)
      .style('color', '#999')
      .style('font-size', '11px');

    // Y axis label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -45)
      .attr('text-anchor', 'middle')
      .style('fill', '#999')
      .style('font-size', '12px')
      .text('Per Game Average');

    // Add hover effects
    objectiveGroups.selectAll('rect')
      .on('mouseover', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .style('opacity', 1)
          .attr('y', function() {
            const currentY = parseFloat(d3.select(this).attr('y'));
            return currentY - 3;
          })
          .attr('height', function() {
            const currentHeight = parseFloat(d3.select(this).attr('height'));
            return currentHeight + 3;
          });
      })
      .on('mouseout', function() {
        const originalData = d3.select(this).datum();
        const isPlayer = d3.select(this).classed('player-bar');
        const value = isPlayer ? originalData.player : originalData.benchmark;

        d3.select(this)
          .transition()
          .duration(200)
          .style('opacity', isPlayer ? 0.9 : 0.7)
          .attr('y', y(value))
          .attr('height', height - y(value));
      });

  }, [stats]);

  return (
    <div className="objective-participation">
      <div className="chart-title-row">
        <h3 className="chart-title">Objective Participation</h3>
        <div className="help-icon" aria-label="Objective Participation info" tabIndex={0}>
          ?
          <div className="help-tooltip">
            Compares your average Dragons, Barons, and Turret takedowns per game to role benchmarks. Higher participation often correlates with stronger macro play, better rotations, and more reliable win conditions.
          </div>
        </div>
      </div>
      <p className="chart-subtitle">Objectives per game vs role benchmark</p>
      <div className="chart-legend">
        <div className="legend-item">
          <span className="legend-box player"></span>
          <span>Your Performance</span>
        </div>
        <div className="legend-item">
          <span className="legend-box benchmark"></span>
          <span>{stats.primary_role} Benchmark</span>
        </div>
      </div>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default ObjectiveParticipation;

