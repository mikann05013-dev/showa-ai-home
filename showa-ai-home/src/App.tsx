import { useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent, type PointerEvent } from 'react'
import './App.css'

type Scene = 'garden' | 'room'
type Weather = 'sunny' | 'rainy' | 'snowy' | 'cloudy'
type TimeTone = 'morning' | 'day' | 'evening' | 'night'
type Season = 'spring' | 'summer' | 'autumn' | 'winter'
type OSApp = 'home' | 'chat' | 'memory' | 'diary' | 'wallet' | 'mail' | 'settings'
type AvatarId = 'boy' | 'girl' | 'cat' | 'bunny'
type AvatarSide = 'user' | 'partner'

type Message = {
  id: number
  from: 'home' | 'you'
  text: string
}

type DiaryEntry = {
  id: number
  side: 'user' | 'ai'
  text: string
  createdAt: string
}

type DecorKind =
  | 'lowTable'
  | 'cushion'
  | 'lamp'
  | 'desk'
  | 'macbook'
  | 'diary'
  | 'ceilingLamp'
  | 'bookshelf'
  | 'teaSet'
  | 'futon'
  | 'radio'
  | 'cabinet'
  | 'plant'
  | 'catBed'

type DecorMeta = {
  label: string
  className: string
  defaultScale: number
  src: string
  openSrc?: string
  width: number
}

type DecorItem = {
  id: number
  kind: DecorKind
  scene: Scene
  x: number
  y: number
  scale: number
  lit?: boolean
  locked?: boolean
  open?: boolean
}

type WeatherSource = 'auto' | 'manual' | 'fallback'

type LocalWeather = {
  source: WeatherSource
  label: string
  temperature?: number
  code?: number
  cityTime?: Date
}

type WindowPosition = {
  x: number
  y: number
}

type WindowDrag = {
  app: OSApp
  startX: number
  startY: number
  originX: number
  originY: number
}

const weatherLabels: Record<Weather, string> = {
  sunny: '晴',
  rainy: '雨',
  snowy: '雪',
  cloudy: '阴',
}

const timeLabels: Record<TimeTone, string> = {
  morning: '早晨',
  day: '白天',
  evening: '黄昏',
  night: '夜晚',
}

const seasonLabels: Record<Season, string> = {
  spring: '春',
  summer: '夏',
  autumn: '秋',
  winter: '冬',
}

const osAppLabels: Record<OSApp, string> = {
  home: '我的主页',
  chat: '聊天室',
  memory: '记忆库',
  diary: '日记本',
  wallet: '存钱罐',
  mail: '信箱',
  settings: '设置',
}

const initialMessages: Message[] = [
  { id: 1, from: 'home', text: '廊下的灯已经亮了。' },
  { id: 2, from: 'you', text: '今天适合做什么？' },
  { id: 3, from: 'home', text: '听水声，煮茶，然后把心事慢慢放回抽屉。' },
]

const aiEndpoint = import.meta.env.VITE_AI_ENDPOINT as string | undefined
const gardenArtSize = { width: 1672, height: 941 }
const decorStorageKey = 'showa-decor-items'

const diaryStorageKey = 'showa-diary-text'
const aiDiaryStorageKey = 'showa-ai-diary-text'
const diaryEntriesStorageKey = 'showa-diary-entries'
const userAvatarStorageKey = 'showa-chat-user-avatar'
const partnerAvatarStorageKey = 'showa-chat-partner-avatar'
const userAvatarImageStorageKey = 'showa-chat-user-avatar-image'
const partnerAvatarImageStorageKey = 'showa-chat-partner-avatar-image'

const avatarLabels: Record<AvatarId, string> = {
  boy: '昭和少年',
  girl: '紫阳花少女',
  cat: '茶间小猫',
  bunny: '白兔伙伴',
}

const decorCatalog: Record<DecorKind, DecorMeta> = {
  lowTable: {
    label: '茶几',
    className: 'decor-low-table',
    defaultScale: 0.88,
    src: '/assets/furniture-low-table-v1.png',
    width: 180,
  },
  cushion: {
    label: '坐垫',
    className: 'decor-cushion',
    defaultScale: 0.8,
    src: '/assets/furniture-cushion-v1.png',
    width: 160,
  },
  lamp: {
    label: '台灯',
    className: 'decor-lamp',
    defaultScale: 0.78,
    src: '/assets/furniture-lamp-v1.png',
    width: 132,
  },
  desk: {
    label: '书桌',
    className: 'decor-desk',
    defaultScale: 0.86,
    src: '/assets/furniture-desk-v1.png',
    width: 178,
  },
  macbook: {
    label: 'MacBook',
    className: 'decor-macbook',
    defaultScale: 0.7,
    src: '/assets/furniture-macbook-closed-v1.png',
    openSrc: '/assets/furniture-macbook-open-v1.png',
    width: 260,
  },
  diary: {
    label: '日记本',
    className: 'decor-diary',
    defaultScale: 0.58,
    src: '/assets/furniture-diary-closed-v1.png',
    openSrc: '/assets/furniture-diary-open-v1.png',
    width: 230,
  },
  ceilingLamp: {
    label: '顶灯',
    className: 'decor-ceiling-lamp',
    defaultScale: 0.54,
    src: '/assets/furniture-ceiling-lamp-v1.png',
    width: 210,
  },
  bookshelf: {
    label: '书柜',
    className: 'decor-bookshelf',
    defaultScale: 0.62,
    src: '/assets/furniture-bookshelf-v1.png',
    width: 230,
  },
  teaSet: {
    label: '茶具',
    className: 'decor-tea-set',
    defaultScale: 0.56,
    src: '/assets/furniture-tea-set-v1.png',
    width: 220,
  },
  futon: {
    label: '被褥',
    className: 'decor-futon',
    defaultScale: 0.6,
    src: '/assets/furniture-futon-v1.png',
    width: 260,
  },
  radio: {
    label: '收音机',
    className: 'decor-radio',
    defaultScale: 0.56,
    src: '/assets/furniture-radio-v1.png',
    width: 210,
  },
  cabinet: {
    label: '柜子',
    className: 'decor-cabinet',
    defaultScale: 0.84,
    src: '/assets/furniture-cabinet-v1.png',
    width: 180,
  },
  plant: {
    label: '盆栽',
    className: 'decor-plant',
    defaultScale: 0.75,
    src: '/assets/furniture-plant-v1.png',
    width: 128,
  },
  catBed: {
    label: '猫窝',
    className: 'decor-cat-bed',
    defaultScale: 0.78,
    src: '/assets/furniture-cat-bed-v1.png',
    width: 168,
  },
}

