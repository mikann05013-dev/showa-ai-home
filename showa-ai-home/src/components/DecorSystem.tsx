import { useState, type CSSProperties, type PointerEvent } from 'react'
import type { DecorItem, DecorKind, Scene } from '../types'
import { decorCatalog } from '../constants'

export function DecorLayer({
  scene,
  items,
  editing,
  selectedId,
  onSelect,
  onMove,
  onActivate,
}: {
  scene: Scene
  items: DecorItem[]
  editing: boolean
  selectedId: number | null
  onSelect: (id: number | null) => void
  onMove: (id: number, x: number, y: number) => void
  onActivate: (item: DecorItem) => void
}) {
  const [draggingId, setDraggingId] = useState<number | null>(null)
  const visibleItems = items.filter((item) => item.scene === scene)

  function pointToPercent(event: PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    return {
      x: Math.max(2, Math.min(98, ((event.clientX - rect.left) / rect.width) * 100)),
      y: Math.max(8, Math.min(98, ((event.clientY - rect.top) / rect.height) * 100)),
    }
  }

  function moveSelected(event: PointerEvent<HTMLDivElement>) {
    if (!editing || draggingId === null) return
    const next = pointToPercent(event)
    onMove(draggingId, next.x, next.y)
  }

  return (
    <div
      className={`decor-layer ${editing ? 'editing' : ''}`}
      onPointerMove={moveSelected}
      onPointerUp={() => setDraggingId(null)}
      onPointerCancel={() => setDraggingId(null)}
      onPointerLeave={() => setDraggingId(null)}
      aria-hidden={!editing}
    >
      {visibleItems.map((item) => {
        const meta = decorCatalog[item.kind]
        const layerIndex = items.findIndex((candidate) => candidate.id === item.id)
        const src = item.open && meta.openSrc ? meta.openSrc : meta.src
        return (
          <button
            className={`decor-item ${meta.className} ${item.lit ? 'lit' : ''} ${item.open ? 'open' : ''} ${
              item.locked ? 'locked' : ''
            } ${
              selectedId === item.id ? 'selected' : ''
            }`}
            key={item.id}
            type="button"
            style={
              {
                '--x': `${item.x}%`,
                '--y': `${item.y}%`,
                '--scale': item.scale,
                '--z': 100 + layerIndex,
              } as CSSProperties
            }
            onPointerDown={(event) => {
              if (!editing) return
              if (item.locked) return
              event.preventDefault()
              event.currentTarget.setPointerCapture(event.pointerId)
              setDraggingId(item.id)
              onSelect(item.id)
            }}
            onClick={() => {
              if (!editing) onActivate(item)
            }}
            aria-label={`${item.locked ? '已锁定' : '移动'}${meta.label}`}
          >
            <img
              className="decor-pixel"
              src={src}
              alt=""
              draggable="false"
              style={{ width: `${meta.width}px` }}
              aria-hidden="true"
            />
            <span className="decor-label">{meta.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export function DecorPanel({
  scene,
  editing,
  selectedItem,
  onToggle,
  onAdd,
  onScale,
  onToggleLock,
  onUnlockScene,
  onDelete,
  onClearScene,
}: {
  scene: Scene
  editing: boolean
  selectedItem: DecorItem | null
  onToggle: () => void
  onAdd: (kind: DecorKind) => void
  onScale: (scale: number) => void
  onToggleLock: () => void
  onUnlockScene: () => void
  onDelete: () => void
  onClearScene: () => void
}) {
  return (
    <aside className={`decor-panel ${editing ? 'open' : ''}`} aria-label="布置模式">
      <button className="decor-toggle" type="button" onClick={onToggle}>
        {editing ? '完成' : '布置'}
      </button>
      {editing ? (
        <div className="decor-tools">
          <strong>{scene === 'garden' ? '庭院物件' : '房间家具'}</strong>
          <div className="decor-catalog">
            {(Object.keys(decorCatalog) as DecorKind[]).map((kind) => (
              <button key={kind} type="button" onClick={() => onAdd(kind)}>
                {decorCatalog[kind].label}
              </button>
            ))}
          </div>
          <label>
            <span>大小</span>
            <input
              type="range"
              min="0.55"
              max="1.8"
              step="0.05"
              value={selectedItem?.scale ?? 1}
              disabled={!selectedItem}
              onChange={(event) => onScale(Number(event.target.value))}
            />
          </label>
          <div className="decor-actions">
            <button type="button" disabled={!selectedItem} onClick={onToggleLock}>
              {selectedItem?.locked ? '解锁' : '锁定'}
            </button>
            <button type="button" disabled={!selectedItem} onClick={onDelete}>
              删除
            </button>
            <button type="button" onClick={onUnlockScene}>
              全解锁
            </button>
            <button type="button" onClick={onClearScene}>
              清空本场景
            </button>
          </div>
        </div>
      ) : null}
    </aside>
  )
}
