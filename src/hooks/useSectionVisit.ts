import { useEffect } from 'react'
import { markSectionSeen, type SectionKey } from '../storage/meta'

export function useSectionVisit(section: SectionKey): void {
  useEffect(() => {
    markSectionSeen(section)
  }, [section])
}
