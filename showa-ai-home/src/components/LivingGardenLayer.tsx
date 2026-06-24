import { useEffect, useRef } from 'react'
import { gardenArtSize } from '../constants'

export function LivingGardenLayer() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext('2d', { willReadFrequently: true })
    if (!context) return

    const image = new Image()
    image.src = '/assets/showa-garden-clean.png'

    let animationFrame = 0
    let cancelled = false
    let baseData: Uint8ClampedArray | null = null
    let waterPixels: number[] = []
    let plantPixels: number[] = []
    const { width, height } = gardenArtSize

    function inEllipse(x: number, y: number, cx: number, cy: number, rx: number, ry: number) {
      const nx = (x - cx) / rx
      const ny = (y - cy) / ry
      return nx * nx + ny * ny <= 1
    }

    function inAnyEllipse(x: number, y: number, ellipses: number[][]) {
      return ellipses.some(([cx, cy, rx, ry]) => inEllipse(x, y, cx, cy, rx, ry))
    }

    function isWater(r: number, g: number, b: number) {
      return b > r + 5 && g > r - 7 && r < 82 && g < 104 && b < 112
    }

    function isPlantLike(r: number, g: number, b: number) {
      const green = g > r * 1.08 && g > b * 0.72 && g > 48 && r < 142
      const flower = r > 116 && b > 82 && g > 54 && Math.abs(r - b) < 88
      return green || flower
    }

    function inPondMask(x: number, y: number) {
      const pond = [
        [360, 739, 370, 138],
        [238, 764, 236, 118],
        [520, 714, 214, 112],
        [612, 806, 190, 88],
      ]
      const stones = [
        [44, 542, 86, 74],
        [220, 600, 100, 64],
        [350, 588, 108, 64],
        [476, 598, 128, 66],
        [616, 610, 112, 58],
        [226, 842, 102, 44],
        [404, 862, 130, 44],
        [592, 792, 134, 80],
      ]
      return inAnyEllipse(x, y, pond) && !inAnyEllipse(x, y, stones)
    }

    function inPlantMask(x: number, y: number) {
      return (
        inAnyEllipse(x, y, [
          [100, 104, 140, 112],
          [466, 130, 270, 96],
          [982, 82, 248, 88],
          [150, 446, 94, 116],
          [108, 805, 148, 126],
          [652, 804, 98, 112],
          [1116, 828, 212, 126],
          [1428, 760, 198, 132],
        ]) ||
        (x > 0 && x < 620 && y > 338 && y < 892 && (x < 190 || y > 700)) ||
        (x > 1280 && x < 1660 && y > 610 && y < 910)
      )
    }

    function sample(x: number, y: number) {
      const sx = Math.max(0, Math.min(width - 1, Math.round(x)))
      const sy = Math.max(0, Math.min(height - 1, Math.round(y)))
      return (sy * width + sx) << 2
    }

    function setPixel(data: Uint8ClampedArray, x: number, y: number, r: number, g: number, b: number, alpha: number) {
      if (x < 0 || y < 0 || x >= width || y >= height) return
      const i = (Math.round(y) * width + Math.round(x)) << 2
      data[i] = r
      data[i + 1] = g
      data[i + 2] = b
      data[i + 3] = alpha
    }

    function buildMasks() {
      if (!baseData) return
      waterPixels = []
      plantPixels = []

      for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
          const i = (y * width + x) << 2
          const r = baseData[i]
          const g = baseData[i + 1]
          const b = baseData[i + 2]
          if (inPondMask(x, y) && isWater(r, g, b)) waterPixels.push(i)
          if (inPlantMask(x, y) && isPlantLike(r, g, b)) plantPixels.push(i)
        }
      }
    }

    function render(time: number) {
      if (cancelled || !baseData) return

      const t = time / 1000
      const frame = new Uint8ClampedArray(width * height * 4)

      for (const i of waterPixels) {
        const pixel = i >> 2
        const x = pixel % width
        const y = Math.floor(pixel / width)
        const dx = Math.sin(y * 0.035 + t * 1.6) * 1.8 + Math.sin((x + y) * 0.018 - t * 1.2) * 0.9
        const dy = Math.cos(x * 0.025 + t * 1.3) * 0.75
        const si = sample(x + dx, y + dy)
        const glint = Math.sin(x * 0.035 + y * 0.028 + t * 2.2) * 6
        setPixel(
          frame,
          x,
          y,
          Math.max(0, Math.min(255, baseData[si] + glint * 0.24)),
          Math.max(0, Math.min(255, baseData[si + 1] + glint * 0.42)),
          Math.max(0, Math.min(255, baseData[si + 2] + glint * 0.58)),
          218,
        )
      }

      for (const i of plantPixels) {
        const pixel = i >> 2
        const x = pixel % width
        const y = Math.floor(pixel / width)
        const heightFactor = Math.max(0.22, Math.min(1, (height - y) / height))
        const sway = Math.sin(t * 1.35 + y * 0.015 + x * 0.004) * (1.1 + heightFactor * 2.4)
        const si = sample(x - sway, y + Math.sin(t + x * 0.01) * 0.45)
        if (!isPlantLike(baseData[si], baseData[si + 1], baseData[si + 2])) continue
        setPixel(frame, x, y, baseData[si], baseData[si + 1], baseData[si + 2], 178)
      }

      const flow = (t * 34) % 28
      for (let y = 600; y < 708; y += 1) {
        const fall = (y - 600) / 108
        const center = 278 + fall * 16 + Math.sin(t * 3.2 + y * 0.09) * 2.5
        const half = 8 + fall * 18
        for (let x = Math.floor(center - half); x <= Math.ceil(center + half); x += 1) {
          const nx = Math.abs((x - center) / half)
          if (nx > 1) continue
          const si = sample(x + Math.sin(y * 0.13 + t * 4) * 2, y - flow)
          const stripe = Math.sin((y + flow) * 0.62 + x * 0.9) > 0.18 ? 1 : 0
          const edgeFade = 1 - nx
          setPixel(
            frame,
            x,
            y,
            Math.min(255, baseData[si] + 24 + stripe * 28),
            Math.min(255, baseData[si + 1] + 30 + stripe * 30),
            Math.min(255, baseData[si + 2] + 36 + stripe * 32),
            132 + edgeFade * 88,
          )
        }
      }

      const splashX = 292
      const splashY = 708
      for (let y = splashY - 18; y <= splashY + 24; y += 1) {
        for (let x = splashX - 54; x <= splashX + 58; x += 1) {
          const nx = (x - splashX) / 55
          const ny = (y - splashY) / 18
          const dist = Math.hypot(nx, ny)
          if (dist > 1) continue
          const pulse = 0.5 + 0.5 * Math.sin(t * 4.2 + dist * 8)
          setPixel(frame, x, y, 188, 218, 214, (1 - dist) * 46 + pulse * 34)
        }
      }

      context.putImageData(new ImageData(frame, width, height), 0, 0)
      animationFrame = window.requestAnimationFrame(render)
    }

    image.onload = () => {
      canvas.width = width
      canvas.height = height
      context.drawImage(image, 0, 0, width, height)
      baseData = context.getImageData(0, 0, width, height).data
      context.clearRect(0, 0, width, height)
      buildMasks()
      animationFrame = window.requestAnimationFrame(render)
    }

    return () => {
      cancelled = true
      window.cancelAnimationFrame(animationFrame)
    }
  }, [])

  return <canvas className="living-garden-layer" ref={canvasRef} aria-hidden="true" />
}
