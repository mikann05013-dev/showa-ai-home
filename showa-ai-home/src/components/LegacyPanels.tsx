import type { FormEvent } from 'react'
import type { Message } from '../types'

export function ChatPanel({
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

export function DiaryPanel({
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
