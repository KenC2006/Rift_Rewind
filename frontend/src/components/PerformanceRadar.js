import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import './PerformanceRadar.css';

const PerformanceRadar = ({ stats, player }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!stats) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    // Get player's rank tier
    const getRankTier = () => {
      if (!player || !player.rank) return 'SILVER';
      const tier = player.rank.tier;
      if (['MASTER', 'GRANDMASTER', 'CHALLENGER'].includes(tier)) return 'MASTER+';
      return tier;
    };

    const rankTier = getRankTier();
    const primaryRole = stats.primary_role || 'MIDDLE';

    // CS/min benchmarks by role and elo (matching backend.py)
    const CS_BENCHMARKS = {
      MIDDLE: {
        IRON: 4.0, BRONZE: 4.5, SILVER: 5.0, GOLD: 5.5,
        PLATINUM: 6.0, EMERALD: 6.5, DIAMOND: 7.0, 'MASTER+': 7.5
      },
      TOP: {
        IRON: 3.8, BRONZE: 4.2, SILVER: 4.7, GOLD: 5.2,
        PLATINUM: 5.7, EMERALD: 6.2, DIAMOND: 6.7, 'MASTER+': 7.2
      },
      JUNGLE: {
        IRON: 3.0, BRONZE: 3.5, SILVER: 4.0, GOLD: 4.5,
        PLATINUM: 5.0, EMERALD: 5.5, DIAMOND: 6.0, 'MASTER+': 6.5
      },
      BOTTOM: {
        IRON: 4.5, BRONZE: 5.0, SILVER: 5.5, GOLD: 6.0,
        PLATINUM: 6.5, EMERALD: 7.0, DIAMOND: 7.5, 'MASTER+': 8.0
      },
      SUPPORT: {
        IRON: 1.0, BRONZE: 1.2, SILVER: 1.5, GOLD: 1.8,
        PLATINUM: 2.0, EMERALD: 2.3, DIAMOND: 2.5, 'MASTER+': 3.0
      }
    };

    // Vision score benchmarks by role and elo (matching backend.py)
    const VISION_BENCHMARKS = {
      MIDDLE: {
        IRON: 15, BRONZE: 18, SILVER: 22, GOLD: 26,
        PLATINUM: 30, EMERALD: 34, DIAMOND: 38, 'MASTER+': 42
      },
      TOP: {
        IRON: 12, BRONZE: 15, SILVER: 18, GOLD: 22,
        PLATINUM: 26, EMERALD: 30, DIAMOND: 34, 'MASTER+': 38
      },
      JUNGLE: {
        IRON: 20, BRONZE: 24, SILVER: 28, GOLD: 32,
        PLATINUM: 36, EMERALD: 40, DIAMOND: 44, 'MASTER+': 48
      },
      BOTTOM: {
        IRON: 10, BRONZE: 13, SILVER: 16, GOLD: 19,
        PLATINUM: 22, EMERALD: 25, DIAMOND: 28, 'MASTER+': 32
      },
      SUPPORT: {
        IRON: 45, BRONZE: 55, SILVER: 65, GOLD: 75,
        PLATINUM: 85, EMERALD: 95, DIAMOND: 105, 'MASTER+': 115
      }
    };

    // KDA benchmarks by elo (matching backend.py)
    const KDA_BENCHMARKS = {
      IRON: 1.8, BRONZE: 2.0, SILVER: 2.3, GOLD: 2.6,
      PLATINUM: 2.9, EMERALD: 3.2, DIAMOND: 3.5, 'MASTER+': 4.0
    };

    // Kill participation benchmarks by role and rank (from LeagueMath data)
    const KILL_PARTICIPATION_BENCHMARKS = {
      TOP: {
        IRON: 42, BRONZE: 43, SILVER: 44, GOLD: 45,
        PLATINUM: 46, EMERALD: 46, DIAMOND: 46, 'MASTER+': 47
      },
      JUNGLE: {
        IRON: 48, BRONZE: 48, SILVER: 51, GOLD: 53,
        PLATINUM: 54, EMERALD: 54, DIAMOND: 55, 'MASTER+': 56
      },
      MIDDLE: {
        IRON: 49, BRONZE: 49, SILVER: 51, GOLD: 52,
        PLATINUM: 53, EMERALD: 53, DIAMOND: 53, 'MASTER+': 53
      },
      BOTTOM: {
        IRON: 49, BRONZE: 50, SILVER: 51, GOLD: 53,
        PLATINUM: 53, EMERALD: 53, DIAMOND: 53, 'MASTER+': 53
      },
      SUPPORT: {
        IRON: 50, BRONZE: 50, SILVER: 52, GOLD: 54,
        PLATINUM: 55, EMERALD: 56, DIAMOND: 56, 'MASTER+': 58
      }
    };

    // Objective participation benchmarks by rank (dragons + barons per game)
    // Based on macro improvement at higher ranks
    const OBJECTIVE_PARTICIPATION_BENCHMARKS = {
      IRON: 0.45, BRONZE: 0.50, SILVER: 0.55, GOLD: 0.60,
      PLATINUM: 0.65, EMERALD: 0.68, DIAMOND: 0.72, 'MASTER+': 0.78
    };

    // Get rank-aware benchmarks
    const benchmark = {
      csPerMin: CS_BENCHMARKS[primaryRole]?.[rankTier] || 5.5,
      kda: KDA_BENCHMARKS[rankTier] || 2.5,
      vision: VISION_BENCHMARKS[primaryRole]?.[rankTier] || 1.0, // Per-game vision score
      objParticipation: OBJECTIVE_PARTICIPATION_BENCHMARKS[rankTier] || 0.6,
      killParticipation: (KILL_PARTICIPATION_BENCHMARKS[primaryRole]?.[rankTier] || 50) / 100
    };

    // Calculate normalized scores (0-100 scale)
    const playerData = [
      { 
        axis: 'CS/min', 
        value: Math.min((stats.cs_per_min / benchmark.csPerMin) * 100, 150),
        raw: stats.cs_per_min?.toFixed(1) 
      },
      { 
        axis: 'Objectives', 
        value: Math.min(((stats.avg_dragons + stats.avg_barons) / (benchmark.objParticipation * 2)) * 100, 150),
        raw: ((stats.avg_dragons + stats.avg_barons) / 2).toFixed(2) 
      },
      { 
        axis: 'Kill Participation', 
        value: Math.min((stats.avg_kill_participation / 100) / benchmark.killParticipation * 100, 150),
        raw: stats.avg_kill_participation?.toFixed(1) + '%' 
      },
      { 
        axis: 'Vision Score', 
        value: Math.min((stats.avg_vision_score / benchmark.vision) * 100, 150),
        raw: stats.avg_vision_score?.toFixed(1) 
      },
      { 
        axis: 'KDA', 
        value: Math.min((stats.kda_ratio / benchmark.kda) * 100, 150),
        raw: stats.kda_ratio?.toFixed(2) 
      }
    ];

    const benchmarkData = [
      { axis: 'CS/min', value: 100, raw: benchmark.csPerMin.toFixed(1) },
      { axis: 'Objectives', value: 100, raw: benchmark.objParticipation.toFixed(2) },
      { axis: 'Kill Participation', value: 100, raw: (benchmark.killParticipation * 100).toFixed(1) + '%' },
      { axis: 'Vision Score', value: 100, raw: benchmark.vision.toFixed(1) },
      { axis: 'KDA', value: 100, raw: benchmark.kda.toFixed(2) }
    ];

    // Chart configuration - Increased size for better readability
    const width = 550;
    const height = 550;
    const margin = { top: 80, right: 80, bottom: 80, left: 80 };
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

  }, [stats, player]);

  return (
    <div className="performance-radar">
      <h3 className="chart-title">Performance Radar</h3>
      <p className="chart-subtitle">
        Compared to {player?.rank?.tier || 'SILVER'} {stats.primary_role || 'role'} benchmarks
      </p>
      <div className="chart-legend">
        <div className="legend-item">
          <span className="legend-color" style={{ background: '#9B59B6' }}></span>
          <span>Your Performance</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ background: '#C89B3C' }}></span>
          <span>Rank Benchmark</span>
        </div>
      </div>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default PerformanceRadar;

