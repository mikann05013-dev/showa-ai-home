const memoryCards = [
  ['一起去赏花', '1998-04-03', '春天的照片被收进记忆库。'],
  ['烟花大会', '1997-08-16', '夜空很亮，心也安静了一会儿。'],
  ['海边小站', '1997-07-21', '风吹过站台，像一张旧明信片。'],
]

export function MemoryWindow() {
  return (
    <div className="os-memory-grid">
      {memoryCards.map(([title, date, text]) => (
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
