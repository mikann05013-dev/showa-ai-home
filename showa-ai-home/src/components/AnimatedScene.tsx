import type { Scene, Season, TimeTone, Weather } from '../types'
import { LivingGardenLayer } from './LivingGardenLayer'
import { RoomWindowLayer } from './RoomWindowLayer'

export function AnimatedScene({
  scene,
  weather,
  timeTone,
  season,
  doorMoving,
  gardenLampOn,
  roomLampOn,
  onEnterRoom,
  onBackGarden,
  onToggleGardenLamp,
}: {
  scene: Scene
  weather: Weather
  timeTone: TimeTone
  season: Season
  doorMoving: boolean
  gardenLampOn: boolean
  roomLampOn: boolean
  onEnterRoom: () => void
  onBackGarden: () => void
  onToggleGardenLamp: () => void
}) {
  const winterMode = weather === 'snowy' || season === 'winter'
  const activeLampOn = scene === 'garden' ? gardenLampOn : roomLampOn

  return (
    <section
      className={`art-stage ${scene} ${winterMode ? 'winter-art' : ''} ${activeLampOn ? 'lamp-on' : ''}`}
      aria-label="像素风昭和日式小家"
    >
      <div className="art-camera">
        <img className="scene-art garden-art base-art" src="/assets/showa-garden-clean.png" alt="" draggable="false" />
        <img
          className="scene-art garden-art winter-scene-art"
          src="/assets/showa-garden-closed-winter.png"
          alt=""
          draggable="false"
        />
        <img className="scene-art room-art" src="/assets/showa-room-empty-v1.png" alt="" draggable="false" />
        {scene === 'garden' && !winterMode ? <LivingGardenLayer /> : null}
        {scene === 'room' ? <RoomWindowLayer weather={weather} timeTone={timeTone} /> : null}
        <span className="lantern-glow lantern-left" aria-hidden="true" />
        <span className="lantern-glow lantern-right" aria-hidden="true" />
        {scene === 'garden' ? <span className="rain-glass" aria-hidden="true" /> : null}
        <span className={`season-wash ${weather}`} aria-hidden="true" />
      </div>

      {scene === 'garden' ? (
        <>
          <div className={`sliding-door ${doorMoving ? 'open' : ''}`} aria-hidden="true">
            <span className="door-room-peek" />
            <span className="panel left" />
            <span className="panel right" />
          </div>
          <button
            className="hotspot door-hotspot"
            type="button"
            onClick={onEnterRoom}
            aria-label="打开障子拉门进入室内"
            disabled={doorMoving}
          >
            <span>入室</span>
          </button>
          <button className="hotspot garden-lamp-hotspot" type="button" onClick={onToggleGardenLamp} aria-label="开关庭院灯">
            <span>{gardenLampOn ? '熄灯' : '点灯'}</span>
          </button>
        </>
      ) : (
        <>
          <button className="hotspot back-hotspot" type="button" onClick={onBackGarden} aria-label="回到庭院">
            <span>庭院</span>
          </button>
        </>
      )}
    </section>
  )
}
