import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

export default function D3BarChart({
  data,
  width = 400,
  height = 120,
  margin = { top: 10, right: 10, bottom: 30, left: 50 },
  colorScale,
  tickFormat,
}) {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous render

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Flatten all values from all series for domain calculation
    const allValues = data.flatMap((series) => series.values);
    const xValues = allValues.map((d) => d.x);
    const yValues = allValues.map((d) => d.y);

    // Create scales - use scalePoint for fixed spacing instead of scaleBand
    const xScale = d3
      .scalePoint()
      .domain(xValues)
      .range([0, innerWidth])
      .padding(1.0); // Double the gap - more space from Y-axis

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(yValues)])
      .range([innerHeight, 0]);

    // Fixed bar dimensions
    const fixedBarWidth = 5; // Fixed 5px bar width
    const fixedGapWidth = 3; // Fixed 3px gap between bars

    // Create color scale - match original react-d3-components colors
    const colors =
      colorScale ||
      d3
        .scaleOrdinal()
        .range([
          "#1f77b4",
          "#ff7f0e",
          "#2ca02c",
          "#d62728",
          "#9467bd",
          "#8c564b",
          "#e377c2",
          "#7f7f7f",
          "#bcbd22",
          "#17becf",
        ]);

    // Create main group
    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Calculate bar width - always use fixed width for all bars
    const barWidth = fixedBarWidth; // All bars are exactly 5px wide

    // Add bars for each series
    data.forEach((series, seriesIndex) => {
      g.selectAll(`.bar-${seriesIndex}`)
        .data(series.values)
        .enter()
        .append("rect")
        .attr("class", `bar-${seriesIndex}`)
        .attr("x", (d) => xScale(d.x) - fixedBarWidth / 2) // Center the bar on the scale point
        .attr("y", (d) => yScale(d.y))
        .attr("width", barWidth) // Always 5px wide
        .attr("height", (d) => innerHeight - yScale(d.y))
        .attr("fill", colors(seriesIndex))
        .style("shape-rendering", "crispEdges"); // Crisp edges like original
    });

    // Add x-axis with styling to match original
    const xAxis = d3.axisBottom(xScale).tickSize(6).tickPadding(3);

    const xAxisGroup = g
      .append("g")
      .attr("class", "axis")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(xAxis);

    // Style x-axis to match original
    xAxisGroup
      .selectAll("text")
      .style("font-size", "10px")
      .style("font-family", "sans-serif")
      .style("fill", "#000");

    xAxisGroup
      .selectAll("line")
      .style("stroke", "#000")
      .style("shape-rendering", "crispEdges");

    xAxisGroup
      .select(".domain")
      .style("stroke", "#000")
      .style("shape-rendering", "crispEdges");

    // Add y-axis with styling to match original
    const yAxis = d3
      .axisLeft(yScale)
      .tickSize(6)
      .tickPadding(3)
      .ticks(Math.min(7, Math.floor(d3.max(yValues)))) // Limit to max 7 ticks or the max value, whichever is smaller
      .tickValues(
        d3.range(0, Math.ceil(d3.max(yValues)) + 1).filter((d) => d % 1 === 0),
      ); // Only integer values

    if (tickFormat) {
      yAxis.tickFormat(tickFormat);
    } else {
      yAxis.tickFormat(d3.format("d")); // Format as integers (1, 2, 3) instead of decimals (1.0, 2.0)
    }

    const yAxisGroup = g.append("g").attr("class", "axis").call(yAxis);

    // Style y-axis to match original
    yAxisGroup
      .selectAll("text")
      .style("font-size", "10px")
      .style("font-family", "sans-serif")
      .style("fill", "#000");

    yAxisGroup
      .selectAll("line")
      .style("stroke", "#000")
      .style("shape-rendering", "crispEdges");

    yAxisGroup
      .select(".domain")
      .style("stroke", "#000")
      .style("shape-rendering", "crispEdges");
  }, [data, width, height, margin, colorScale, tickFormat]);

  return <svg ref={svgRef} style={{ display: "block" }}></svg>;
}