function loadDecorItems(): DecorItem[] {
  try {
    const saved = window.localStorage.getItem(decorStorageKey)
    if (!saved) return []
    const parsed = JSON.parse(saved) as Array<Omit<Partial<DecorItem>, 'kind'> & { kind?: string }>
    return parsed
      .map((item) => ({ ...item, kind: item.kind === 'computer' ? 'macbook' : item.kind }) as DecorItem)
      .filter(
        (item) =>
        typeof item.id === 'number' &&
        item.scene &&
        item.kind in decorCatalog &&
        typeof item.x === 'number' &&
        typeof item.y === 'number' &&
        typeof item.scale === 'number',
      )
  } catch {
    return []
  }
}

function loadDiaryEntries(): DiaryEntry[] {
  try {
    const saved = window.localStorage.getItem(diaryEntriesStorageKey)
    if (!saved) return []
    const parsed = JSON.parse(saved) as DiaryEntry[]
    return parsed.filter(
      (entry) =>
        typeof entry.id === 'number' &&
        (entry.side === 'user' || entry.side === 'ai') &&
        typeof entry.text === 'string' &&
        typeof entry.createdAt === 'string',
    )
  } catch {
    return []
  }
}

function mapWeatherCode(code: number): Weather {
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'snowy'
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82) || (code >= 95 && code <= 99)) {
    return 'rainy'
  }
  if ([0, 1].includes(code)) return 'sunny'
  return 'cloudy'
}

function getTimeTone(hour: number): TimeTone {
  if (hour >= 5 && hour < 10) return 'morning'
  if (hour >= 10 && hour < 17) return 'day'
  if (hour >= 17 && hour < 20) return 'evening'
  return 'night'
}

function getSeason(month: number): Season {
  if (month >= 2 && month <= 4) return 'spring'
  if (month >= 5 && month <= 7) return 'summer'
  if (month >= 8 && month <= 10) return 'autumn'
  return 'winter'
}

