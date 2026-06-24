import { useState, type FormEvent } from 'react'
import { avatarLabels } from '../../constants'
import type { AvatarId, AvatarSide, Message } from '../../types'
import { AvatarView } from '../AvatarView'

export function ChatWindow({
  messages,
  draft,
  userAvatarId,
  partnerAvatarId,
  userAvatarImage,
  partnerAvatarImage,
  onDraftChange,
  onUserAvatarChange,
  onPartnerAvatarChange,
  onUserAvatarImageChange,
  onPartnerAvatarImageChange,
  onSubmitMessage,
}: {
  messages: Message[]
  draft: string
  userAvatarId: AvatarId
  partnerAvatarId: AvatarId
  userAvatarImage: string
  partnerAvatarImage: string
  onDraftChange: (value: string) => void
  onUserAvatarChange: (value: AvatarId) => void
  onPartnerAvatarChange: (value: AvatarId) => void
  onUserAvatarImageChange: (value: string) => void
  onPartnerAvatarImageChange: (value: string) => void
  onSubmitMessage: (event: FormEvent<HTMLFormElement>) => void
}) {
  const [avatarEditor, setAvatarEditor] = useState<AvatarSide | null>(null)

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
        <AvatarEditor
          side={avatarEditor}
          userAvatarId={userAvatarId}
          partnerAvatarId={partnerAvatarId}
          userAvatarImage={userAvatarImage}
          partnerAvatarImage={partnerAvatarImage}
          onClose={() => setAvatarEditor(null)}
          onUserAvatarChange={onUserAvatarChange}
          onPartnerAvatarChange={onPartnerAvatarChange}
          onUserAvatarImageChange={onUserAvatarImageChange}
          onPartnerAvatarImageChange={onPartnerAvatarImageChange}
          onUpload={updateCustomAvatar}
        />
      ) : null}
    </div>
  )
}

function AvatarEditor({
  side,
  userAvatarId,
  partnerAvatarId,
  userAvatarImage,
  partnerAvatarImage,
  onClose,
  onUserAvatarChange,
  onPartnerAvatarChange,
  onUserAvatarImageChange,
  onPartnerAvatarImageChange,
  onUpload,
}: {
  side: AvatarSide
  userAvatarId: AvatarId
  partnerAvatarId: AvatarId
  userAvatarImage: string
  partnerAvatarImage: string
  onClose: () => void
  onUserAvatarChange: (value: AvatarId) => void
  onPartnerAvatarChange: (value: AvatarId) => void
  onUserAvatarImageChange: (value: string) => void
  onPartnerAvatarImageChange: (value: string) => void
  onUpload: (side: AvatarSide, file: File | undefined) => void
}) {
  const isUser = side === 'user'
  const activeAvatar = isUser ? userAvatarId : partnerAvatarId
  const activeImage = isUser ? userAvatarImage : partnerAvatarImage

  return (
    <div className="avatar-editor" role="dialog" aria-label="更换头像">
      <div className="avatar-editor-panel">
        <header>
          <strong>{isUser ? '更换我的头像' : '更换对方头像'}</strong>
          <button type="button" onClick={onClose} aria-label="关闭头像设置">
            ×
          </button>
        </header>
        <div className="avatar-editor-preview">
          <AvatarView avatarId={activeAvatar} customImage={activeImage} />
          <span>{activeImage ? (isUser ? '我的自定义头像' : '对方自定义头像') : avatarLabels[activeAvatar]}</span>
        </div>
        <div className="avatar-picker" aria-label="选择内置头像">
          {(Object.keys(avatarLabels) as AvatarId[]).map((avatar) => (
            <button
              className={activeAvatar === avatar && !activeImage ? 'selected' : ''}
              key={avatar}
              type="button"
              onClick={() => {
                if (isUser) {
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
          <input accept="image/*" type="file" onChange={(event) => onUpload(side, event.target.files?.[0])} />
        </label>
        <button
          className="avatar-clear"
          type="button"
          onClick={() => {
            if (isUser) onUserAvatarImageChange('')
            if (!isUser) onPartnerAvatarImageChange('')
          }}
        >
          清除导入图
        </button>
      </div>
    </div>
  )
}
