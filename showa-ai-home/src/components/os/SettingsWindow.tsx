import { aiEndpoint, weatherLabels } from '../../constants'
import type { LocalWeather, Weather } from '../../types'

export function SettingsWindow({ weather, localWeather }: { weather: Weather; localWeather: LocalWeather }) {
  return (
    <div className="os-settings">
      <label>
        <span>AI 接口</span>
        <input value={aiEndpoint ? '已配置 VITE_AI_ENDPOINT' : '未配置，当前为本地假数据'} readOnly />
      </label>
      <label>
        <span>天气</span>
        <input value={`${weatherLabels[weather]} · ${localWeather.label}`} readOnly />
      </label>
    </div>
  )
}
