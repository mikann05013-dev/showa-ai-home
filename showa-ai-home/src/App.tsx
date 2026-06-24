import { useEffect, useMemo, useState, type FormEvent } from 'react'
import './App.css'
import type { AvatarId, DecorItem, DecorKind, DiaryEntry, LocalWeather, Message, Scene, Weather } from './types'
import {
  aiDiaryStorageKey,
  aiEndpoint,
  avatarLabels,
  decorCatalog,
  decorStorageKey,
  diaryEntriesStorageKey,
  diaryStorageKey,
  initialMessages,
  partnerAvatarImageStorageKey,
  partnerAvatarStorageKey,
  seasonLabels,
  timeLabels,
  userAvatarImageStorageKey,
  userAvatarStorageKey,
  weatherLabels,
} from './constants'
import { usePersistedState } from './hooks/usePersistedState'
import { parseDecorItems, parseDiaryEntries } from './lib/storage'
import { fetchLocalWeather, getSeason, getTimeTone, mapWeatherCode } from './lib/weather'
import { AnimatedScene } from './components/AnimatedScene'
import { DecorLayer, DecorPanel } from './components/DecorSystem'
import { WeatherLayer } from './components/WeatherLayer'
import { PixelOS } from './components/PixelOS'
import { ChatPanel } from './components/ChatPanel'
import { DiaryPanel } from './components/DiaryPanel'

const decorPersistOptions = {
  parse: parseDecorItems,
  serialize: JSON.stringify,
}

const diaryEntriesPersistOptions = {
  parse: parseDiaryEntries,
  serialize: JSON.stringify,
}

const userAvatarPersistOptions = {
  parse: (value: string) => (value in avatarLabels ? (value as AvatarId) : 'boy'),
}

const partnerAvatarPersistOptions = {
  parse: (value: string) => (value in avatarLabels ? (value as AvatarId) : 'cat'),
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
  const [userDiaryText, setUserDiaryText] = usePersistedState(diaryStorageKey, '')
  const [aiDiaryText, setAiDiaryText] = usePersistedState(aiDiaryStorageKey, '')
  const [diaryEntries, setDiaryEntries] = usePersistedState<DiaryEntry[]>(
    diaryEntriesStorageKey,
    [],
    diaryEntriesPersistOptions,
  )
  const [userAvatarId, setUserAvatarId] = usePersistedState<AvatarId>(userAvatarStorageKey, 'boy', userAvatarPersistOptions)
  const [partnerAvatarId, setPartnerAvatarId] = usePersistedState<AvatarId>(
    partnerAvatarStorageKey,
    'cat',
    partnerAvatarPersistOptions,
  )
  const [userAvatarImage, setUserAvatarImage] = usePersistedState(userAvatarImageStorageKey, '')
  const [partnerAvatarImage, setPartnerAvatarImage] = usePersistedState(partnerAvatarImageStorageKey, '')
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [draft, setDraft] = useState('')
  const [chatBusy, setChatBusy] = useState(false)
  const [decorEditing, setDecorEditing] = useState(false)
  const [decorItems, setDecorItems] = usePersistedState<DecorItem[]>(decorStorageKey, [], decorPersistOptions)
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
        environment={{ timeTone, season, weather, localWeather }}
        chat={{
          messages,
          draft,
          onDraftChange: setDraft,
          onSubmitMessage: submitMessage,
        }}
        diary={{
          userText: userDiaryText,
          aiText: aiDiaryText,
          entries: diaryEntries,
          onUserTextChange: setUserDiaryText,
          onAiTextChange: setAiDiaryText,
          onSubmit: submitDiary,
        }}
        avatars={{
          userId: userAvatarId,
          partnerId: partnerAvatarId,
          userImage: userAvatarImage,
          partnerImage: partnerAvatarImage,
          onUserIdChange: setUserAvatarId,
          onPartnerIdChange: setPartnerAvatarId,
          onUserImageChange: setUserAvatarImage,
          onPartnerImageChange: setPartnerAvatarImage,
        }}
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
