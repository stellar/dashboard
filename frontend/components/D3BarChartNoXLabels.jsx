import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

export default function D3BarChartNoXLabels({
  data,
  width = 400,
  height = 120,
  margin = { top: 10, right: 10, bottom: 8, left: 50 }, // Reduced bottom margin since no X labels
  colorScale,
  tickFormat,
  yAxisMax = 450, // Maximum Y value
  yAxisStep = 50, // Y axis increment step
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
      .domain([0, yAxisMax]) // Use fixed max instead of data max
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

    // Add bars for each series - create stacked bars
    // First, we need to calculate the cumulative values for stacking
    const stackedData = [];

    // Assume we have exactly 2 series for stacking
    if (data.length === 2) {
      const xValues = data[0].values.map((d) => d.x);

      xValues.forEach((x, index) => {
        const bottomValue = data[0].values[index].y; // First series (bottom)
        const topValue = data[1].values[index].y; // Second series (top)

        stackedData.push({
          x: x,
          bottom: bottomValue,
          top: topValue,
          bottomHeight: bottomValue,
          topHeight: topValue,
          totalHeight: bottomValue + topValue,
        });
      });

      // Draw bottom bars (first series)
      g.selectAll(".bar-bottom")
        .data(stackedData)
        .enter()
        .append("rect")
        .attr("class", "bar-bottom")
        .attr("x", (d) => xScale(d.x) - fixedBarWidth / 2)
        .attr("y", (d) => yScale(d.bottomHeight))
        .attr("width", barWidth)
        .attr("height", (d) => innerHeight - yScale(d.bottomHeight))
        .attr("fill", colors(0))
        .style("shape-rendering", "crispEdges");

      // Draw top bars (second series) - stacked on top of bottom bars
      g.selectAll(".bar-top")
        .data(stackedData)
        .enter()
        .append("rect")
        .attr("class", "bar-top")
        .attr("x", (d) => xScale(d.x) - fixedBarWidth / 2)
        .attr("y", (d) => yScale(d.totalHeight))
        .attr("width", barWidth)
        .attr("height", (d) => yScale(d.bottomHeight) - yScale(d.totalHeight))
        .attr("fill", colors(1))
        .style("shape-rendering", "crispEdges");
    } else {
      // Fallback to original behavior for non-stacked charts
      data.forEach((series, seriesIndex) => {
        g.selectAll(`.bar-${seriesIndex}`)
          .data(series.values)
          .enter()
          .append("rect")
          .attr("class", `bar-${seriesIndex}`)
          .attr("x", (d) => xScale(d.x) - fixedBarWidth / 2)
          .attr("y", (d) => yScale(d.y))
          .attr("width", barWidth)
          .attr("height", (d) => innerHeight - yScale(d.y))
          .attr("fill", colors(seriesIndex))
          .style("shape-rendering", "crispEdges");
      });
    }

    // Add x-axis with NO labels
    const xAxis = d3
      .axisBottom(xScale)
      .tickSize(6)
      .tickPadding(3)
      .tickFormat(""); // No labels

    const xAxisGroup = g
      .append("g")
      .attr("class", "axis")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(xAxis);

    // Style x-axis lines only (no text)
    xAxisGroup
      .selectAll("line")
      .style("stroke", "#000")
      .style("shape-rendering", "crispEdges");

    xAxisGroup
      .select(".domain")
      .style("stroke", "#000")
      .style("shape-rendering", "crispEdges");

    // Add y-axis with custom ticks
    const yAxisTicks = d3.range(0, yAxisMax + yAxisStep, yAxisStep); // [0, 50, 100, 150, ..., yAxisMax]

    const yAxis = d3
      .axisLeft(yScale)
      .tickSize(6)
      .tickPadding(3)
      .tickValues(yAxisTicks);

    if (tickFormat) {
      yAxis.tickFormat(tickFormat);
    } else {
      yAxis.tickFormat(d3.format("d")); // Format as integers
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
  }, [
    data,
    width,
    height,
    margin,
    colorScale,
    tickFormat,
    yAxisMax,
    yAxisStep,
  ]);

  return <svg ref={svgRef} style={{ display: "block" }}></svg>;
}
