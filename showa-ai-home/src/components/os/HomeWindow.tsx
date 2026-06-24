import type { TimeTone } from '../../types'

export function HomeWindow({ timeTone }: { timeTone: TimeTone }) {
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
