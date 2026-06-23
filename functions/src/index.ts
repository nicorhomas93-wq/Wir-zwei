import { onRequest } from 'firebase-functions/v2/https'
import { onSchedule } from 'firebase-functions/v2/scheduler'
import { runReminderPushJob, sendImmediateTestPush } from './pushJob'

export const sendScheduledReminders = onSchedule(
  {
    schedule: 'every 5 minutes',
    timeZone: 'Europe/Berlin',
    region: 'europe-west1',
  },
  async () => {
    await runReminderPushJob()
  }
)

/** Manueller Test: GET ?secret=wir-zwei-test */
export const sendTestPush = onRequest(
  {
    region: 'europe-west1',
    cors: true,
  },
  async (req, res) => {
    const secret = process.env.TEST_PUSH_SECRET ?? 'wir-zwei-test'
    if (req.query.secret !== secret) {
      res.status(403).json({ ok: false, error: 'Forbidden' })
      return
    }

    try {
      const result = await sendImmediateTestPush()
      res.json({ ok: true, ...result })
    } catch (error) {
      console.error('[Wir Zwei] Test-Push fehlgeschlagen', error)
      res.status(500).json({ ok: false, error: String(error) })
    }
  }
)
