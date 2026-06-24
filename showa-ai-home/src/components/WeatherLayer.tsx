import type { CSSProperties } from 'react'
import type { Weather } from '../types'

export function WeatherLayer({ weather }: { weather: Weather }) {
  if (weather === 'rainy') {
    return (
      <div className="weather-layer rain" aria-hidden="true">
        {Array.from({ length: 68 }).map((_, index) => (
          <i
            key={index}
            style={
              {
                '--x': `${(index * 37) % 103}%`,
                '--delay': `${index * -54}ms`,
                '--duration': `${620 + (index % 5) * 80}ms`,
              } as CSSProperties
            }
          />
        ))}
      </div>
    )
  }

  if (weather === 'snowy') {
    return (
      <div className="weather-layer snow" aria-hidden="true">
        {Array.from({ length: 46 }).map((_, index) => (
          <i
            key={index}
            style={
              {
                '--x': `${(index * 29) % 101}%`,
                '--delay': `${index * -180}ms`,
                '--duration': `${4600 + (index % 6) * 420}ms`,
              } as CSSProperties
            }
          />
        ))}
      </div>
    )
  }

  return <div className="weather-layer dust" aria-hidden="true" />
}
