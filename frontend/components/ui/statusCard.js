import logoUrl from "../../assets/stellar-logo-white.svg";

// Renders a shareable 1200×630 status card PNG. The community screenshots
// the network status to share moments like protocol upgrades — this gives
// them a clean, branded image in one click instead of a cropped screenshot.

const W = 1200;
const H = 630;
const SCALE = 2;

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export async function renderStatusCard({
  eyebrow,
  statusText,
  statusColor,
  stats,
}) {
  // Make sure the brand fonts are usable inside the canvas first.
  await Promise.all([
    document.fonts.load("500 84px Lora"),
    document.fonts.load("600 26px Inter"),
    document.fonts.load("400 40px Inter"),
  ]);
  const logo = await loadImage(logoUrl);

  const canvas = document.createElement("canvas");
  canvas.width = W * SCALE;
  canvas.height = H * SCALE;
  const ctx = canvas.getContext("2d");
  ctx.scale(SCALE, SCALE);

  // Surface
  ctx.fillStyle = "#0f0f0f";
  ctx.fillRect(0, 0, W, H);

  const left = 80;

  // Eyebrow
  ctx.fillStyle = "#a8a8a8";
  ctx.font = "600 26px Inter";
  ctx.fillText(eyebrow.toUpperCase(), left, 130);

  // Status dot + word
  ctx.fillStyle = statusColor;
  ctx.beginPath();
  ctx.arc(left + 16, 216, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f6f7f8";
  ctx.font = "500 84px Lora";
  ctx.fillText(statusText, left + 56, 244);

  // Stats
  const statTop = 380;
  let x = left;
  stats.forEach((stat) => {
    ctx.fillStyle = "#6e6e6e";
    ctx.font = "600 20px Inter";
    ctx.fillText(stat.label.toUpperCase(), x, statTop);
    ctx.fillStyle = "#f6f7f8";
    ctx.font = "400 40px Inter";
    ctx.fillText(stat.value, x, statTop + 52);
    x +=
      Math.max(
        ctx.measureText(stat.value).width,
        ctx.measureText(stat.label).width,
      ) + 64;
  });

  // Footer: logo, source, timestamp
  const footerY = 552;
  const logoH = 36;
  ctx.drawImage(
    logo,
    left,
    footerY - logoH + 8,
    (logo.width / logo.height) * logoH,
    logoH,
  );
  ctx.fillStyle = "#fdda24";
  ctx.font = "500 24px Inter";
  ctx.fillText("dashboard.stellar.org", left + 200, footerY);
  ctx.fillStyle = "#6e6e6e";
  ctx.font = "400 22px Inter";
  const ts = new Date().toISOString().replace("T", " ").slice(0, 16) + " UTC";
  ctx.textAlign = "right";
  ctx.fillText(ts, W - left, footerY);
  ctx.textAlign = "left";

  return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
}

export async function copyStatusCard(options) {
  const blob = await renderStatusCard(options);
  try {
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    return "copied";
  } catch (e) {
    // Clipboard image support missing (e.g. Firefox) — download instead.
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "stellar-network-status.png";
    a.click();
    URL.revokeObjectURL(url);
    return "downloaded";
  }
}
