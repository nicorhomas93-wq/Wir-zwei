import type { AppData, PenaltyScores } from '../types'
import { getDueAnniversaries, toDateKey } from '../utils/relationshipMonth'

export const EMPTY_PENALTY_SCORES: PenaltyScores = { marie: 0, nico: 0 }

export function deriveScoresFromApplications(
  applications: AppData['penaltyApplications']
): PenaltyScores {
  const scores = { ...EMPTY_PENALTY_SCORES }
  for (const entry of applications) {
    if (entry.targetUserId === 'marie') scores.marie += 1
    else if (entry.targetUserId === 'nico') scores.nico += 1
  }
  return scores
}

function deductOnePoint(scores: PenaltyScores): PenaltyScores {
  return {
    marie: Math.max(0, scores.marie - 1),
    nico: Math.max(0, scores.nico - 1),
  }
}

/** Pro neuem Beziehungsmonat genau 1 Punkt abziehen — nie unter 0. */
export function processRelationshipMonthDeductions(data: AppData): AppData {
  const due = getDueAnniversaries(new Date(), data.penaltyMeta.lastProcessedAnniversary)
  if (due.length === 0) return data

  let scores = { ...data.penaltyScores }
  let lastProcessed = data.penaltyMeta.lastProcessedAnniversary
  const history = [...data.penaltyMonthHistory]

  for (const anniversary of due) {
    const scoresBefore = { ...scores }
    scores = deductOnePoint(scores)
    const anniversaryKey = toDateKey(anniversary)

    history.unshift({
      id: crypto.randomUUID(),
      anniversaryDate: anniversaryKey,
      scoresBefore,
      scoresAfter: { ...scores },
      processedAt: new Date().toISOString(),
    })

    lastProcessed = anniversaryKey
  }

  return {
    ...data,
    penaltyScores: scores,
    penaltyMeta: { lastProcessedAnniversary: lastProcessed },
    penaltyMonthHistory: history.slice(0, 36),
  }
}

export function mergePenaltyState(
  remote: AppData,
  local: AppData
): Pick<AppData, 'penaltyScores' | 'penaltyMeta' | 'penaltyMonthHistory'> {
  const remoteKey = remote.penaltyMeta.lastProcessedAnniversary
  const localKey = local.penaltyMeta.lastProcessedAnniversary
  const remoteTime = remoteKey ? Date.parse(remoteKey) : 0
  const localTime = localKey ? Date.parse(localKey) : 0

  const preferRemote = remoteTime >= localTime
  const base = preferRemote ? remote : local
  const other = preferRemote ? local : remote

  const historyMap = new Map<string, AppData['penaltyMonthHistory'][number]>()
  for (const entry of [...base.penaltyMonthHistory, ...other.penaltyMonthHistory]) {
    historyMap.set(entry.anniversaryDate, entry)
  }

  const history = [...historyMap.values()].sort(
    (a, b) => Date.parse(b.anniversaryDate) - Date.parse(a.anniversaryDate)
  )

  return {
    penaltyScores: { ...base.penaltyScores },
    penaltyMeta: { ...base.penaltyMeta },
    penaltyMonthHistory: history.slice(0, 36),
  }
}
