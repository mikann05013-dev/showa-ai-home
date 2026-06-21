import fs from 'node:fs'
import path from 'node:path'
import { PNG } from 'pngjs'
import gifencPkg from 'gifenc'

const { GIFEncoder, applyPalette, quantize } = gifencPkg

const root = process.cwd()
const sourcePath = path.join(root, 'public/assets/showa-garden-clean.png')
const baseCropPath = path.join(root, 'public/assets/garden-pond-overlay-source.png')
const outputPath = path.join(root, 'public/assets/garden-pond-overlay.gif')

const source = PNG.sync.read(fs.readFileSync(sourcePath))
const crop = { x: 0, y: 410, width: 690, height: 500 }
const width = crop.width
const height = crop.height
const frameCount = 24

function sourceIndex(x, y) {
  const sx = Math.max(0, Math.min(source.width - 1, Math.round(crop.x + x)))
  const sy = Math.max(0, Math.min(source.height - 1, Math.round(crop.y + y)))
  return (sy * source.width + sx) << 2
}

function sampleSource(x, y) {
  const i = sourceIndex(x, y)
  return [source.data[i], source.data[i + 1], source.data[i + 2], source.data[i + 3]]
}

function inEllipse(x, y, cx, cy, rx, ry) {
  const nx = (x - cx) / rx
  const ny = (y - cy) / ry
  return nx * nx + ny * ny <= 1
}

function isStoneColor(r, g, b) {
  return Math.abs(r - g) < 16 && Math.abs(g - b) < 18 && r > 42 && r < 148 && g > 38 && g < 142
}

function isPlantColor(r, g, b) {
  const green = g > r * 1.04 && g >= b * 0.72 && g > 42 && r < 142
  const flower = (b > r * 1.06 && r > 58 && g < 132) || (r > 116 && g < 118 && b > 82)
  return green || flower
}

function isWaterColor(r, g, b) {
  const darkPond = b >= r + 2 && g >= r - 4 && r < 94 && g < 118 && b < 120
  const notGrayStone = !isStoneColor(r, g, b)
  return darkPond && notGrayStone
}

function inPondWater(x, y) {
  const inWater =
    inEllipse(x, y, 404, 329, 334, 140) ||
    inEllipse(x, y, 255, 330, 205, 108) ||
    inEllipse(x, y, 520, 294, 178, 112)
  const rockCutouts = [
    [58, 116, 68, 70],
    [224, 198, 83, 50],
    [349, 184, 96, 54],
    [471, 194, 108, 54],
    [598, 202, 98, 50],
    [230, 431, 86, 44],
    [406, 447, 112, 42],
    [565, 382, 116, 72],
  ]
  return inWater && !rockCutouts.some(([cx, cy, rx, ry]) => inEllipse(x, y, cx, cy, rx, ry))
}

function makeFrame(t) {
  const frame = new Uint8ClampedArray(width * height * 4)

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let [r, g, b, a] = sampleSource(x, y)

      if (inPondWater(x, y) && isWaterColor(r, g, b)) {
        const dx = Math.sin(y * 0.04 + t * 1.15) * 1.15 + Math.sin((x + y) * 0.018 - t * 0.7) * 0.72
        const dy = Math.cos(x * 0.026 + t * 0.8) * 0.42
        ;[r, g, b, a] = sampleSource(x + dx, y + dy)
        const shimmer = Math.sin(x * 0.02 + y * 0.023 + t * 1.25) * 1.8
        r = Math.max(0, Math.min(255, r + shimmer * 0.28))
        g = Math.max(0, Math.min(255, g + shimmer * 0.48))
        b = Math.max(0, Math.min(255, b + shimmer * 0.62))
      }

      const i = (y * width + x) << 2
      frame[i] = r
      frame[i + 1] = g
      frame[i + 2] = b
      frame[i + 3] = a
    }
  }

  return frame
}

function blend(frame, x, y, r, g, b, alpha) {
  const px = Math.round(x)
  const py = Math.round(y)
  if (px < 0 || px >= width || py < 0 || py >= height) return
  const i = (py * width + px) << 2
  frame[i] = frame[i] * (1 - alpha) + r * alpha
  frame[i + 1] = frame[i + 1] * (1 - alpha) + g * alpha
  frame[i + 2] = frame[i + 2] * (1 - alpha) + b * alpha
}

