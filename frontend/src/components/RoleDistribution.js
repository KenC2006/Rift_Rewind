import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import './RoleDistribution.css';

const RoleDistribution = ({ rolesPlayed }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!rolesPlayed) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    // Role colors (standard League colors)
    const roleColors = {
      TOP: '#ff6b6b',
      JUNGLE: '#4ecdc4',
      MIDDLE: '#45b7d1',
      BOTTOM: '#f9ca24',
      SUPPORT: '#95e1d3'
    };

    // Role icons/emojis
    const roleIcons = {
      TOP: '⚔️',
      JUNGLE: '🌲',
      MIDDLE: '✨',
      BOTTOM: '🏹',
      SUPPORT: '🛡️'
    };

    // Prepare data
    const data = Object.entries(rolesPlayed)
      .map(([role, games]) => ({
        role,
        games,
        color: roleColors[role] || '#888',
        icon: roleIcons[role] || '❓'
      }))
      .sort((a, b) => b.games - a.games);

    const total = data.reduce((sum, d) => sum + d.games, 0);

    // Chart dimensions
    const width = 400;
    const height = 400;
    const radius = Math.min(width, height) / 2 - 40;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    // Pie and arc generators
    const pie = d3.pie()
      .value(d => d.games)
      .sort(null);

    const arc = d3.arc()
      .innerRadius(radius * 0.6) // Donut chart
      .outerRadius(radius);

    const hoverArc = d3.arc()
      .innerRadius(radius * 0.6)
      .outerRadius(radius + 10);

    // Draw slices
    const slices = g.selectAll('.slice')
      .data(pie(data))
      .enter()
      .append('g')
      .attr('class', 'slice');

    slices.append('path')
      // Start with zero radius for clean entrance
      .attr('d', (d) => d3.arc().innerRadius(0).outerRadius(0)(d))
      .attr('fill', d => d.data.color)
      .attr('stroke', '#1a1a2e')
      .attr('stroke-width', 3)
      .style('opacity', 0.85)
      .style('filter', d => `drop-shadow(0 0 8px ${d.data.color})`)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('d', hoverArc)
          .style('opacity', 1);

        // Show tooltip
        tooltip
          .style('opacity', 1)
          .html(`
            <div style="text-align: center;">
              <div style="font-size: 24px;">${d.data.icon}</div>
              <strong>${d.data.role}</strong><br/>
              ${d.data.games} games (${((d.data.games / total) * 100).toFixed(1)}%)
            </div>
          `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('d', arc)
          .style('opacity', 0.85);

        tooltip.style('opacity', 0);
      });

    // Animate pie chart entrance (grow from center)
    slices.selectAll('path')
      .transition()
      .duration(1000)
      .ease(d3.easeCubicOut)
      .attrTween('d', function(d) {
        const r0 = 0;
        const r1 = radius;
        const ir0 = 0;
        const ir1 = radius * 0.6;
        const ro = d3.interpolate(r0, r1);
        const ri = d3.interpolate(ir0, ir1);
        return function(t) {
          const generator = d3.arc()
            .innerRadius(ri(t))
            .outerRadius(ro(t));
          return generator(d);
        };
      });

    // Add percentage labels on slices
    slices.append('text')
      .attr('transform', d => {
        const [x, y] = arc.centroid(d);
        return `translate(${x}, ${y})`;
      })
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .style('fill', '#fff')
      .style('font-size', '14px')
      .style('font-weight', '700')
      .style('pointer-events', 'none')
      .style('text-shadow', '0 0 4px rgba(0,0,0,0.8)')
      .style('opacity', 0)
      .text(d => {
        const percentage = (d.data.games / total) * 100;
        return percentage > 5 ? `${percentage.toFixed(0)}%` : '';
      })
      .transition()
      .delay(1000)
      .duration(500)
      .style('opacity', 1);

    // Center text showing total games
    const centerText = g.append('g')
      .attr('class', 'center-text');

    centerText.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', -10)
      .style('font-size', '36px')
      .style('font-weight', '700')
      .style('fill', '#fff')
      .text(total);

    centerText.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', 15)
      .style('font-size', '14px')
      .style('fill', '#999')
      .text('Total Games');

    // Create tooltip
    const tooltip = d3.select('body')
      .append('div')
      .attr('class', 'role-tooltip')
      .style('position', 'absolute')
      .style('background', 'rgba(0, 0, 0, 0.9)')
      .style('color', '#fff')
      .style('padding', '12px 16px')
      .style('border-radius', '8px')
      .style('font-size', '13px')
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .style('z-index', 1000);

    // Cleanup
    return () => {
      tooltip.remove();
    };

  }, [rolesPlayed]);

  return (
    <div className="role-distribution">
      <div className="chart-title-row">
        <h3 className="chart-title">Role Distribution</h3>
        <div className="help-icon" aria-label="Role Distribution info" tabIndex={0}>
          ?
          <div className="help-tooltip">
            Displays the proportion of your games played in each role. This helps identify your primary role and how consistently you queue and perform in that position across the season.
          </div>
        </div>
      </div>
      <p className="chart-subtitle">Games played per role</p>
      <svg ref={svgRef}></svg>
      <div className="role-legend">
        {rolesPlayed && Object.entries(rolesPlayed)
          .sort((a, b) => b[1] - a[1])
          .map(([role, games]) => (
            <div key={role} className="legend-item">
              <span className="legend-dot" style={{ 
                background: {
                  TOP: '#ff6b6b',
                  JUNGLE: '#4ecdc4',
                  MIDDLE: '#45b7d1',
                  BOTTOM: '#f9ca24',
                  SUPPORT: '#95e1d3'
                }[role] || '#888'
              }}></span>
              <span className="legend-label">{role}</span>
              <span className="legend-value">{games}</span>
            </div>
          ))}
      </div>
    </div>
  );
};

export default RoleDistribution;