async function fetchLocalWeather(latitude: number, longitude: number): Promise<LocalWeather> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: 'temperature_2m,weather_code,is_day,precipitation,rain,snowfall',
    timezone: 'auto',
    forecast_days: '1',
  })

  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`)
  if (!response.ok) {
    throw new Error(`Weather request failed: ${response.status}`)
  }

  const data = (await response.json()) as {
    timezone?: string
    current?: {
      time?: string
      temperature_2m?: number
      weather_code?: number
    }
  }

  const code = data.current?.weather_code
  const cityTime = data.current?.time ? new Date(data.current.time) : undefined

  return {
    source: 'auto',
    label: data.timezone?.replace('_', ' ') ?? '当前位置',
    temperature: data.current?.temperature_2m,
    code,
    cityTime,
  }
}

function WeatherLayer({ weather }: { weather: Weather }) {
  if (weather === 'rainy') {
    return (
      <div className="weather-layer rain" aria-hidden="true">
        {Array.from({ length: 68 }).map((_, index) => (
          <i
            key={index}
            style={
              {
                '--x': `${(index * 37) % 103}%`,
                '--delay': `${index * -54}ms`,
                '--duration': `${620 + (index % 5) * 80}ms`,
              } as CSSProperties
            }
          />
        ))}
      </div>
    )
  }

  if (weather === 'snowy') {
    return (
      <div className="weather-layer snow" aria-hidden="true">
        {Array.from({ length: 46 }).map((_, index) => (
          <i
            key={index}
            style={
              {
                '--x': `${(index * 29) % 101}%`,
                '--delay': `${index * -180}ms`,
                '--duration': `${4600 + (index % 6) * 420}ms`,
              } as CSSProperties
            }
          />
        ))}
      </div>
    )
  }

  return <div className="weather-layer dust" aria-hidden="true" />
}

function RoomWindowLayer({ weather, timeTone }: { weather: Weather; timeTone: TimeTone }) {
  return (
    <div className={`room-window-layer ${weather} ${timeTone}`} aria-hidden="true">
      <span className="room-window-view" />
    </div>
  )
}

function LivingGardenLayer() {
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

function AnimatedScene({
  scene,
  weather,
  timeTone,
  season,
  doorMoving,
  gardenLampOn,
  roomLampOn,
  onEnterRoom,
  onBackGarden,
  onToggleGardenLamp,
}: {
  scene: Scene
  weather: Weather
  timeTone: TimeTone
  season: Season
  doorMoving: boolean
  gardenLampOn: boolean
  roomLampOn: boolean
  onEnterRoom: () => void
  onBackGarden: () => void
  onToggleGardenLamp: () => void
}) {
  const winterMode = weather === 'snowy' || season === 'winter'
  const activeLampOn = scene === 'garden' ? gardenLampOn : roomLampOn

  return (
    <section
      className={`art-stage ${scene} ${winterMode ? 'winter-art' : ''} ${activeLampOn ? 'lamp-on' : ''}`}
      aria-label="像素风昭和日式小家"
    >
      <div className="art-camera">
        <img className="scene-art garden-art base-art" src="/assets/showa-garden-clean.png" alt="" draggable="false" />
        <img
          className="scene-art garden-art winter-scene-art"
          src="/assets/showa-garden-closed-winter.png"
          alt=""
          draggable="false"
        />
        <img className="scene-art room-art" src="/assets/showa-room-empty-v1.png" alt="" draggable="false" />
        {scene === 'garden' && !winterMode ? <LivingGardenLayer /> : null}
        {scene === 'room' ? <RoomWindowLayer weather={weather} timeTone={timeTone} /> : null}
        <span className="lantern-glow lantern-left" aria-hidden="true" />
        <span className="lantern-glow lantern-right" aria-hidden="true" />
        {scene === 'garden' ? <span className="rain-glass" aria-hidden="true" /> : null}
        <span className={`season-wash ${weather}`} aria-hidden="true" />
      </div>

      {scene === 'garden' ? (
        <>
          <div className={`sliding-door ${doorMoving ? 'open' : ''}`} aria-hidden="true">
            <span className="door-room-peek" />
            <span className="panel left" />
            <span className="panel right" />
          </div>
          <button
            className="hotspot door-hotspot"
            type="button"
            onClick={onEnterRoom}
            aria-label="打开障子拉门进入室内"
            disabled={doorMoving}
          >
            <span>入室</span>
          </button>
          <button className="hotspot garden-lamp-hotspot" type="button" onClick={onToggleGardenLamp} aria-label="开关庭院灯">
            <span>{gardenLampOn ? '熄灯' : '点灯'}</span>
          </button>
        </>
      ) : (
        <>
          <button className="hotspot back-hotspot" type="button" onClick={onBackGarden} aria-label="回到庭院">
            <span>庭院</span>
          </button>
        </>
      )}
    </section>
  )
}

function DecorLayer({
  scene,
  items,
  editing,
  selectedId,
  onSelect,
  onMove,
  onActivate,
}: {
  scene: Scene
  items: DecorItem[]
  editing: boolean
  selectedId: number | null
  onSelect: (id: number | null) => void
  onMove: (id: number, x: number, y: number) => void
  onActivate: (item: DecorItem) => void
}) {
  const [draggingId, setDraggingId] = useState<number | null>(null)
  const visibleItems = items.filter((item) => item.scene === scene)

  function pointToPercent(event: PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    return {
      x: Math.max(2, Math.min(98, ((event.clientX - rect.left) / rect.width) * 100)),
      y: Math.max(8, Math.min(98, ((event.clientY - rect.top) / rect.height) * 100)),
    }
  }

  function moveSelected(event: PointerEvent<HTMLDivElement>) {
    if (!editing || draggingId === null) return
    const next = pointToPercent(event)
    onMove(draggingId, next.x, next.y)
  }

  return (
    <div
      className={`decor-layer ${editing ? 'editing' : ''}`}
      onPointerMove={moveSelected}
      onPointerUp={() => setDraggingId(null)}
      onPointerCancel={() => setDraggingId(null)}
      onPointerLeave={() => setDraggingId(null)}
      aria-hidden={!editing}
    >
      {visibleItems.map((item) => {
        const meta = decorCatalog[item.kind]
        const layerIndex = items.findIndex((candidate) => candidate.id === item.id)
        const src = item.open && meta.openSrc ? meta.openSrc : meta.src
        return (
          <button
            className={`decor-item ${meta.className} ${item.lit ? 'lit' : ''} ${item.open ? 'open' : ''} ${
              item.locked ? 'locked' : ''
            } ${
              selectedId === item.id ? 'selected' : ''
            }`}
            key={item.id}
            type="button"
            style={
              {
                '--x': `${item.x}%`,
                '--y': `${item.y}%`,
                '--scale': item.scale,
                '--z': 100 + layerIndex,
              } as CSSProperties
            }
            onPointerDown={(event) => {
              if (!editing) return
              if (item.locked) return
              event.preventDefault()
              event.currentTarget.setPointerCapture(event.pointerId)
              setDraggingId(item.id)
              onSelect(item.id)
            }}
            onClick={() => {
              if (!editing) onActivate(item)
            }}
            aria-label={`${item.locked ? '已锁定' : '移动'}${meta.label}`}
          >
            <img
              className="decor-pixel"
              src={src}
              alt=""
              draggable="false"
              style={{ width: `${meta.width}px` }}
              aria-hidden="true"
            />
            <span className="decor-label">{meta.label}</span>
          </button>
        )
      })}
    </div>
  )
}

function DecorPanel({
  scene,
  editing,
  selectedItem,
  onToggle,
  onAdd,
  onScale,
  onToggleLock,
  onUnlockScene,
  onDelete,
  onClearScene,
}: {
  scene: Scene
  editing: boolean
  selectedItem: DecorItem | null
  onToggle: () => void
  onAdd: (kind: DecorKind) => void
  onScale: (scale: number) => void
  onToggleLock: () => void
  onUnlockScene: () => void
  onDelete: () => void
  onClearScene: () => void
}) {
  return (
    <aside className={`decor-panel ${editing ? 'open' : ''}`} aria-label="布置模式">
      <button className="decor-toggle" type="button" onClick={onToggle}>
        {editing ? '完成' : '布置'}
      </button>
      {editing ? (
        <div className="decor-tools">
          <strong>{scene === 'garden' ? '庭院物件' : '房间家具'}</strong>
          <div className="decor-catalog">
            {(Object.keys(decorCatalog) as DecorKind[]).map((kind) => (
              <button key={kind} type="button" onClick={() => onAdd(kind)}>
                {decorCatalog[kind].label}
              </button>
            ))}
          </div>
          <label>
            <span>大小</span>
            <input
              type="range"
              min="0.55"
              max="1.8"
              step="0.05"
              value={selectedItem?.scale ?? 1}
              disabled={!selectedItem}
              onChange={(event) => onScale(Number(event.target.value))}
            />
          </label>
          <div className="decor-actions">
            <button type="button" disabled={!selectedItem} onClick={onToggleLock}>
              {selectedItem?.locked ? '解锁' : '锁定'}
            </button>
            <button type="button" disabled={!selectedItem} onClick={onDelete}>
              删除
            </button>
            <button type="button" onClick={onUnlockScene}>
              全解锁
            </button>
            <button type="button" onClick={onClearScene}>
              清空本场景
            </button>
          </div>
        </div>
      ) : null}
    </aside>
  )
}

function ChatPanel({
  open,
  messages,
  draft,
  onDraftChange,
  onSubmit,
  onClose,
}: {
  open: boolean
  messages: Message[]
  draft: string
  onDraftChange: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onClose: () => void
}) {
  return (
    <aside className={`chat-panel ${open ? 'open' : ''}`} aria-label="本地聊天框" aria-hidden={!open}>
      <header>
        <div>
          <strong>茶间终端</strong>
          <span>local mock</span>
        </div>
        <button type="button" onClick={onClose} aria-label="关闭聊天框">
          ×
        </button>
      </header>
      <div className="messages">
        {messages.map((message) => (
          <p key={message.id} className={message.from}>
            {message.text}
          </p>
        ))}
      </div>
      <form onSubmit={onSubmit}>
        <input
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
          placeholder="写一句本地消息..."
        />
        <button type="submit">送信</button>
      </form>
    </aside>
  )
}

function DiaryPanel({
  open,
  value,
  onChange,
  onClose,
}: {
  open: boolean
  value: string
  onChange: (value: string) => void
  onClose: () => void
}) {
  return (
    <aside className={`diary-panel ${open ? 'open' : ''}`} aria-label="日记本" aria-hidden={!open}>
      <header>
        <strong>日记本</strong>
        <button type="button" onClick={onClose} aria-label="合上日记面板">
          ×
        </button>
      </header>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder="今天发生了什么..." />
    </aside>
  )
}

function AvatarView({
  avatarId,
  customImage,
  className = '',
}: {
  avatarId: AvatarId
  customImage: string
  className?: string
}) {
  return (
    <span className={`os-avatar avatar-${avatarId} ${customImage ? 'custom' : ''} ${className}`}>
      {customImage ? <img src={customImage} alt="" draggable="false" /> : null}
    </span>
  )
}

function PixelOS({
  open,
  messages,
  draft,
  userDiaryText,
  aiDiaryText,
  diaryEntries,
  userAvatarId,
  partnerAvatarId,
  userAvatarImage,
  partnerAvatarImage,
  timeTone,
  season,
  weather,
  localWeather,
  onDraftChange,
  onUserDiaryChange,
  onAiDiaryChange,
  onSubmitDiary,
  onUserAvatarChange,
  onPartnerAvatarChange,
  onUserAvatarImageChange,
  onPartnerAvatarImageChange,
  onSubmitMessage,
  onClose,
}: {
  open: boolean
  messages: Message[]
  draft: string
  userDiaryText: string
  aiDiaryText: string
  diaryEntries: DiaryEntry[]
  userAvatarId: AvatarId
  partnerAvatarId: AvatarId
  userAvatarImage: string
  partnerAvatarImage: string
  timeTone: TimeTone
  season: Season
  weather: Weather
  localWeather: LocalWeather
  onDraftChange: (value: string) => void
  onUserDiaryChange: (value: string) => void
  onAiDiaryChange: (value: string) => void
  onSubmitDiary: (side: 'user' | 'ai') => void
  onUserAvatarChange: (value: AvatarId) => void
  onPartnerAvatarChange: (value: AvatarId) => void
  onUserAvatarImageChange: (value: string) => void
  onPartnerAvatarImageChange: (value: string) => void
  onSubmitMessage: (event: FormEvent<HTMLFormElement>) => void
  onClose: () => void
}) {
  const [activeApps, setActiveApps] = useState<OSApp[]>(['home', 'chat', 'memory'])
  const [focusedApp, setFocusedApp] = useState<OSApp>('chat')
  const [minimizedApps, setMinimizedApps] = useState<OSApp[]>([])
  const [maximizedApps, setMaximizedApps] = useState<OSApp[]>([])
  const [activeDiarySide, setActiveDiarySide] = useState<'user' | 'ai'>('user')
  const [windowPositions, setWindowPositions] = useState<Record<OSApp, WindowPosition>>({
    home: { x: 12, y: 8 },
    chat: { x: 52, y: 16 },
    memory: { x: 18, y: 48 },
    diary: { x: 28, y: 28 },
    wallet: { x: 38, y: 36 },
    mail: { x: 34, y: 32 },
    settings: { x: 42, y: 40 },
  })
  const [windowDrag, setWindowDrag] = useState<WindowDrag | null>(null)
  const [avatarEditor, setAvatarEditor] = useState<AvatarSide | null>(null)

  const openApp = (app: OSApp) => {
    setActiveApps((current) => (current.includes(app) ? current : [...current, app]))
    setMinimizedApps((current) => current.filter((item) => item !== app))
    setFocusedApp(app)
  }

  const closeApp = (app: OSApp) => {
    setActiveApps((current) => {
      const next = current.filter((item) => item !== app)
      if (focusedApp === app && next.length > 0) setFocusedApp(next[next.length - 1])
      return next
    })
    setMinimizedApps((current) => current.filter((item) => item !== app))
    setMaximizedApps((current) => current.filter((item) => item !== app))
  }

  const minimizeApp = (app: OSApp) => {
    setMinimizedApps((current) => (current.includes(app) ? current : [...current, app]))
    setFocusedApp((current) => {
      if (current !== app) return current
      const next = activeApps.find((item) => item !== app && !minimizedApps.includes(item))
      return next ?? app
    })
  }

  const toggleMaximizeApp = (app: OSApp) => {
    setMinimizedApps((current) => current.filter((item) => item !== app))
    setMaximizedApps((current) => (current.includes(app) ? current.filter((item) => item !== app) : [...current, app]))
    setFocusedApp(app)
  }

  const startWindowDrag = (event: PointerEvent<HTMLElement>, app: OSApp, maximized: boolean) => {
    if (maximized) return
    if ((event.target as HTMLElement).closest('button')) return
    const origin = windowPositions[app] ?? { x: 0, y: 0 }
    event.currentTarget.setPointerCapture(event.pointerId)
    setFocusedApp(app)
    setWindowDrag({
      app,
      startX: event.clientX,
      startY: event.clientY,
      originX: origin.x,
      originY: origin.y,
    })
  }

  const moveWindow = (event: PointerEvent<HTMLDivElement>) => {
    if (!windowDrag) return
    const rect = event.currentTarget.getBoundingClientRect()
    const nextX = windowDrag.originX + event.clientX - windowDrag.startX
    const nextY = windowDrag.originY + event.clientY - windowDrag.startY
    const clampedX = Math.max(0, Math.min(rect.width - 180, nextX))
    const clampedY = Math.max(0, Math.min(rect.height - 80, nextY))
    setWindowPositions((current) => ({
      ...current,
      [windowDrag.app]: { x: clampedX, y: clampedY },
    }))
  }

  const nowText = new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(localWeather.cityTime ?? new Date())

  const updateCustomAvatar = (side: AvatarSide, file: File | undefined) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const value = typeof reader.result === 'string' ? reader.result : ''
      if (!value) return
      if (side === 'user') onUserAvatarImageChange(value)
      if (side === 'partner') onPartnerAvatarImageChange(value)
    }
    reader.readAsDataURL(file)
  }

  function renderWindow(app: OSApp) {
    if (app === 'chat') {
      return (
        <div className="os-chat">
          <div className="os-chat-head">
            <button className="chat-avatar-button" type="button" onClick={() => setAvatarEditor('partner')}>
              <AvatarView avatarId={partnerAvatarId} customImage={partnerAvatarImage} />
              <span>对方</span>
            </button>
            <div>
              <strong>我们的聊天室</strong>
              <small>点击头像可以更换 · 支持导入图片</small>
            </div>
            <button className="chat-avatar-button self" type="button" onClick={() => setAvatarEditor('user')}>
              <AvatarView avatarId={userAvatarId} customImage={userAvatarImage} />
              <span>我</span>
            </button>
          </div>
          <div className="os-messages">
            {messages.map((message) => (
              <div key={message.id} className={`message-row ${message.from}`}>
                <AvatarView
                  avatarId={message.from === 'you' ? userAvatarId : partnerAvatarId}
                  customImage={message.from === 'you' ? userAvatarImage : partnerAvatarImage}
                  className="message-avatar"
                />
                <p>{message.text}</p>
              </div>
            ))}
          </div>
          <form className="os-message-form" onSubmit={onSubmitMessage}>
            <input value={draft} onChange={(event) => onDraftChange(event.target.value)} placeholder="输入消息..." />
            <button type="submit">发送</button>
          </form>
          {avatarEditor ? (
            <div className="avatar-editor" role="dialog" aria-label="更换头像">
              <div className="avatar-editor-panel">
                <header>
                  <strong>{avatarEditor === 'user' ? '更换我的头像' : '更换对方头像'}</strong>
                  <button type="button" onClick={() => setAvatarEditor(null)} aria-label="关闭头像设置">
                    ×
                  </button>
                </header>
                <div className="avatar-editor-preview">
                  <AvatarView
                    avatarId={avatarEditor === 'user' ? userAvatarId : partnerAvatarId}
                    customImage={avatarEditor === 'user' ? userAvatarImage : partnerAvatarImage}
                  />
                  <span>
                    {avatarEditor === 'user'
                      ? userAvatarImage
                        ? '我的自定义头像'
                        : avatarLabels[userAvatarId]
                      : partnerAvatarImage
                        ? '对方自定义头像'
                        : avatarLabels[partnerAvatarId]}
                  </span>
                </div>
                <div className="avatar-picker" aria-label="选择内置头像">
                  {(Object.keys(avatarLabels) as AvatarId[]).map((avatar) => (
                    <button
                      className={
                        (avatarEditor === 'user' ? userAvatarId === avatar && !userAvatarImage : partnerAvatarId === avatar && !partnerAvatarImage)
                          ? 'selected'
                          : ''
                      }
                      key={avatar}
                      type="button"
                      onClick={() => {
                        if (avatarEditor === 'user') {
                          onUserAvatarChange(avatar)
                          onUserAvatarImageChange('')
                        } else {
                          onPartnerAvatarChange(avatar)
                          onPartnerAvatarImageChange('')
                        }
                      }}
                      title={avatarLabels[avatar]}
                    >
                      <AvatarView avatarId={avatar} customImage="" />
                    </button>
                  ))}
                </div>
                <label className="avatar-upload">
                  导入头像
                  <input
                    accept="image/*"
                    type="file"
                    onChange={(event) => updateCustomAvatar(avatarEditor, event.target.files?.[0])}
                  />
                </label>
                <button
                  className="avatar-clear"
                  type="button"
                  onClick={() => {
                    if (avatarEditor === 'user') onUserAvatarImageChange('')
                    if (avatarEditor === 'partner') onPartnerAvatarImageChange('')
                  }}
                >
                  清除导入图
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )
    }

    if (app === 'memory') {
      return (
        <div className="os-memory-grid">
          {[
            ['一起去赏花', '1998-04-03', '春天的照片被收进记忆库。'],
            ['烟花大会', '1997-08-16', '夜空很亮，心也安静了一会儿。'],
            ['海边小站', '1997-07-21', '风吹过站台，像一张旧明信片。'],
          ].map(([title, date, text]) => (
            <article className="memory-card" key={title}>
              <span className="memory-thumb" />
              <strong>{title}</strong>
              <small>{date}</small>
              <p>{text}</p>
            </article>
          ))}
          <button className="memory-add" type="button">
            新建记忆
          </button>
        </div>
      )
    }

    if (app === 'diary') {
      const currentDiaryText = activeDiarySide === 'user' ? userDiaryText : aiDiaryText
      const activeEntries = diaryEntries.filter((entry) => entry.side === activeDiarySide)
      return (
        <div className="os-diary">
          <div className="diary-tabs" role="tablist" aria-label="日记作者">
            <button
              className={activeDiarySide === 'user' ? 'selected' : ''}
              type="button"
              onClick={() => setActiveDiarySide('user')}
            >
              我的日记
            </button>
            <button
              className={activeDiarySide === 'ai' ? 'selected' : ''}
              type="button"
              onClick={() => setActiveDiarySide('ai')}
            >
              AI 日记
            </button>
          </div>
          {activeDiarySide === 'user' ? (
            <textarea
              value={userDiaryText}
              onChange={(event) => onUserDiaryChange(event.target.value)}
              placeholder="今天我想记下什么..."
            />
          ) : (
            <textarea
              value={aiDiaryText}
              onChange={(event) => onAiDiaryChange(event.target.value)}
              placeholder="让 AI 写下它今天想对你说的话，或者你也可以先替它记下..."
            />
          )}
          <div className="diary-actions">
            <button type="button" disabled={!currentDiaryText.trim()} onClick={() => onSubmitDiary(activeDiarySide)}>
              提交日记
            </button>
            <button
              type="button"
              disabled={!currentDiaryText}
              onClick={() => {
                if (activeDiarySide === 'user') onUserDiaryChange('')
                if (activeDiarySide === 'ai') onAiDiaryChange('')
              }}
            >
              清空草稿
            </button>
          </div>
          <div className="diary-history" aria-label={`${activeDiarySide === 'user' ? '我的' : 'AI'}日记历史`}>
            <strong>{activeDiarySide === 'user' ? '我的历史日记' : 'AI 历史日记'}</strong>
            {activeEntries.length > 0 ? (
              activeEntries.map((entry) => (
                <article key={entry.id}>
                  <time>{new Intl.DateTimeFormat('zh-CN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(entry.createdAt))}</time>
                  <p>{entry.text}</p>
                  <button
                    type="button"
                    onClick={() => {
                      if (entry.side === 'user') onUserDiaryChange(entry.text)
                      if (entry.side === 'ai') onAiDiaryChange(entry.text)
                    }}
                  >
                    查看到草稿
                  </button>
                </article>
              ))
            ) : (
              <p className="empty-diary">还没有提交过这一侧的日记。</p>
            )}
          </div>
          <div className="diary-hint">
            {activeDiarySide === 'user'
              ? '这里是你的日记。之后可以让 AI 读取这里，整理成回忆、信件或今日总结。'
              : '这里是 AI 的日记。之后可以做成 AI 主动写给你的每日观察、回应和小纸条。'}
          </div>
        </div>
      )
    }

    if (app === 'wallet') {
      return (
        <div className="os-wallet">
          <div className="piggy-bank" aria-hidden="true" />
          <strong>我们的存钱罐</strong>
          <b>¥ 8,520</b>
          <p>本月收入 ¥2,300 · 本月支出 ¥1,280</p>
          <button type="button">查看明细</button>
        </div>
      )
    }

    if (app === 'mail') {
      return (
        <div className="os-mail">
          {['收到了一封新信', 'AI 想给你写一张晚安卡', '日记有一条待整理'].map((item, index) => (
            <button type="button" key={item}>
              <span>{item}</span>
              <small>{index + 1}h ago</small>
            </button>
          ))}
        </div>
      )
    }

    if (app === 'settings') {
      return (
        <div className="os-settings">
          <label>
            <span>AI 接口</span>
            <input value={aiEndpoint ? '已配置 VITE_AI_ENDPOINT' : '未配置，当前为本地假数据'} readOnly />
          </label>
          <label>
            <span>天气</span>
            <input value={`${weatherLabels[weather]} · ${localWeather.label}`} readOnly />
          </label>
        </div>
      )
    }

    return (
      <div className="os-home-preview">
        <div className={`os-mini-room ${timeTone}`}>
          <span className="mini-window" />
          <span className="mini-table" />
          <span className="mini-cat" />
          <span className="mini-lamp" />
        </div>
        <div className="os-home-copy">
          <strong>家园先作为入口保留</strong>
          <p>我们先把电脑桌面系统跑通，家园美术后面再慢慢换成你真正喜欢的版本。</p>
        </div>
      </div>
    )
  }

  return (
    <section className={`pixel-os ${open ? 'open' : ''}`} aria-label="像素电脑桌面" aria-hidden={!open}>
      <div className="os-shell">
        <header className="os-topbar">
          <strong>澄澄 OS</strong>
          <span>{new Date().toLocaleDateString('zh-CN')} · {timeLabels[timeTone]} · {seasonLabels[season]}</span>
          <span>{weatherLabels[weather]} · {nowText}</span>
          <button type="button" onClick={onClose} aria-label="关闭电脑桌面">
            ×
          </button>
        </header>

        <div className="os-desktop">
          <nav className="os-icons" aria-label="桌面应用">
            {(Object.keys(osAppLabels) as OSApp[]).map((app) => (
              <button key={app} type="button" onClick={() => openApp(app)} className={focusedApp === app ? 'active' : ''}>
                <span className={`os-icon os-icon-${app}`} />
                <b>{osAppLabels[app]}</b>
              </button>
            ))}
          </nav>

          <div
            className={`os-windows ${windowDrag ? 'dragging' : ''}`}
            onPointerMove={moveWindow}
            onPointerUp={() => setWindowDrag(null)}
            onPointerCancel={() => setWindowDrag(null)}
          >
            {activeApps.map((app, index) => {
              const minimized = minimizedApps.includes(app)
              const maximized = maximizedApps.includes(app)
              const position = windowPositions[app] ?? { x: index * 22, y: index * 18 }
              return (
                <article
                  className={`os-window os-window-${app} ${focusedApp === app ? 'focused' : ''} ${
                    minimized ? 'minimized' : ''
                  } ${maximized ? 'maximized' : ''}`}
                  key={app}
                  style={
                    {
                      '--window-index': index,
                      '--window-x': `${position.x}px`,
                      '--window-y': `${position.y}px`,
                    } as CSSProperties
                  }
                  onMouseDown={() => {
                    if (!minimized) setFocusedApp(app)
                  }}
                >
                  <header onPointerDown={(event) => startWindowDrag(event, app, maximized)}>
                    <strong>{osAppLabels[app]}</strong>
                    <div>
                      <button type="button" aria-label={`最小化${osAppLabels[app]}`} onClick={() => minimizeApp(app)}>
                        -
                      </button>
                      <button
                        type="button"
                        aria-label={`${maximized ? '还原' : '放大'}${osAppLabels[app]}`}
                        onClick={() => toggleMaximizeApp(app)}
                      >
                        {maximized ? '❐' : '□'}
                      </button>
                      <button type="button" aria-label={`关闭${osAppLabels[app]}`} onClick={() => closeApp(app)}>
                        ×
                      </button>
                    </div>
                  </header>
                  {renderWindow(app)}
                </article>
              )
            })}
          </div>
        </div>

        <footer className="os-taskbar">
          <button type="button" onClick={() => openApp('home')}>开始</button>
          {activeApps.map((app) => (
            <button
              key={app}
              type="button"
              className={`${focusedApp === app ? 'active' : ''} ${minimizedApps.includes(app) ? 'minimized' : ''}`}
              onClick={() => openApp(app)}
            >
              {osAppLabels[app]}
            </button>
          ))}
        </footer>
      </div>
    </section>
  )
}

function App() {
  const fallbackNow = useMemo(() => new Date(), [])
  const [scene, setScene] = useState<Scene>('garden')
  const [weather, setWeather] = useState<Weather>('sunny')
  const [doorMoving, setDoorMoving] = useState(false)
  const [localWeather, setLocalWeather] = useState<LocalWeather>({
    source: 'fallback',
    label: '等待定位',
  })
  const [gardenLampOn, setGardenLampOn] = useState(true)
  const [chatOpen, setChatOpen] = useState(false)
  const [pixelOSOpen, setPixelOSOpen] = useState(false)
  const [diaryOpen, setDiaryOpen] = useState(false)
  const [userDiaryText, setUserDiaryText] = useState(() => window.localStorage.getItem(diaryStorageKey) ?? '')
  const [aiDiaryText, setAiDiaryText] = useState(() => window.localStorage.getItem(aiDiaryStorageKey) ?? '')
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>(() => loadDiaryEntries())
  const [userAvatarId, setUserAvatarId] = useState<AvatarId>(() => {
    const saved = window.localStorage.getItem(userAvatarStorageKey)
    return saved && saved in avatarLabels ? (saved as AvatarId) : 'boy'
  })
  const [partnerAvatarId, setPartnerAvatarId] = useState<AvatarId>(() => {
    const saved = window.localStorage.getItem(partnerAvatarStorageKey)
    return saved && saved in avatarLabels ? (saved as AvatarId) : 'cat'
  })
  const [userAvatarImage, setUserAvatarImage] = useState(() => window.localStorage.getItem(userAvatarImageStorageKey) ?? '')
  const [partnerAvatarImage, setPartnerAvatarImage] = useState(
    () => window.localStorage.getItem(partnerAvatarImageStorageKey) ?? '',
  )
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [draft, setDraft] = useState('')
  const [chatBusy, setChatBusy] = useState(false)
  const [decorEditing, setDecorEditing] = useState(false)
  const [decorItems, setDecorItems] = useState<DecorItem[]>(() => loadDecorItems())
  const [selectedDecorId, setSelectedDecorId] = useState<number | null>(null)

  const activeNow = localWeather.cityTime ?? fallbackNow
  const timeTone = getTimeTone(activeNow.getHours())
  const season = getSeason(activeNow.getMonth())
  const selectedDecorItem = decorItems.find((item) => item.id === selectedDecorId) ?? null
  const roomLampOn = decorItems.some((item) => item.scene === 'room' && item.kind === 'ceilingLamp' && item.lit)

  useEffect(() => {
    let cancelled = false

    if (!navigator.geolocation) {
      setLocalWeather({
        source: 'fallback',
        label: '无法定位，使用调试天气',
      })
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const nextWeather = await fetchLocalWeather(position.coords.latitude, position.coords.longitude)
          if (cancelled) return
          setLocalWeather(nextWeather)
          if (typeof nextWeather.code === 'number') {
            setWeather(mapWeatherCode(nextWeather.code))
          }
        } catch {
          if (!cancelled) {
            setLocalWeather({
              source: 'fallback',
              label: '天气获取失败，使用调试天气',
            })
          }
        }
      },
      () => {
        if (!cancelled) {
          setLocalWeather({
            source: 'fallback',
            label: '未授权定位，使用调试天气',
          })
        }
      },
      {
        enableHighAccuracy: false,
        maximumAge: 1000 * 60 * 20,
        timeout: 8000,
      },
    )

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem(decorStorageKey, JSON.stringify(decorItems))
  }, [decorItems])

  useEffect(() => {
    window.localStorage.setItem(diaryStorageKey, userDiaryText)
  }, [userDiaryText])

  useEffect(() => {
    window.localStorage.setItem(aiDiaryStorageKey, aiDiaryText)
  }, [aiDiaryText])

  useEffect(() => {
    window.localStorage.setItem(diaryEntriesStorageKey, JSON.stringify(diaryEntries))
  }, [diaryEntries])

  useEffect(() => {
    window.localStorage.setItem(userAvatarStorageKey, userAvatarId)
  }, [userAvatarId])

  useEffect(() => {
    window.localStorage.setItem(partnerAvatarStorageKey, partnerAvatarId)
  }, [partnerAvatarId])

  useEffect(() => {
    window.localStorage.setItem(userAvatarImageStorageKey, userAvatarImage)
  }, [userAvatarImage])

  useEffect(() => {
    window.localStorage.setItem(partnerAvatarImageStorageKey, partnerAvatarImage)
  }, [partnerAvatarImage])

  function addDecor(kind: DecorKind) {
    const defaults = scene === 'garden' ? { x: 52, y: 76 } : { x: 52, y: 82 }
    const item: DecorItem = {
      id: Date.now(),
      kind,
      scene,
      x: defaults.x,
      y: defaults.y,
      scale: decorCatalog[kind].defaultScale,
    }
    setDecorItems((current) => [...current, item])
    setSelectedDecorId(item.id)
  }

  function moveDecor(id: number, x: number, y: number) {
    setDecorItems((current) => current.map((item) => (item.id === id ? { ...item, x, y } : item)))
  }

  function scaleDecor(scale: number) {
    if (!selectedDecorItem) return
    setDecorItems((current) =>
      current.map((item) =>
        item.id === selectedDecorItem.id ? { ...item, scale: Math.max(0.55, Math.min(1.8, scale)) } : item,
      ),
    )
  }

  function toggleSelectedDecorLock() {
    if (!selectedDecorItem) return
    setDecorItems((current) =>
      current.map((item) => (item.id === selectedDecorItem.id ? { ...item, locked: !item.locked } : item)),
    )
  }

  function deleteSelectedDecor() {
    if (!selectedDecorItem) return
    setDecorItems((current) => current.filter((item) => item.id !== selectedDecorItem.id))
    setSelectedDecorId(null)
  }

  function clearSceneDecor() {
    setDecorItems((current) => current.filter((item) => item.scene !== scene))
    setSelectedDecorId(null)
  }

  function unlockSceneDecor() {
    setDecorItems((current) => current.map((item) => (item.scene === scene ? { ...item, locked: false } : item)))
  }

  function toggleDecorLamp(id: number) {
    setDecorItems((current) =>
      current.map((item) =>
        item.id === id && (item.kind === 'lamp' || item.kind === 'ceilingLamp') ? { ...item, lit: !item.lit } : item,
      ),
    )
  }

  function toggleDecorOpen(id: number) {
    setDecorItems((current) =>
      current.map((item) =>
        item.id === id && (item.kind === 'macbook' || item.kind === 'diary') ? { ...item, open: !item.open } : item,
      ),
    )
  }

  function submitDiary(side: 'user' | 'ai') {
    const text = (side === 'user' ? userDiaryText : aiDiaryText).trim()
    if (!text) return
    const entry: DiaryEntry = {
      id: Date.now(),
      side,
      text,
      createdAt: new Date().toISOString(),
    }
    setDiaryEntries((current) => [entry, ...current])
    if (side === 'user') setUserDiaryText('')
    if (side === 'ai') setAiDiaryText('')
  }

  async function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const text = draft.trim()
    if (!text || chatBusy) return

    const nextMessages: Message[] = [...messages, { id: Date.now(), from: 'you', text }]
    setMessages(nextMessages)
    setDraft('')

    if (!aiEndpoint) return

    setChatBusy(true)
    try {
      const response = await fetch(aiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: nextMessages.map((message) => ({
            role: message.from === 'you' ? 'user' : 'assistant',
            content: message.text,
          })),
        }),
      })
      if (!response.ok) {
        throw new Error(`AI request failed: ${response.status}`)
      }
      const data = (await response.json()) as { reply?: string; content?: string; message?: string }
      const reply = data.reply ?? data.content ?? data.message ?? '我听见了。'
      setMessages((current) => [...current, { id: Date.now() + 1, from: 'home', text: reply }])
    } catch {
      setMessages((current) => [...current, { id: Date.now() + 1, from: 'home', text: '连接 AI 失败，先把这句话留在茶间。' }])
    } finally {
      setChatBusy(false)
    }
  }

  function returnGarden() {
    setChatOpen(false)
    setPixelOSOpen(false)
    setScene('garden')
  }

  function enterRoom() {
    setDoorMoving(true)
    window.setTimeout(() => {
      setScene('room')
      setDoorMoving(false)
    }, 720)
  }

  return (
    <main
      className={`app-shell ${scene} ${weather} ${timeTone} ${season} ${
        gardenLampOn ? 'garden-lamp-on' : ''
      } ${roomLampOn ? 'room-lamp-on' : ''}`}
    >
      <AnimatedScene
        scene={scene}
        weather={weather}
        timeTone={timeTone}
        season={season}
        doorMoving={doorMoving}
        gardenLampOn={gardenLampOn}
        roomLampOn={roomLampOn}
        onEnterRoom={enterRoom}
        onBackGarden={returnGarden}
        onToggleGardenLamp={() => setGardenLampOn((value) => !value)}
      />

      <DecorLayer
        scene={scene}
        items={decorItems}
        editing={decorEditing}
        selectedId={selectedDecorId}
        onSelect={setSelectedDecorId}
        onMove={moveDecor}
        onActivate={(item) => {
          if (item.kind === 'lamp' || item.kind === 'ceilingLamp') toggleDecorLamp(item.id)
          if (item.kind === 'macbook') {
            if (!item.open) toggleDecorOpen(item.id)
            setPixelOSOpen(true)
          }
          if (item.kind === 'diary') {
            toggleDecorOpen(item.id)
            setDiaryOpen(!item.open)
          }
        }}
      />

      {scene === 'garden' ? <WeatherLayer weather={weather} /> : null}

      <DecorPanel
        scene={scene}
        editing={decorEditing}
        selectedItem={selectedDecorItem?.scene === scene ? selectedDecorItem : null}
        onToggle={() => {
          setDecorEditing((value) => !value)
          setSelectedDecorId(null)
        }}
        onAdd={addDecor}
        onScale={scaleDecor}
        onToggleLock={toggleSelectedDecorLock}
        onUnlockScene={unlockSceneDecor}
        onDelete={deleteSelectedDecor}
        onClearScene={clearSceneDecor}
      />

      <div className="status-bar">
        <div className="scene-chip">
          <b>{scene === 'garden' ? '庭院' : '茶间'}</b>
          <span>
            {timeLabels[timeTone]} · {seasonLabels[season]}
          </span>
          <small>
            {localWeather.source === 'auto' ? '自动天气' : '手动调试'} · {localWeather.label}
            {typeof localWeather.temperature === 'number' ? ` · ${Math.round(localWeather.temperature)}°C` : ''}
          </small>
        </div>
        {scene === 'garden' ? (
          <div className="toolbar-cluster">
            <div className="weather-switcher" aria-label="天气调试切换">
              {(Object.keys(weatherLabels) as Weather[]).map((item) => (
                <button
                  key={item}
                  className={weather === item ? 'selected' : ''}
                  type="button"
                  onClick={() => {
                    setWeather(item)
                    setLocalWeather((current) => ({
                      ...current,
                      source: current.source === 'auto' ? 'manual' : current.source,
                    }))
                  }}
                >
                  {weatherLabels[item]}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <PixelOS
        open={pixelOSOpen}
        messages={messages}
        draft={draft}
        userDiaryText={userDiaryText}
        aiDiaryText={aiDiaryText}
        diaryEntries={diaryEntries}
        userAvatarId={userAvatarId}
        partnerAvatarId={partnerAvatarId}
        userAvatarImage={userAvatarImage}
        partnerAvatarImage={partnerAvatarImage}
        timeTone={timeTone}
        season={season}
        weather={weather}
        localWeather={localWeather}
        onDraftChange={setDraft}
        onUserDiaryChange={setUserDiaryText}
        onAiDiaryChange={setAiDiaryText}
        onSubmitDiary={submitDiary}
        onUserAvatarChange={setUserAvatarId}
        onPartnerAvatarChange={setPartnerAvatarId}
        onUserAvatarImageChange={setUserAvatarImage}
        onPartnerAvatarImageChange={setPartnerAvatarImage}
        onSubmitMessage={submitMessage}
        onClose={() => setPixelOSOpen(false)}
      />

      <ChatPanel
        open={chatOpen && !pixelOSOpen}
        messages={messages}
        draft={draft}
        onDraftChange={setDraft}
        onSubmit={submitMessage}
        onClose={() => setChatOpen(false)}
      />
      <DiaryPanel open={diaryOpen} value={userDiaryText} onChange={setUserDiaryText} onClose={() => setDiaryOpen(false)} />
    </main>
  )
}

export default App
