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

    const expected = roleExpectedContribution[stats.primary_role] || { damage: 20, gold: 20 };

    // Get actual values (with fallback if not available)
    const damageShare = stats.avg_damage_share || 20; // Default to 20% if not available
    const goldShare = stats.avg_gold_share || 20;

    const data = [
      {
        label: 'Damage Share',
        actual: damageShare,
        expected: expected.damage,
        icon: '💥',
        color: '#e74c3c'
      },
      {
        label: 'Gold Share',
        actual: goldShare,
        expected: expected.gold,
        icon: '💰',
        color: '#f39c12'
      }
    ];

    // Chart dimensions
    const width = 400;
    const height = 300;
    const margin = { top: 40, right: 20, bottom: 20, left: 20 };
    const barHeight = 60;
    const spacing = 80;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Scale for percentage (0-50%)
    const xScale = d3.scaleLinear()
      .domain([0, 50])
      .range([0, width - margin.left - margin.right]);

    // Draw each gauge
    data.forEach((d, i) => {
      const yPos = i * (barHeight + spacing);

      // Group for this gauge
      const gaugeGroup = g.append('g')
        .attr('transform', `translate(0, ${yPos})`);

      // Label with icon
      gaugeGroup.append('text')
        .attr('x', 0)
        .attr('y', -10)
        .style('font-size', '16px')
        .style('font-weight', '700')
        .style('fill', '#fff')
        .text(`${d.icon} ${d.label}`);

      // Background track
      gaugeGroup.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', xScale(50))
        .attr('height', barHeight)
        .attr('rx', 8)
        .style('fill', '#1a1a2e')
        .style('opacity', 0.5);

      // Expected marker line
      gaugeGroup.append('line')
        .attr('x1', xScale(d.expected))
        .attr('x2', xScale(d.expected))
        .attr('y1', -5)
        .attr('y2', barHeight + 5)
        .style('stroke', '#ffc107')
        .style('stroke-width', '3px')
        .style('stroke-dasharray', '5,5');

      // Expected label
      gaugeGroup.append('text')
        .attr('x', xScale(d.expected))
        .attr('y', barHeight + 20)
        .attr('text-anchor', 'middle')
        .style('fill', '#ffc107')
        .style('font-size', '11px')
        .style('font-weight', '600')
        .text(`Expected: ${d.expected}%`);

      // Actual bar (animated)
      const actualBar = gaugeGroup.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', 0)
        .attr('height', barHeight)
        .attr('rx', 8)
        .style('fill', d.color)
        .style('opacity', 0.9)
        .style('filter', `drop-shadow(0 0 8px ${d.color})`);

      actualBar
        .transition()
        .duration(1500)
        .delay(i * 200)
        .ease(d3.easeQuadOut)
        .attr('width', xScale(Math.min(d.actual, 50)));

      // Actual value label (on bar)
      const actualLabel = gaugeGroup.append('text')
        .attr('x', 10)
        .attr('y', barHeight / 2)
        .attr('dominant-baseline', 'middle')
        .style('fill', '#fff')
        .style('font-size', '20px')
        .style('font-weight', '700')
        .style('opacity', 0)
        .text(`${d.actual.toFixed(1)}%`);

      actualLabel
        .transition()
        .duration(500)
        .delay(i * 200 + 1500)
        .style('opacity', 1);

      // Performance indicator
      const performance = d.actual - d.expected;
      const performanceText = performance > 0 
        ? `+${performance.toFixed(1)}% above expected`
        : `${performance.toFixed(1)}% below expected`;
      
      const performanceColor = performance > 0 ? '#00c853' : '#ff5252';

      gaugeGroup.append('text')
        .attr('x', xScale(50))
        .attr('y', barHeight / 2)
        .attr('text-anchor', 'end')
        .attr('dominant-baseline', 'middle')
        .style('fill', performanceColor)
        .style('font-size', '12px')
        .style('font-weight', '600')
        .style('opacity', 0)
        .text(performanceText)
        .transition()
        .duration(500)
        .delay(i * 200 + 1500)
        .style('opacity', 1);
    });

    // Scale reference at bottom
    const scaleY = data.length * (barHeight + spacing) - 20;
    const scaleAxis = d3.axisBottom(xScale)
      .tickValues([0, 10, 20, 30, 40, 50])
      .tickFormat(d => d + '%');

    g.append('g')
      .attr('transform', `translate(0, ${scaleY})`)
      .call(scaleAxis)
      .style('color', '#666')
      .style('font-size', '10px');

  }, [stats]);

  return (
    <div className="team-contribution">
      <div className="chart-title-row">
        <h3 className="chart-title">Team Contribution</h3>
        <div className="help-icon" aria-label="Team Contribution info" tabIndex={0}>
          ?
          <div className="help-tooltip">
            Shows your share of team damage and gold compared to expected values for your role. Higher damage/gold share generally indicates more carry potential; lower values suggest a supportive or enabling playstyle.
          </div>
        </div>
      </div>
      <p className="chart-subtitle">Your share of team resources vs {stats.primary_role} expected</p>
      <svg ref={svgRef}></svg>
      <div className="contribution-note">
        <span className="note-icon">💡</span>
        <span>Higher % = More carry potential. Lower % = More supportive style.</span>
      </div>
    </div>
  );
};

export default TeamContribution;

