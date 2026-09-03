// Shared helpers for the D3 charts: resolve the token palette at render time
// (CSS custom properties can't be read by D3 directly) and build tooltip DOM.

export function getChartTheme(element) {
  // Resolve from the chart's own node so scoped overrides (e.g. the May 4
  // force theme on #main.force) cascade into the palette.
  const styles = getComputedStyle(element || document.documentElement);
  const read = (name, fallback) => {
    const value = styles.getPropertyValue(name).trim();
    return value || fallback;
  };
  return {
    primary: read("--chart-primary", "#fdda24"),
    seriesA: read("--chart-series-a", "#00a7b5"),
    seriesB: read("--chart-series-b", "#8f7fd6"),
    grid: read("--chart-grid", "rgba(246, 247, 248, 0.07)"),
    axisText: read("--chart-axis-text", "#6e6e6e"),
  };
}

// SVG path for a bar with rounded top corners, anchored to the baseline.
export function roundedTopRect(x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height);
  if (height <= 0) {
    return "";
  }
  return [
    `M${x},${y + height}`,
    `V${y + r}`,
    `Q${x},${y} ${x + r},${y}`,
    `H${x + width - r}`,
    `Q${x + width},${y} ${x + width},${y + r}`,
    `V${y + height}`,
    "Z",
  ].join("");
}

export function createTooltip() {
  const el = document.createElement("div");
  el.className = "chart-tooltip";
  el.style.display = "none";
  document.body.appendChild(el);

  return {
    show(html, clientX, clientY) {
      el.innerHTML = html;
      el.style.display = "block";
      const rect = el.getBoundingClientRect();
      let left = clientX + 12;
      let top = clientY - rect.height - 12;
      if (left + rect.width > window.innerWidth - 8) {
        left = clientX - rect.width - 12;
      }
      if (top < 8) {
        top = clientY + 12;
      }
      el.style.left = `${left}px`;
      el.style.top = `${top}px`;
    },
    hide() {
      el.style.display = "none";
    },
    destroy() {
      el.remove();
    },
  };
}

export function tooltipRow(color, label, value) {
  return (
    `<div style="display:flex;align-items:center;gap:6px;">` +
    `<span style="width:8px;height:8px;border-radius:50%;background:${color};flex-shrink:0;"></span>` +
    `<span style="opacity:.75;">${label}</span>` +
    `<span style="margin-left:auto;padding-left:12px;">${value}</span>` +
    `</div>`
  );
}
