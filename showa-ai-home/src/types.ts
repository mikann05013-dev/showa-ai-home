export type Scene = 'garden' | 'room'
export type Weather = 'sunny' | 'rainy' | 'snowy' | 'cloudy'
export type TimeTone = 'morning' | 'day' | 'evening' | 'night'
export type Season = 'spring' | 'summer' | 'autumn' | 'winter'
export type OSApp = 'home' | 'chat' | 'memory' | 'diary' | 'wallet' | 'mail' | 'settings'
export type AvatarId = 'boy' | 'girl' | 'cat' | 'bunny'
export type AvatarSide = 'user' | 'partner'

export type Message = {
  id: number
  from: 'home' | 'you'
  text: string
}

export type DiaryEntry = {
  id: number
  side: 'user' | 'ai'
  text: string
  createdAt: string
}

export type DecorKind =
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

export type DecorMeta = {
  label: string
  className: string
  defaultScale: number
  src: string
  openSrc?: string
  width: number
}

export type DecorItem = {
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

export type WeatherSource = 'auto' | 'manual' | 'fallback'

export type LocalWeather = {
  source: WeatherSource
  label: string
  temperature?: number
  code?: number
  cityTime?: Date
}

export type WindowPosition = {
  x: number
  y: number
}

export type WindowDrag = {
  app: OSApp
  startX: number
  startY: number
  originX: number
  originY: number
}
