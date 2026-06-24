import type { TimeTone, Weather } from '../types'

export function RoomWindowLayer({ weather, timeTone }: { weather: Weather; timeTone: TimeTone }) {
  return (
    <div className={`room-window-layer ${weather} ${timeTone}`} aria-hidden="true">
      <span className="room-window-view" />
    </div>
  )
}