function animateWaterfall(frame, t) {
  const flow = ((t / (Math.PI * 2)) * 22) % 22

  for (let y = 195; y < 294; y += 1) {
    const fall = (y - 195) / 99
    const center = 279 + fall * 5 + Math.sin(y * 0.08) * 1.2
    const half = 5 + fall * 10

    for (let x = Math.floor(center - half); x <= Math.ceil(center + half); x += 1) {
      const nx = (x - center) / half
      if (Math.abs(nx) > 1) continue
      const [sr, sg, sb] = sampleSource(x + Math.sin(y * 0.12 + t) * 0.9, y - flow)
      const stripe = Math.sin((y + flow * 2.6) * 0.46 + x * 1.1) > 0.35 ? 1 : 0
      const alpha = 0.36 + fall * 0.12
      blend(frame, x, y, Math.min(255, sr + 18 + stripe * 34), Math.min(255, sg + 26 + stripe * 38), Math.min(255, sb + 30 + stripe * 42), alpha)
    }
  }

  const splashX = 288
  const splashY = 292
  for (let y = splashY - 13; y <= splashY + 17; y += 1) {
    for (let x = splashX - 36; x <= splashX + 34; x += 1) {
      const nx = (x - splashX) / 35
      const ny = (y - splashY) / 14
      const dist = Math.hypot(nx, ny)
      if (dist > 1) continue
      const pulse = 0.5 + 0.5 * Math.sin(t * 2 + dist * 7)
      blend(frame, x, y, 184, 208, 202, (1 - dist) * 0.12 + pulse * 0.04)
    }
  }

  for (let dot = 0; dot < 14; dot += 1) {
    const angle = dot * 1.58
    const radius = 5 + ((dot * 5 + t * 13) % 20)
    blend(frame, splashX + Math.cos(angle) * radius, splashY + Math.sin(angle * 0.8) * radius * 0.25, 214, 226, 216, 0.28)
  }
}

function swayPlants(frame, t) {
  const base = new Uint8ClampedArray(frame)
  const patches = [
    { cx: 58, cy: 174, rx: 56, ry: 50, dx: 1.1, phase: 0.2 },
    { cx: 140, cy: 272, rx: 48, ry: 58, dx: 1.3, phase: 1.1 },
    { cx: 64, cy: 438, rx: 92, ry: 58, dx: 1.4, phase: 2.2 },
    { cx: 182, cy: 112, rx: 44, ry: 78, dx: 1.2, phase: 0.7 },
    { cx: 658, cy: 298, rx: 40, ry: 52, dx: 1.2, phase: 1.7 },
  ]

  for (const patch of patches) {
    const sway = Math.sin(t + patch.phase) * patch.dx
    for (let y = Math.max(0, Math.floor(patch.cy - patch.ry)); y <= Math.min(height - 1, Math.ceil(patch.cy + patch.ry)); y += 1) {
      for (let x = Math.max(0, Math.floor(patch.cx - patch.rx)); x <= Math.min(width - 1, Math.ceil(patch.cx + patch.rx)); x += 1) {
        if (!inEllipse(x, y, patch.cx, patch.cy, patch.rx, patch.ry)) continue
        const srcX = Math.max(0, Math.min(width - 1, Math.round(x - sway)))
        const src = (y * width + srcX) << 2
        const dst = (y * width + x) << 2
        if (!isPlantColor(base[src], base[src + 1], base[src + 2]) || isStoneColor(frame[dst], frame[dst + 1], frame[dst + 2])) continue
        const edge = Math.min(1, Math.max(0, 1 - Math.hypot((x - patch.cx) / patch.rx, (y - patch.cy) / patch.ry)))
        const alpha = 0.24 + edge * 0.34
        frame[dst] = frame[dst] * (1 - alpha) + base[src] * alpha
        frame[dst + 1] = frame[dst + 1] * (1 - alpha) + base[src + 1] * alpha
        frame[dst + 2] = frame[dst + 2] * (1 - alpha) + base[src + 2] * alpha
      }
    }
  }
}

function writeBaseCrop() {
  const png = new PNG({ width, height })
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const [r, g, b, a] = sampleSource(x, y)
      const i = (y * width + x) << 2
      png.data[i] = r
      png.data[i + 1] = g
      png.data[i + 2] = b
      png.data[i + 3] = a
    }
  }
  fs.writeFileSync(baseCropPath, PNG.sync.write(png))
}

writeBaseCrop()

const gif = GIFEncoder()
for (let frameIndex = 0; frameIndex < frameCount; frameIndex += 1) {
  const t = (frameIndex / frameCount) * Math.PI * 2
  const frame = makeFrame(t)
  swayPlants(frame, t)
  animateWaterfall(frame, t)
  const palette = quantize(frame, 256)
  const indexed = applyPalette(frame, palette)
  gif.writeFrame(indexed, width, height, { palette, delay: 72 })
}

gif.finish()
fs.writeFileSync(outputPath, gif.bytes())
console.log(outputPath)
