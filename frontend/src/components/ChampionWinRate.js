import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import './ChampionWinRate.css';

const ChampionWinRate = ({ champions }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!champions) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    // Prepare data: top 10 champions by games played, sorted by win rate
    const championsArray = Object.entries(champions)
      .map(([name, data]) => ({
        name,
        games: data.games,
        wins: data.wins,
        winRate: data.games > 0 ? (data.wins / data.games) * 100 : 0
      }))
      .sort((a, b) => b.games - a.games)
      .slice(0, 10)
      .sort((a, b) => b.winRate - a.winRate);

    // Chart dimensions
    const margin = { top: 20, right: 100, bottom: 40, left: 120 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
    const barAreaWidth = width - 70; // Reserve 70px padding for labels on right

    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Scales
    const xScale = d3.scaleLinear()
      .domain([0, 100])
      .range([0, barAreaWidth]);

    const yScale = d3.scaleBand()
      .domain(championsArray.map(d => d.name))
      .range([0, height])
      .padding(0.2);

    // Color scale
    const colorScale = (winRate) => {
      if (winRate >= 55) return '#00c853'; // Green
      if (winRate >= 45) return '#ffc107'; // Yellow
      return '#ff5252'; // Red
    };

    // Draw background grid
    const gridLines = g.append('g')
      .attr('class', 'grid');

    gridLines.selectAll('line')
      .data([0, 25, 50, 75, 100])
      .enter()
      .append('line')
      .attr('x1', d => xScale(d))
      .attr('x2', d => xScale(d))
      .attr('y1', 0)
      .attr('y2', height)
      .style('stroke', '#333')
      .style('stroke-width', d => d === 50 ? '2px' : '1px')
      .style('stroke-dasharray', d => d === 50 ? '0' : '3,3')
      .style('opacity', 0.3);

    // Add 50% benchmark label
    g.append('text')
      .attr('x', xScale(50))
      .attr('y', -5)
      .attr('text-anchor', 'middle')
      .style('fill', '#999')
      .style('font-size', '11px')
      .text('50% Benchmark');

    // Draw bars
    const bars = g.selectAll('.bar')
      .data(championsArray)
      .enter()
      .append('g')
      .attr('class', 'bar-group');

    // Background bar
    bars.append('rect')
      .attr('class', 'bar-background')
      .attr('x', 0)
      .attr('y', d => yScale(d.name))
      .attr('width', width)
      .attr('height', yScale.bandwidth())
      .style('fill', '#1a1a2e')
      .style('opacity', 0.5);

    // Actual bar
    bars.append('rect')
      .attr('class', 'bar')
      .attr('x', 0)
      .attr('y', d => yScale(d.name))
      .attr('width', 0) // Start with 0 for animation
      .attr('height', yScale.bandwidth())
      .style('fill', d => colorScale(d.winRate))
      .style('opacity', 0.8)
      .style('filter', d => `drop-shadow(0 0 6px ${colorScale(d.winRate)})`)
      .transition()
      .duration(1000)
      .delay((d, i) => i * 80)
      .attr('width', d => xScale(d.winRate));

    // Champion labels (left)
    bars.append('text')
      .attr('class', 'champion-label')
      .attr('x', -10)
      .attr('y', d => yScale(d.name) + yScale.bandwidth() / 2)
      .attr('text-anchor', 'end')
      .attr('dominant-baseline', 'middle')
      .style('fill', '#fff')
      .style('font-size', '13px')
      .style('font-weight', '600')
      .text(d => d.name);

    // Win rate labels (on bar)
    bars.append('text')
      .attr('class', 'winrate-label')
      .attr('x', d => xScale(d.winRate) + 8)
      .attr('y', d => yScale(d.name) + yScale.bandwidth() / 2)
      .attr('dominant-baseline', 'middle')
      .style('fill', '#fff')
      .style('font-size', '13px')
      .style('font-weight', '700')
      .style('opacity', 0)
      .text(d => `${d.winRate.toFixed(1)}%`)
      .transition()
      .duration(1000)
      .delay((d, i) => i * 80 + 500)
      .style('opacity', 1);

    // Games played labels (right)
    bars.append('text')
      .attr('class', 'games-label')
      .attr('x', barAreaWidth + 75)
      .attr('y', d => yScale(d.name) + yScale.bandwidth() / 2)
      .attr('dominant-baseline', 'middle')
      .style('fill', '#999')
      .style('font-size', '11px')
      .text(d => `${d.games} games`);

    // X axis
    const xAxis = d3.axisBottom(xScale)
      .tickValues([0, 25, 50, 75, 100])
      .tickFormat(d => d + '%');

    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${height})`)
      .call(xAxis)
      .style('color', '#999')
      .style('font-size', '11px');

    // Add hover effects
    bars.selectAll('.bar')
      .on('mouseover', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .style('opacity', 1);
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .style('opacity', 0.8);
      });

  }, [champions]);

  return (
    <div className="champion-winrate">
      <h3 className="chart-title">Champion Win Rates</h3>
      <p className="chart-subtitle">Top 10 Most Played Champions</p>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default ChampionWinRate;

