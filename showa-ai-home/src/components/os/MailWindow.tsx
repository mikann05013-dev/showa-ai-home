const mailItems = ['收到了一封新信', 'AI 想给你写一张晚安卡', '日记有一条待整理']

export function MailWindow() {
  return (
    <div className="os-mail">
      {mailItems.map((item, index) => (
        <button type="button" key={item}>
          <span>{item}</span>
          <small>{index + 1}h ago</small>
        </button>
      ))}
    </div>
  )
}
