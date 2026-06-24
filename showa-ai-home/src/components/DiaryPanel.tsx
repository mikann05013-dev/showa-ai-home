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
