import { useState, type CSSProperties, type FormEvent, type PointerEvent } from 'react'
import type { AvatarId, AvatarSide, DiaryEntry, LocalWeather, Message, OSApp, Season, TimeTone, Weather, WindowDrag, WindowPosition } from '../types'
import { aiEndpoint, avatarLabels, osAppLabels, seasonLabels, timeLabels, weatherLabels } from '../constants'
import { AvatarView } from './AvatarView'

export function PixelOS({
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
