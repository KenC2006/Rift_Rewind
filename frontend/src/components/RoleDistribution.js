import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import './RoleDistribution.css';

const RoleDistribution = ({ rolesPlayed }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!rolesPlayed) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    // Role colors (softer, more aesthetically pleasing palette)
    const roleColors = {
      TOP: '#FF6B6B',      // Soft coral red
      JUNGLE: '#51CF66',   // Soft mint green
      MIDDLE: '#4DABF7',   // Soft sky blue
      BOTTOM: '#FFA94D',   // Soft peach orange
      SUPPORT: '#B197FC'   // Soft lavender purple
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

    // Chart dimensions - Increased for better visibility
    const width = 450;
    const height = 450;
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

    const paths = slices.append('path')
      .attr('d', arc)
      .attr('fill', d => d.data.color)
      .attr('stroke', '#1a1a2e')
      .attr('stroke-width', 2)
      .style('opacity', 0)
      .style('filter', d => `drop-shadow(0 0 6px ${d.data.color}30)`)
      .style('cursor', 'pointer')
      .style('transform', 'scale(0)')
      .style('transform-origin', 'center')
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
          .style('opacity', 0.9);

        tooltip.style('opacity', 0);
      });

    // Animate pie chart entrance with scale and fade
    paths
      .transition()
      .duration(800)
      .delay((d, i) => i * 150)
      .ease(d3.easeCubicOut)
      .style('opacity', 0.9)
      .style('transform', 'scale(1)');

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
      <h3 className="chart-title" style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '1px', color: '#F0E6D2' }}>Role Distribution</h3>
      <svg ref={svgRef}></svg>
      <div className="role-legend">
        {rolesPlayed && Object.entries(rolesPlayed)
          .sort((a, b) => {
            const order = ['TOP', 'JUNGLE', 'MIDDLE', 'BOTTOM', 'SUPPORT'];
            return order.indexOf(a[0]) - order.indexOf(b[0]);
          })
          .map(([role, games]) => (
            <div key={role} className="legend-item">
              <span className="legend-dot" style={{
                background: {
                  TOP: '#FF6B6B',
                  JUNGLE: '#51CF66',
                  MIDDLE: '#4DABF7',
                  BOTTOM: '#FFA94D',
                  SUPPORT: '#B197FC'
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

