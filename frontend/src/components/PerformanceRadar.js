import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import './PerformanceRadar.css';

const PerformanceRadar = ({ stats }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!stats) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    // Benchmarks based on role (these are approximate benchmarks)
    const roleBenchmarks = {
      MIDDLE: { csPerMin: 7.5, kda: 3.0, vision: 18, objParticipation: 0.7, killParticipation: 0.65 },
      TOP: { csPerMin: 7.0, kda: 2.8, vision: 15, objParticipation: 0.65, killParticipation: 0.60 },
      JUNGLE: { csPerMin: 5.5, kda: 3.2, vision: 20, objParticipation: 0.80, killParticipation: 0.70 },
      BOTTOM: { csPerMin: 8.0, kda: 3.5, vision: 16, objParticipation: 0.60, killParticipation: 0.65 },
      SUPPORT: { csPerMin: 2.0, kda: 3.0, vision: 25, objParticipation: 0.65, killParticipation: 0.68 }
    };

    // Calculate average benchmarks across all roles
    const roles = Object.values(roleBenchmarks);
    const benchmark = {
      csPerMin: roles.reduce((sum, r) => sum + r.csPerMin, 0) / roles.length,
      kda: roles.reduce((sum, r) => sum + r.kda, 0) / roles.length,
      vision: roles.reduce((sum, r) => sum + r.vision, 0) / roles.length,
      objParticipation: roles.reduce((sum, r) => sum + r.objParticipation, 0) / roles.length,
      killParticipation: roles.reduce((sum, r) => sum + r.killParticipation, 0) / roles.length
    };

    // Calculate normalized scores (0-100 scale)
    const playerData = [
      { 
        axis: 'CS/min', 
        value: Math.min((stats.cs_per_min / benchmark.csPerMin) * 100, 150),
        raw: stats.cs_per_min?.toFixed(1) 
      },
      { 
        axis: 'KDA', 
        value: Math.min((stats.kda_ratio / benchmark.kda) * 100, 150),
        raw: stats.kda_ratio?.toFixed(2) 
      },
      { 
        axis: 'Vision', 
        value: Math.min((stats.avg_vision_score / benchmark.vision) * 100, 150),
        raw: stats.avg_vision_score?.toFixed(1) 
      },
      { 
        axis: 'Objectives', 
        value: Math.min(((stats.avg_dragons + stats.avg_barons) / (benchmark.objParticipation * 2)) * 100, 150),
        raw: ((stats.avg_dragons + stats.avg_barons) / 2).toFixed(2) 
      },
      { 
        axis: 'Kill Part.', 
        value: Math.min((stats.avg_kill_participation / 100) / benchmark.killParticipation * 100, 150),
        raw: stats.avg_kill_participation?.toFixed(1) + '%' 
      }
    ];

    const benchmarkData = [
      { axis: 'CS/min', value: 100, raw: benchmark.csPerMin.toFixed(1) },
      { axis: 'KDA', value: 100, raw: benchmark.kda.toFixed(2) },
      { axis: 'Vision', value: 100, raw: benchmark.vision.toFixed(1) },
      { axis: 'Objectives', value: 100, raw: benchmark.objParticipation.toFixed(2) },
      { axis: 'Kill Part.', value: 100, raw: (benchmark.killParticipation * 100).toFixed(1) + '%' }
    ];

    // Chart configuration
    const width = 400;
    const height = 400;
    const margin = { top: 60, right: 60, bottom: 60, left: 60 };
    const radius = Math.min(width - margin.left - margin.right, height - margin.top - margin.bottom) / 2;
    const levels = 5;
    const maxValue = 150;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    // Scales
    const angleSlice = (Math.PI * 2) / playerData.length;
    const rScale = d3.scaleLinear()
      .domain([0, maxValue])
      .range([0, radius]);

    // Draw circular grid
    for (let i = 1; i <= levels; i++) {
      const levelRadius = (radius / levels) * i;
      
      g.append('circle')
        .attr('r', levelRadius)
        .attr('class', 'grid-circle')
        .style('fill', 'none')
        .style('stroke', '#444')
        .style('stroke-width', '1px')
        .style('opacity', 0.3);

      if (i === levels) {
        g.append('text')
          .attr('x', 5)
          .attr('y', -levelRadius)
          .attr('class', 'grid-label')
          .style('font-size', '10px')
          .style('fill', '#999')
          .text(`${(maxValue / levels) * i}%`);
      }
    }

    // Draw axes
    const axes = g.selectAll('.axis')
      .data(playerData)
      .enter()
      .append('g')
      .attr('class', 'axis');

    axes.append('line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', (d, i) => rScale(maxValue) * Math.cos(angleSlice * i - Math.PI / 2))
      .attr('y2', (d, i) => rScale(maxValue) * Math.sin(angleSlice * i - Math.PI / 2))
      .style('stroke', '#666')
      .style('stroke-width', '2px');

    // Add axis labels
    axes.append('text')
      .attr('class', 'axis-label')
      .attr('text-anchor', 'middle')
      .attr('x', (d, i) => (rScale(maxValue) + 30) * Math.cos(angleSlice * i - Math.PI / 2))
      .attr('y', (d, i) => (rScale(maxValue) + 30) * Math.sin(angleSlice * i - Math.PI / 2))
      .style('font-size', '14px')
      .style('font-weight', '600')
      .style('fill', '#fff')
      .text(d => d.axis);

    // Draw benchmark area (reference)
    const benchmarkRadarLine = d3.lineRadial()
      .curve(d3.curveLinearClosed)
      .radius(d => rScale(d.value))
      .angle((d, i) => i * angleSlice);

    g.append('path')
      .datum(benchmarkData)
      .attr('d', benchmarkRadarLine)
      .attr('class', 'radar-area-benchmark')
      .style('fill', '#C89B3C')
      .style('fill-opacity', 0.2)
      .style('stroke', '#C89B3C')
      .style('stroke-width', '2px');

    // Draw player performance area
    const radarLine = d3.lineRadial()
      .curve(d3.curveLinearClosed)
      .radius(d => rScale(d.value))
      .angle((d, i) => i * angleSlice);

    const playerPath = g.append('path')
      .datum(playerData)
      .attr('d', radarLine)
      .attr('class', 'radar-area-player')
      .style('fill', '#9B59B6')
      .style('fill-opacity', 0.3)
      .style('stroke', '#9B59B6')
      .style('stroke-width', '3px')
      .style('filter', 'drop-shadow(0 0 8px #9B59B6)');

    // Animate the player path
    const totalLength = playerPath.node().getTotalLength();
    playerPath
      .attr('stroke-dasharray', totalLength + ' ' + totalLength)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .duration(1500)
      .ease(d3.easeQuadInOut)
      .attr('stroke-dashoffset', 0);

    // Add dots for player values
    const dots = g.selectAll('.radar-dot')
      .data(playerData)
      .enter()
      .append('circle')
      .attr('class', 'radar-dot')
      .attr('cx', (d, i) => rScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2))
      .attr('cy', (d, i) => rScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2))
      .attr('r', 0)
      .style('fill', '#9B59B6')
      .style('stroke', '#fff')
      .style('stroke-width', '2px')
      .style('filter', 'drop-shadow(0 0 4px #9B59B6)')
      .transition()
      .delay((d, i) => i * 100 + 1000)
      .duration(300)
      .attr('r', 5);

    // Add tooltip
    const tooltip = d3.select('body')
      .append('div')
      .attr('class', 'radar-tooltip')
      .style('position', 'absolute')
      .style('background', 'rgba(0, 0, 0, 0.9)')
      .style('color', '#fff')
      .style('padding', '8px 12px')
      .style('border-radius', '6px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .style('z-index', 1000);

    // Add benchmark dots (for showing benchmark values)
    const benchmarkDots = g.selectAll('.benchmark-dot')
      .data(benchmarkData)
      .enter()
      .append('circle')
      .attr('class', 'benchmark-dot')
      .attr('cx', (d, i) => rScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2))
      .attr('cy', (d, i) => rScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2))
      .attr('r', 0)
      .style('fill', '#C89B3C')
      .style('stroke', '#fff')
      .style('stroke-width', '2px')
      .style('filter', 'drop-shadow(0 0 4px #C89B3C)')
      .style('cursor', 'pointer')
      .transition()
      .delay((d, i) => i * 100 + 1200)
      .duration(300)
      .attr('r', 4);

    g.selectAll('.radar-dot')
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 8);

        const benchmarkValue = benchmarkData.find(b => b.axis === d.axis);
        tooltip
          .style('opacity', 1)
          .html(`
            <strong>${d.axis}</strong><br/>
            <span style="color: #9B59B6;">Your Value: ${d.raw}</span><br/>
            <span style="color: #C89B3C;">Avg Benchmark: ${benchmarkValue.raw}</span>
          `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 5);

        tooltip.style('opacity', 0);
      });

    g.selectAll('.benchmark-dot')
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 6);

        tooltip
          .style('opacity', 1)
          .html(`<strong>${d.axis}</strong><br/><span style="color: #C89B3C;">Avg Benchmark: ${d.raw}</span>`)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 4);

        tooltip.style('opacity', 0);
      });

    // Cleanup
    return () => {
      tooltip.remove();
    };

  }, [stats]);

  return (
    <div className="performance-radar">
      <h3 className="chart-title">Performance Radar</h3>
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

export default PerformanceRadar;

