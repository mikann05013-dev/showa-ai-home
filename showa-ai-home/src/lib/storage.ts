import type { DecorItem, DiaryEntry } from '../types'
import { decorCatalog, decorStorageKey, diaryEntriesStorageKey } from '../constants'

export function loadDecorItems(): DecorItem[] {
  try {
    const saved = window.localStorage.getItem(decorStorageKey)
    if (!saved) return []
    const parsed = JSON.parse(saved) as Array<Omit<Partial<DecorItem>, 'kind'> & { kind?: string }>
    return parsed
      .map((item) => ({ ...item, kind: item.kind === 'computer' ? 'macbook' : item.kind }) as DecorItem)
      .filter(
        (item) =>
        typeof item.id === 'number' &&
        item.scene &&
        item.kind in decorCatalog &&
        typeof item.x === 'number' &&
        typeof item.y === 'number' &&
        typeof item.scale === 'number',
      )
  } catch {
    return []
  }
}

export function loadDiaryEntries(): DiaryEntry[] {
  try {
    const saved = window.localStorage.getItem(diaryEntriesStorageKey)
    if (!saved) return []
    const parsed = JSON.parse(saved) as DiaryEntry[]
    return parsed.filter(
      (entry) =>
        typeof entry.id === 'number' &&
        (entry.side === 'user' || entry.side === 'ai') &&
        typeof entry.text === 'string' &&
        typeof entry.createdAt === 'string',
    )
  } catch {
    return []
  }
}
