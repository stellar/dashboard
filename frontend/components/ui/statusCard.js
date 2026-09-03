import logoUrl from "../../assets/stellar-logo-white.svg";

// Renders a shareable 1200×630 status card PNG. The community screenshots
// the network status to share moments like protocol upgrades — this gives
// them a clean, branded image in one click instead of a cropped screenshot.
// The card follows the theme the page was in when it was copied.

const W = 1200;
const H = 630;
const SCALE = 2;

const THEMES = {
  dark: {
    bg: "#0f0f0f",
    text: "#f6f7f8",
    secondary: "#a8a8a8",
    faint: "#6e6e6e",
    link: "#fdda24",
    invertLogo: false,
    status: {
      "": "#fdda24",
      slow: "#ff9f0a",
      "very-slow": "#e5484d",
      down: "#e5484d",
    },
  },
  light: {
    bg: "#f6f7f8",
    text: "#0f0f0f",
    secondary: "#555555",
    faint: "#8a8a8a",
    link: "#002e5d",
    invertLogo: true,
    // brand gold reads too faint on light — use the validated darker step
    status: {
      "": "#b8860b",
      slow: "#ff9f0a",
      "very-slow": "#e5484d",
      down: "#e5484d",
    },
  },
};

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
  statusClass,
  stats,
}) {
  const themeName =
    document.documentElement.getAttribute("data-theme") === "light"
      ? "light"
      : "dark";
  const theme = THEMES[themeName];

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
  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, W, H);

  const left = 80;

  // Eyebrow
  ctx.fillStyle = theme.secondary;
  ctx.font = "600 26px Inter";
  ctx.fillText(eyebrow.toUpperCase(), left, 130);

  // Status dot + word
  ctx.fillStyle = theme.status[statusClass] || theme.status[""];
  ctx.beginPath();
  ctx.arc(left + 16, 216, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = theme.text;
  ctx.font = "500 84px Lora";
  ctx.fillText(statusText, left + 56, 244);

  // Stats
  const statTop = 380;
  let x = left;
  stats.forEach((stat) => {
    ctx.fillStyle = theme.faint;
    ctx.font = "600 20px Inter";
    ctx.fillText(stat.label.toUpperCase(), x, statTop);
    ctx.fillStyle = theme.text;
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
  if (theme.invertLogo) {
    // The brand asset is the white logo; flip it to black for light cards.
    ctx.filter = "invert(1)";
  }
  ctx.drawImage(
    logo,
    left,
    footerY - logoH + 8,
    (logo.width / logo.height) * logoH,
    logoH,
  );
  ctx.filter = "none";
  ctx.fillStyle = theme.link;
  ctx.font = "500 24px Inter";
  ctx.fillText("dashboard.stellar.org", left + 200, footerY);
  ctx.fillStyle = theme.faint;
  ctx.font = "400 22px Inter";
  const ts = new Date().toISOString().replace("T", " ").slice(0, 16) + " UTC";
  ctx.textAlign = "right";
  ctx.fillText(ts, W - left, footerY);
  ctx.textAlign = "left";

  // toBlob calls back with null if the browser can't encode — reject so
  // callers can surface a failure instead of throwing on a null Blob.
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error("Could not render the status image"));
      }
    }, "image/png"),
  );
}

export async function copyStatusCard(options) {
  let blob;
  try {
    blob = await renderStatusCard(options);
  } catch (e) {
    return "error";
  }
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
