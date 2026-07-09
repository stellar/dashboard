import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import {
  getChartTheme,
  roundedTopRect,
  createTooltip,
  tooltipRow,
} from "./ui/chartUtils.js";

// Single-series bar chart (used for ledger close times).
export default function D3BarChart({
  data,
  width = 400,
  height = 120,
  margin = { top: 10, right: 10, bottom: 8, left: 50 },
  tickFormat,
  tooltipTitle,
  valueFormat,
}) {
  const svgRef = useRef();
  // Charts re-render when the theme changes so D3 picks up the new palette.
  const [themeTick, setThemeTick] = useState(0);

  useEffect(() => {
    const onThemeChange = () => setThemeTick((t) => t + 1);
    window.addEventListener("themechange", onThemeChange);
    return () => window.removeEventListener("themechange", onThemeChange);
  }, []);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const theme = getChartTheme(svgRef.current);
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous render

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const values = data[0].values;
    const xValues = values.map((d) => d.x);
    const yValues = values.map((d) => d.y);

    const xScale = d3
      .scalePoint()
      .domain(xValues)
      .range([0, innerWidth])
      .padding(1.0);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(yValues)])
      .range([innerHeight, 0]);

    const barWidth = 5;

    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Recessive horizontal gridlines carry the scale; no axis spines.
    const yTickValues = yScale.ticks(4);
    g.append("g")
      .attr("class", "chart-grid")
      .selectAll("line")
      .data(yTickValues)
      .enter()
      .append("line")
      .attr("x1", 0)
      .attr("x2", innerWidth)
      .attr("y1", (d) => yScale(d))
      .attr("y2", (d) => yScale(d))
      .style("stroke", theme.grid);

    // Bars: thin marks with rounded data-ends anchored to the baseline.
    g.selectAll(".bar")
      .data(values)
      .enter()
      .append("path")
      .attr("class", "bar")
      .attr("d", (d) =>
        roundedTopRect(
          xScale(d.x) - barWidth / 2,
          yScale(d.y),
          barWidth,
          innerHeight - yScale(d.y),
          2,
        ),
      )
      .attr("fill", theme.primary);

    // Y axis: text only.
    const yAxis = d3
      .axisLeft(yScale)
      .tickSize(0)
      .tickPadding(8)
      .tickValues(yTickValues)
      .tickFormat(tickFormat || d3.format("d"));

    const yAxisGroup = g.append("g").attr("class", "axis").call(yAxis);
    yAxisGroup.select(".domain").remove();
    yAxisGroup.selectAll("text").style("fill", theme.axisText);

    // Hover layer: full-height hit targets, one per bar.
    const tooltip = createTooltip();
    const step = Math.max(innerWidth / Math.max(xValues.length, 1), barWidth);
    g.selectAll(".hit")
      .data(values)
      .enter()
      .append("rect")
      .attr("class", "hit")
      .attr("x", (d) => xScale(d.x) - step / 2)
      .attr("y", 0)
      .attr("width", step)
      .attr("height", innerHeight)
      .attr("fill", "transparent")
      .on("mousemove", (event, d) => {
        const title = tooltipTitle ? tooltipTitle(d.x) : d.x;
        const value = valueFormat ? valueFormat(d.y) : d.y;
        tooltip.show(
          `<div style="opacity:.6;margin-bottom:4px;">${title}</div>` +
            tooltipRow(theme.primary, data[0].label, value),
          event.clientX,
          event.clientY,
        );
      })
      .on("mouseleave", () => tooltip.hide());

    return () => tooltip.destroy();
  }, [
    data,
    width,
    height,
    margin,
    tickFormat,
    tooltipTitle,
    valueFormat,
    themeTick,
  ]);

  return <svg ref={svgRef} style={{ display: "block" }}></svg>;
}
