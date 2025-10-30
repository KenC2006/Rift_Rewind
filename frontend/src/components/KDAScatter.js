import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import './KDAScatter.css';

const KDAScatter = ({ champions }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!champions) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    // Prepare data
    const championsArray = Object.entries(champions)
      .filter(([_, data]) => data.games >= 3) // Only show champions with 3+ games
      .map(([name, data]) => ({
        name,
        games: data.games,
        kills: data.kills / data.games,
        deaths: data.deaths / data.games,
        assists: data.assists / data.games,
        winRate: data.games > 0 ? (data.wins / data.games) * 100 : 0,
        kda: data.deaths > 0 
          ? (data.kills + data.assists) / data.deaths 
          : (data.kills + data.assists)
      }));

    if (championsArray.length === 0) return;

    // Chart dimensions
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Scales
    const xScale = d3.scaleLinear()
      .domain([0, d3.max(championsArray, d => d.deaths) * 1.1])
      .range([0, width])
      .nice();

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(championsArray, d => d.kills + d.assists) * 1.1])
      .range([height, 0])
      .nice();

    const sizeScale = d3.scaleSqrt()
      .domain([0, d3.max(championsArray, d => d.games)])
      .range([5, 25]);

    const colorScale = d3.scaleSequential()
      .domain([0, 100])
      .interpolator(d3.interpolateRgb('#E74C3C', '#00C853'));

    // Add grid lines
    const gridLines = g.append('g').attr('class', 'grid');

    gridLines.selectAll('.grid-x')
      .data(xScale.ticks(5))
      .enter()
      .append('line')
      .attr('class', 'grid-x')
      .attr('x1', d => xScale(d))
      .attr('x2', d => xScale(d))
      .attr('y1', 0)
      .attr('y2', height)
      .style('stroke', '#333')
      .style('stroke-width', '1px')
      .style('stroke-dasharray', '3,3')
      .style('opacity', 0.3);

    gridLines.selectAll('.grid-y')
      .data(yScale.ticks(5))
      .enter()
      .append('line')
      .attr('class', 'grid-y')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', d => yScale(d))
      .attr('y2', d => yScale(d))
      .style('stroke', '#333')
      .style('stroke-width', '1px')
      .style('stroke-dasharray', '3,3')
      .style('opacity', 0.3);

    const idealZone = g.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', xScale(5)) // Low deaths (0-5)
      .attr('height', height - yScale(15)) // High K+A (15+)
      .style('fill', '#C89B3C')
      .style('opacity', 0.05)
      .style('pointer-events', 'none');

    g.append('text')
      .attr('x', xScale(2.5))
      .attr('y', Math.max(12, yScale(17)))
      .attr('text-anchor', 'middle')
      .style('fill', '#C89B3C')
      .style('font-size', '11px')
      .style('opacity', 0.6)
      .text('Ideal Zone');

    // Draw circles for champions
    const circles = g.selectAll('.champion-circle')
      .data(championsArray)
      .enter()
      .append('circle')
      .attr('class', 'champion-circle')
      .attr('cx', d => xScale(d.deaths))
      .attr('cy', d => yScale(d.kills + d.assists))
      .attr('r', 0)
      .style('fill', d => colorScale(d.winRate))
      .style('opacity', 0.7)
      .style('stroke', '#fff')
      .style('stroke-width', '2px')
      .style('cursor', 'pointer')
      .style('filter', 'drop-shadow(0 0 4px rgba(0,0,0,0.5))')
      .transition()
      .duration(800)
      .delay((d, i) => i * 50)
      .attr('r', d => sizeScale(d.games));

    // Add axes
    const xAxis = d3.axisBottom(xScale)
      .ticks(5);

    const yAxis = d3.axisLeft(yScale)
      .ticks(5);

    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${height})`)
      .call(xAxis)
      .style('color', '#999')
      .style('font-size', '11px');

    g.append('g')
      .attr('class', 'y-axis')
      .call(yAxis)
      .style('color', '#999')
      .style('font-size', '11px');

    // Axis labels
    g.append('text')
      .attr('x', width / 2)
      .attr('y', height + 45)
      .attr('text-anchor', 'middle')
      .style('fill', '#fff')
      .style('font-size', '13px')
      .style('font-weight', '600')
      .text('Average Deaths per Game');

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -45)
      .attr('text-anchor', 'middle')
      .style('fill', '#fff')
      .style('font-size', '13px')
      .style('font-weight', '600')
      .text('Average (Kills + Assists) per Game');

    // Create tooltip
    const tooltip = d3.select('body')
      .append('div')
      .attr('class', 'kda-scatter-tooltip')
      .style('position', 'absolute')
      .style('background', 'rgba(0, 0, 0, 0.9)')
      .style('color', '#fff')
      .style('padding', '12px 16px')
      .style('border-radius', '8px')
      .style('font-size', '13px')
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .style('z-index', 1000);

    // Add hover effects
    g.selectAll('.champion-circle')
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', sizeScale(d.games) * 1.3)
          .style('opacity', 1);

        tooltip
          .style('opacity', 1)
          .html(`
            <div style="text-align: center;">
              <strong style="font-size: 15px;">${d.name}</strong><br/>
              <div style="margin: 8px 0; padding: 8px 0; border-top: 1px solid #444; border-bottom: 1px solid #444;">
                <div style="color: #9B59B6;">KDA: ${d.kda.toFixed(2)}</div>
                <div style="font-size: 11px; color: #999;">
                  ${d.kills.toFixed(1)} / ${d.deaths.toFixed(1)} / ${d.assists.toFixed(1)}
                </div>
              </div>
              <div style="font-size: 12px;">
                Win Rate: <span style="color: ${colorScale(d.winRate)}">${d.winRate.toFixed(0)}%</span><br/>
                Games: ${d.games}
              </div>
            </div>
          `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px');
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', sizeScale(d.games))
          .style('opacity', 0.7);

        tooltip.style('opacity', 0);
      });

    // Cleanup
    return () => {
      tooltip.remove();
    };

  }, [champions]);

  return (
    <div className="kda-scatter">
      <h3 className="chart-title">Champion Performance Map</h3>
      <p className="chart-subtitle">Larger bubbles = more games played | Color shows win rate: Low (red) to High (green)</p>
      <svg ref={svgRef}></svg>
      <div className="scatter-legend">
        <div className="legend-note">
          <strong>Tip:</strong> Champions in the top-left are your most efficient (low deaths, high impact)
        </div>
      </div>
    </div>
  );
};

export default KDAScatter;

