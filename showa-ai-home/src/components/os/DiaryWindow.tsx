import type { DiaryEntry } from '../../types'

type DiarySide = 'user' | 'ai'

export function DiaryWindow({
  activeDiarySide,
  userDiaryText,
  aiDiaryText,
  diaryEntries,
  onActiveDiarySideChange,
  onUserDiaryChange,
  onAiDiaryChange,
  onSubmitDiary,
}: {
  activeDiarySide: DiarySide
  userDiaryText: string
  aiDiaryText: string
  diaryEntries: DiaryEntry[]
  onActiveDiarySideChange: (side: DiarySide) => void
  onUserDiaryChange: (value: string) => void
  onAiDiaryChange: (value: string) => void
  onSubmitDiary: (side: DiarySide) => void
}) {
  const currentDiaryText = activeDiarySide === 'user' ? userDiaryText : aiDiaryText
  const activeEntries = diaryEntries.filter((entry) => entry.side === activeDiarySide)

  return (
    <div className="os-diary">
      <div className="diary-tabs" role="tablist" aria-label="日记作者">
        <button
          className={activeDiarySide === 'user' ? 'selected' : ''}
          type="button"
          onClick={() => onActiveDiarySideChange('user')}
        >
          我的日记
        </button>
        <button
          className={activeDiarySide === 'ai' ? 'selected' : ''}
          type="button"
          onClick={() => onActiveDiarySideChange('ai')}
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
