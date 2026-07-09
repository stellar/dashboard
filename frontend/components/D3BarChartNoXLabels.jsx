import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import {
  getChartTheme,
  roundedTopRect,
  createTooltip,
  tooltipRow,
} from "./ui/chartUtils.js";

// Stacked two-series bar chart without x labels (txs/ops, successful/failed).
export default function D3BarChartNoXLabels({
  data,
  width = 400,
  height = 120,
  margin = { top: 10, right: 10, bottom: 8, left: 50 },
  tickFormat,
  yAxisMax = 450,
  yAxisStep = 50,
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
    const seriesColors = [theme.seriesA, theme.seriesB];
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous render

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const xValues = data[0].values.map((d) => d.x);

    const xScale = d3
      .scalePoint()
      .domain(xValues)
      .range([0, innerWidth])
      .padding(1.0);

    const yScale = d3
      .scaleLinear()
      .domain([0, yAxisMax])
      .range([innerHeight, 0]);

    const barWidth = 5;
    const segmentGap = 2; // surface gap between stacked segments

    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Recessive horizontal gridlines carry the scale; no axis spines.
    // Let D3 pick round tick values within the fixed domain.
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

    // Stack the two series (bottom = series 0, top = series 1).
    const stackedData = [];
    if (data.length === 2) {
      xValues.forEach((x, index) => {
        stackedData.push({
          x: x,
          bottom: data[0].values[index].y,
          top: data[1].values[index].y,
        });
      });

      const bars = g
        .selectAll(".bar-group")
        .data(stackedData)
        .enter()
        .append("g")
        .attr("class", "bar-group");

      // Bottom segment: flat unless it is the data end, rounded when alone.
      bars
        .append("path")
        .attr("d", (d) => {
          const x = xScale(d.x) - barWidth / 2;
          const yTop = yScale(d.bottom);
          const h = innerHeight - yTop;
          if (d.top > 0) {
            return h > 0
              ? `M${x},${yTop} H${x + barWidth} V${innerHeight} H${x} Z`
              : "";
          }
          return roundedTopRect(x, yTop, barWidth, h, 2);
        })
        .attr("fill", seriesColors[0]);

      // Top segment: rounded data end, separated by a surface gap.
      bars
        .append("path")
        .attr("d", (d) => {
          if (d.top <= 0) {
            return "";
          }
          const x = xScale(d.x) - barWidth / 2;
          const yTotal = yScale(d.bottom + d.top);
          const yBottom = yScale(d.bottom);
          const h = Math.max(yBottom - yTotal - segmentGap, 0.5);
          return roundedTopRect(x, yTotal, barWidth, h, 2);
        })
        .attr("fill", seriesColors[1]);
    } else {
      // Fallback for non-stacked charts.
      data.forEach((series, seriesIndex) => {
        g.selectAll(`.bar-${seriesIndex}`)
          .data(series.values)
          .enter()
          .append("path")
          .attr("class", `bar-${seriesIndex}`)
          .attr("d", (d) =>
            roundedTopRect(
              xScale(d.x) - barWidth / 2,
              yScale(d.y),
              barWidth,
              innerHeight - yScale(d.y),
              2,
            ),
          )
          .attr("fill", seriesColors[seriesIndex % seriesColors.length]);
      });
    }

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
    if (data.length === 2) {
      const step = Math.max(
        innerWidth / Math.max(xValues.length, 1),
        barWidth,
      );
      g.selectAll(".hit")
        .data(stackedData)
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
          const fmt = valueFormat || ((v) => v.toLocaleString("en-US"));
          tooltip.show(
            `<div style="opacity:.6;margin-bottom:4px;">${title}</div>` +
              tooltipRow(seriesColors[0], data[0].label, fmt(d.bottom)) +
              tooltipRow(seriesColors[1], data[1].label, fmt(d.top)),
            event.clientX,
            event.clientY,
          );
        })
        .on("mouseleave", () => tooltip.hide());
    }

    return () => tooltip.destroy();
  }, [
    data,
    width,
    height,
    margin,
    tickFormat,
    yAxisMax,
    yAxisStep,
    tooltipTitle,
    valueFormat,
    themeTick,
  ]);

  return (
    <svg
      ref={svgRef}
      style={{ display: "block" }}
      role="img"
      aria-label={
        data && data.length
          ? `${data.map((s) => s.label).join(" and ")} bar chart`
          : "chart"
      }
    ></svg>
  );
}
