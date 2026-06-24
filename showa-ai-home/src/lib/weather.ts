import type { LocalWeather, Season, TimeTone, Weather } from '../types'

export function mapWeatherCode(code: number): Weather {
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'snowy'
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82) || (code >= 95 && code <= 99)) {
    return 'rainy'
  }
  if ([0, 1].includes(code)) return 'sunny'
  return 'cloudy'
}

export function getTimeTone(hour: number): TimeTone {
  if (hour >= 5 && hour < 10) return 'morning'
  if (hour >= 10 && hour < 17) return 'day'
  if (hour >= 17 && hour < 20) return 'evening'
  return 'night'
}

export function getSeason(month: number): Season {
  if (month >= 2 && month <= 4) return 'spring'
  if (month >= 5 && month <= 7) return 'summer'
  if (month >= 8 && month <= 10) return 'autumn'
  return 'winter'
}

export async function fetchLocalWeather(latitude: number, longitude: number): Promise<LocalWeather> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: 'temperature_2m,weather_code,is_day,precipitation,rain,snowfall',
    timezone: 'auto',
    forecast_days: '1',
  })

  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`)
  if (!response.ok) {
    throw new Error(`Weather request failed: ${response.status}`)
  }

  const data = (await response.json()) as {
    timezone?: string
    current?: {
      time?: string
      temperature_2m?: number
      weather_code?: number
    }
  }

  const code = data.current?.weather_code
  const cityTime = data.current?.time ? new Date(data.current.time) : undefined

  return {
    source: 'auto',
    label: data.timezone?.replace('_', ' ') ?? '当前位置',
    temperature: data.current?.temperature_2m,
    code,
    cityTime,
  }
}
