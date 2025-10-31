import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import './ObjectiveParticipation.css';

const ObjectiveParticipation = ({ stats, player }) => {
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

    // Dragon benchmarks by role and rank (based on objective priority + macro improvement)
    const DRAGON_BENCHMARKS = {
      JUNGLE: {
        IRON: 0.9, BRONZE: 0.95, SILVER: 1.0, GOLD: 1.1,
        PLATINUM: 1.2, EMERALD: 1.3, DIAMOND: 1.35, 'MASTER+': 1.45
      },
      SUPPORT: {
        IRON: 0.75, BRONZE: 0.80, SILVER: 0.85, GOLD: 0.95,
        PLATINUM: 1.05, EMERALD: 1.15, DIAMOND: 1.2, 'MASTER+': 1.3
      },
      MIDDLE: {
        IRON: 0.65, BRONZE: 0.70, SILVER: 0.75, GOLD: 0.85,
        PLATINUM: 0.95, EMERALD: 1.0, DIAMOND: 1.05, 'MASTER+': 1.15
      },
      BOTTOM: {
        IRON: 0.60, BRONZE: 0.65, SILVER: 0.70, GOLD: 0.80,
        PLATINUM: 0.90, EMERALD: 0.95, DIAMOND: 1.0, 'MASTER+': 1.1
      },
      TOP: {
        IRON: 0.50, BRONZE: 0.55, SILVER: 0.60, GOLD: 0.70,
        PLATINUM: 0.80, EMERALD: 0.85, DIAMOND: 0.90, 'MASTER+': 1.0
      }
    };

    // Baron benchmarks by role and rank
    const BARON_BENCHMARKS = {
      JUNGLE: {
        IRON: 0.12, BRONZE: 0.14, SILVER: 0.16, GOLD: 0.20,
        PLATINUM: 0.24, EMERALD: 0.28, DIAMOND: 0.32, 'MASTER+': 0.38
      },
      SUPPORT: {
        IRON: 0.10, BRONZE: 0.12, SILVER: 0.14, GOLD: 0.18,
        PLATINUM: 0.22, EMERALD: 0.26, DIAMOND: 0.30, 'MASTER+': 0.35
      },
      MIDDLE: {
        IRON: 0.08, BRONZE: 0.10, SILVER: 0.12, GOLD: 0.16,
        PLATINUM: 0.20, EMERALD: 0.24, DIAMOND: 0.28, 'MASTER+': 0.33
      },
      BOTTOM: {
        IRON: 0.07, BRONZE: 0.09, SILVER: 0.11, GOLD: 0.15,
        PLATINUM: 0.19, EMERALD: 0.23, DIAMOND: 0.27, 'MASTER+': 0.32
      },
      TOP: {
        IRON: 0.06, BRONZE: 0.08, SILVER: 0.10, GOLD: 0.14,
        PLATINUM: 0.18, EMERALD: 0.22, DIAMOND: 0.26, 'MASTER+': 0.30
      }
    };

    // Turret benchmarks by role and rank
    const TURRET_BENCHMARKS = {
      TOP: {
        IRON: 2.0, BRONZE: 2.1, SILVER: 2.2, GOLD: 2.4,
        PLATINUM: 2.6, EMERALD: 2.7, DIAMOND: 2.8, 'MASTER+': 3.0
      },
      BOTTOM: {
        IRON: 2.0, BRONZE: 2.1, SILVER: 2.2, GOLD: 2.3,
        PLATINUM: 2.5, EMERALD: 2.6, DIAMOND: 2.7, 'MASTER+': 2.9
      },
      MIDDLE: {
        IRON: 1.8, BRONZE: 1.9, SILVER: 2.0, GOLD: 2.2,
        PLATINUM: 2.4, EMERALD: 2.5, DIAMOND: 2.6, 'MASTER+': 2.8
      },
      SUPPORT: {
        IRON: 1.6, BRONZE: 1.7, SILVER: 1.8, GOLD: 2.0,
        PLATINUM: 2.2, EMERALD: 2.3, DIAMOND: 2.4, 'MASTER+': 2.6
      },
      JUNGLE: {
        IRON: 1.5, BRONZE: 1.6, SILVER: 1.7, GOLD: 1.9,
        PLATINUM: 2.1, EMERALD: 2.2, DIAMOND: 2.3, 'MASTER+': 2.5
      }
    };

    // Get rank-aware benchmarks
    const benchmark = {
      dragons: DRAGON_BENCHMARKS[primaryRole]?.[rankTier] || 0.8,
      barons: BARON_BENCHMARKS[primaryRole]?.[rankTier] || 0.15,
      turrets: TURRET_BENCHMARKS[primaryRole]?.[rankTier] || 2.2
    };

    // Prepare data
    const data = [
      {
        objective: 'Dragons',
        player: stats.avg_dragons || 0,
        benchmark: benchmark.dragons,
        icon: '🐉'
      },
      {
        objective: 'Barons',
        player: stats.avg_barons || 0,
        benchmark: benchmark.barons,
        icon: '👹'
      },
      {
        objective: 'Turrets',
        player: stats.avg_turrets || 0,
        benchmark: benchmark.turrets,
        icon: '🗼'
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
      .style('fill', '#9B59B6')
      .style('opacity', 0.9)
      .style('filter', 'drop-shadow(0 0 6px #9B59B6)')
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
      .style('fill', '#C89B3C')
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
      .style('fill', '#C89B3C')
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

      // Label
      xAxis.append('text')
        .attr('x', xPos)
        .attr('y', 25)
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

  }, [stats, player]);

  return (
    <div className="objective-participation">
      <h3 className="chart-title">Objective Participation</h3>
      <p className="chart-subtitle">
        Compared to {player?.rank?.tier || 'SILVER'} {stats.primary_role || 'role'} benchmarks
      </p>
      <div className="chart-legend">
        <div className="legend-item">
          <span className="legend-box player"></span>
          <span>Your Performance</span>
        </div>
        <div className="legend-item">
          <span className="legend-box benchmark"></span>
          <span>Rank Benchmark</span>
        </div>
      </div>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default ObjectiveParticipation;

