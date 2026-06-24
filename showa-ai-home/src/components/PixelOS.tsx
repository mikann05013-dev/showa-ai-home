import { useState, type CSSProperties, type FormEvent, type PointerEvent } from 'react'
import type { AvatarId, DiaryEntry, LocalWeather, Message, OSApp, Season, TimeTone, Weather, WindowDrag, WindowPosition } from '../types'
import { osAppLabels, seasonLabels, timeLabels, weatherLabels } from '../constants'
import { ChatWindow } from './os/ChatWindow'
import { DiaryWindow } from './os/DiaryWindow'
import { HomeWindow } from './os/HomeWindow'
import { MailWindow } from './os/MailWindow'
import { MemoryWindow } from './os/MemoryWindow'
import { SettingsWindow } from './os/SettingsWindow'
import { WalletWindow } from './os/WalletWindow'

type PixelOSProps = {
  open: boolean
  environment: {
    timeTone: TimeTone
    season: Season
    weather: Weather
    localWeather: LocalWeather
  }
  chat: {
    messages: Message[]
    draft: string
    onDraftChange: (value: string) => void
    onSubmitMessage: (event: FormEvent<HTMLFormElement>) => void
  }
  diary: {
    userText: string
    aiText: string
    entries: DiaryEntry[]
    onUserTextChange: (value: string) => void
    onAiTextChange: (value: string) => void
    onSubmit: (side: 'user' | 'ai') => void
  }
  avatars: {
    userId: AvatarId
    partnerId: AvatarId
    userImage: string
    partnerImage: string
    onUserIdChange: (value: AvatarId) => void
    onPartnerIdChange: (value: AvatarId) => void
    onUserImageChange: (value: string) => void
    onPartnerImageChange: (value: string) => void
  }
  onClose: () => void
}

const initialWindowPositions: Record<OSApp, WindowPosition> = {
  home: { x: 12, y: 8 },
  chat: { x: 52, y: 16 },
  memory: { x: 18, y: 48 },
  diary: { x: 28, y: 28 },
  wallet: { x: 38, y: 36 },
  mail: { x: 34, y: 32 },
  settings: { x: 42, y: 40 },
}

export function PixelOS({ open, environment, chat, diary, avatars, onClose }: PixelOSProps) {
  const { timeTone, season, weather, localWeather } = environment
  const [activeApps, setActiveApps] = useState<OSApp[]>(['home', 'chat', 'memory'])
  const [focusedApp, setFocusedApp] = useState<OSApp>('chat')
  const [minimizedApps, setMinimizedApps] = useState<OSApp[]>([])
  const [maximizedApps, setMaximizedApps] = useState<OSApp[]>([])
  const [activeDiarySide, setActiveDiarySide] = useState<'user' | 'ai'>('user')
  const [windowPositions, setWindowPositions] = useState<Record<OSApp, WindowPosition>>(initialWindowPositions)
  const [windowDrag, setWindowDrag] = useState<WindowDrag | null>(null)

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

  function renderWindow(app: OSApp) {
    if (app === 'chat') {
      return (
        <ChatWindow
          messages={chat.messages}
          draft={chat.draft}
          userAvatarId={avatars.userId}
          partnerAvatarId={avatars.partnerId}
          userAvatarImage={avatars.userImage}
          partnerAvatarImage={avatars.partnerImage}
          onDraftChange={chat.onDraftChange}
          onUserAvatarChange={avatars.onUserIdChange}
          onPartnerAvatarChange={avatars.onPartnerIdChange}
          onUserAvatarImageChange={avatars.onUserImageChange}
          onPartnerAvatarImageChange={avatars.onPartnerImageChange}
          onSubmitMessage={chat.onSubmitMessage}
        />
      )
    }

    if (app === 'diary') {
      return (
        <DiaryWindow
          activeDiarySide={activeDiarySide}
          userDiaryText={diary.userText}
          aiDiaryText={diary.aiText}
          diaryEntries={diary.entries}
          onActiveDiarySideChange={setActiveDiarySide}
          onUserDiaryChange={diary.onUserTextChange}
          onAiDiaryChange={diary.onAiTextChange}
          onSubmitDiary={diary.onSubmit}
        />
      )
    }

    if (app === 'memory') return <MemoryWindow />
    if (app === 'wallet') return <WalletWindow />
    if (app === 'mail') return <MailWindow />
    if (app === 'settings') return <SettingsWindow weather={weather} localWeather={localWeather} />
    return <HomeWindow timeTone={timeTone} />
  }

  return (
    <section className={`pixel-os ${open ? 'open' : ''}`} aria-label="像素电脑桌面" aria-hidden={!open}>
      <div className="os-shell">
        <header className="os-topbar">
          <strong>澄澄 OS</strong>
          <span>
            {new Date().toLocaleDateString('zh-CN')} · {timeLabels[timeTone]} · {seasonLabels[season]}
          </span>
          <span>
            {weatherLabels[weather]} · {nowText}
          </span>
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
          <button type="button" onClick={() => openApp('home')}>
            开始
          </button>
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
