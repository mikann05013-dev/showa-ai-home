import { useEffect, useState } from 'react'

type PersistedStateOptions<T> = {
  parse?: (value: string) => T
  serialize?: (value: T) => string
}

export function usePersistedState<T>(
  key: string,
  initialValue: T | (() => T),
  options: PersistedStateOptions<T> = {},
) {
  const [value, setValue] = useState<T>(() => {
    const fallback = typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue
    const saved = window.localStorage.getItem(key)
    if (saved === null) return fallback

    try {
      return options.parse ? options.parse(saved) : (saved as T)
    } catch {
      return fallback
    }
  })

  useEffect(() => {
    const serialized = options.serialize ? options.serialize(value) : String(value)
    window.localStorage.setItem(key, serialized)
  }, [key, options, value])

  return [value, setValue] as const
}
