import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import './TeamContribution.css';

const TeamContribution = ({ stats }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!stats) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    // Expected contribution by role (approximate benchmarks)
    const roleExpectedContribution = {
      TOP: { damage: 22, gold: 20 },
      JUNGLE: { damage: 18, gold: 18 },
      MIDDLE: { damage: 28, gold: 22 },
      BOTTOM: { damage: 30, gold: 24 },
      SUPPORT: { damage: 12, gold: 16 }
    };

    // Calculate average benchmarks across all roles
    const roles = Object.values(roleExpectedContribution);
    const expected = {
      damage: roles.reduce((sum, r) => sum + r.damage, 0) / roles.length,
      gold: roles.reduce((sum, r) => sum + r.gold, 0) / roles.length
    };

    // Get actual values (with fallback if not available)
    const damageShare = stats.avg_damage_share || 20;
    const goldShare = stats.avg_gold_share || 20;

    const data = [
      {
        label: 'Damage Share',
        actual: damageShare,
        expected: expected.damage
      },
      {
        label: 'Gold Share',
        actual: goldShare,
        expected: expected.gold
      }
    ];

    // Chart dimensions
    const width = 450;
    const height = 300;
    const margin = { top: 20, right: 40, bottom: 40, left: 140 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    const barHeight = 40;
    const spacing = 60;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Scale for percentage (0-40%)
    const xScale = d3.scaleLinear()
      .domain([0, 40])
      .range([0, chartWidth]);

    // Draw grid lines
    const gridLines = [0, 10, 20, 30, 40];
    gridLines.forEach(value => {
      g.append('line')
        .attr('x1', xScale(value))
        .attr('x2', xScale(value))
        .attr('y1', 0)
        .attr('y2', chartHeight)
        .style('stroke', '#444')
        .style('stroke-width', '1px')
        .style('opacity', 0.3)
        .style('stroke-dasharray', value === 0 ? 'none' : '3,3');
    });

    // Draw each metric
    data.forEach((d, i) => {
      const yPos = i * spacing + 30;

      // Group for this metric
      const metricGroup = g.append('g')
        .attr('transform', `translate(0, ${yPos})`);

      // Label
      metricGroup.append('text')
        .attr('x', -15)
        .attr('y', barHeight / 2)
        .attr('text-anchor', 'end')
        .attr('dominant-baseline', 'middle')
        .style('font-size', '14px')
        .style('font-weight', '600')
        .style('fill', '#fff')
        .style('text-transform', 'uppercase')
        .style('letter-spacing', '0.5px')
        .text(d.label);

      // Background track
      metricGroup.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', chartWidth)
        .attr('height', barHeight)
        .attr('rx', 6)
        .style('fill', '#1a1a2e')
        .style('opacity', 0.5);

      // Expected marker line
      metricGroup.append('line')
        .attr('x1', xScale(d.expected))
        .attr('x2', xScale(d.expected))
        .attr('y1', -8)
        .attr('y2', barHeight + 8)
        .style('stroke', '#C89B3C')
        .style('stroke-width', '2px')
        .style('stroke-dasharray', '4,4')
        .style('opacity', 0.8);

      // Expected marker dot
      metricGroup.append('circle')
        .attr('cx', xScale(d.expected))
        .attr('cy', -8)
        .attr('r', 4)
        .style('fill', '#C89B3C')
        .style('filter', 'drop-shadow(0 0 4px #C89B3C)');

      // Expected value label (above the marker)
      metricGroup.append('text')
        .attr('x', xScale(d.expected))
        .attr('y', -16)
        .attr('text-anchor', 'middle')
        .style('fill', '#C89B3C')
        .style('font-size', '10px')
        .style('font-weight', '600')
        .style('opacity', 0)
        .text(`${d.expected.toFixed(1)}%`)
        .transition()
        .duration(500)
        .delay(i * 200 + 1000)
        .style('opacity', 1);

      // Actual bar (animated)
      const actualBar = metricGroup.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', 0)
        .attr('height', barHeight)
        .attr('rx', 6)
        .style('fill', '#9B59B6')
        .style('opacity', 0.85)
        .style('filter', 'drop-shadow(0 0 8px #9B59B6)');

      actualBar
        .transition()
        .duration(1500)
        .delay(i * 200)
        .ease(d3.easeQuadOut)
        .attr('width', xScale(Math.min(d.actual, 40)));

      // Actual value label (on bar)
      const actualLabel = metricGroup.append('text')
        .attr('x', 12)
        .attr('y', barHeight / 2)
        .attr('dominant-baseline', 'middle')
        .style('fill', '#fff')
        .style('font-size', '16px')
        .style('font-weight', '700')
        .style('opacity', 0)
        .text(`${d.actual.toFixed(1)}%`);

      actualLabel
        .transition()
        .duration(500)
        .delay(i * 200 + 1500)
        .style('opacity', 1);

      // Performance indicator (to the right of bar)
      const performance = d.actual - d.expected;
      const performanceText = performance >= 0
        ? `+${performance.toFixed(1)}%`
        : `${performance.toFixed(1)}%`;

      const performanceColor = performance >= 0 ? '#00c853' : '#ff5252';

      metricGroup.append('text')
        .attr('x', Math.max(xScale(d.actual), xScale(d.expected)) + 10)
        .attr('y', barHeight / 2)
        .attr('dominant-baseline', 'middle')
        .style('fill', performanceColor)
        .style('font-size', '13px')
        .style('font-weight', '700')
        .style('opacity', 0)
        .text(performanceText)
        .transition()
        .duration(500)
        .delay(i * 200 + 1500)
        .style('opacity', 1);
    });

    // X-axis
    const xAxis = d3.axisBottom(xScale)
      .tickValues([0, 10, 20, 30, 40])
      .tickFormat(d => d + '%');

    g.append('g')
      .attr('transform', `translate(0, ${chartHeight})`)
      .call(xAxis)
      .style('color', '#666')
      .style('font-size', '11px');

  }, [stats]);

  return (
    <div className="team-contribution">
      <h3 className="chart-title">Team Contribution</h3>
      <p className="chart-subtitle">Compared to average benchmarks across all roles</p>
      <div className="chart-legend">
        <div className="legend-item">
          <span className="legend-color" style={{ background: '#9B59B6' }}></span>
          <span>Your Performance</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ background: '#C89B3C' }}></span>
          <span>Average Benchmark</span>
        </div>
      </div>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default TeamContribution;

