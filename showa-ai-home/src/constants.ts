import type { AvatarId, DecorKind, DecorMeta, Message, OSApp, Season, TimeTone, Weather } from './types'

export const weatherLabels: Record<Weather, string> = {
  sunny: '晴',
  rainy: '雨',
  snowy: '雪',
  cloudy: '阴',
}

export const timeLabels: Record<TimeTone, string> = {
  morning: '早晨',
  day: '白天',
  evening: '黄昏',
  night: '夜晚',
}

export const seasonLabels: Record<Season, string> = {
  spring: '春',
  summer: '夏',
  autumn: '秋',
  winter: '冬',
}

export const osAppLabels: Record<OSApp, string> = {
  home: '我的主页',
  chat: '聊天室',
  memory: '记忆库',
  diary: '日记本',
  wallet: '存钱罐',
  mail: '信箱',
  settings: '设置',
}

export const initialMessages: Message[] = [
  { id: 1, from: 'home', text: '廊下的灯已经亮了。' },
  { id: 2, from: 'you', text: '今天适合做什么？' },
  { id: 3, from: 'home', text: '听水声，煮茶，然后把心事慢慢放回抽屉。' },
]

export const aiEndpoint = import.meta.env.VITE_AI_ENDPOINT as string | undefined
export const gardenArtSize = { width: 1672, height: 941 }
export const decorStorageKey = 'showa-decor-items'

export const diaryStorageKey = 'showa-diary-text'
export const aiDiaryStorageKey = 'showa-ai-diary-text'
export const diaryEntriesStorageKey = 'showa-diary-entries'
export const userAvatarStorageKey = 'showa-chat-user-avatar'
export const partnerAvatarStorageKey = 'showa-chat-partner-avatar'
export const userAvatarImageStorageKey = 'showa-chat-user-avatar-image'
export const partnerAvatarImageStorageKey = 'showa-chat-partner-avatar-image'

export const avatarLabels: Record<AvatarId, string> = {
  boy: '昭和少年',
  girl: '紫阳花少女',
  cat: '茶间小猫',
  bunny: '白兔伙伴',
}

export const decorCatalog: Record<DecorKind, DecorMeta> = {
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
