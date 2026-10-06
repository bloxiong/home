import { useState } from 'react'
import { Button, Card, CardHeader, Field, Select, Textarea } from './ui'

/** Status + notes, shared with enquiries. Status saves on change; notes on Save. */
export default function TriagePanel({ item, statuses, onSave }) {
  const [notes, setNotes] = useState(item.notes || '')
  const [saving, setSaving] = useState(null)
  const dirty = notes !== (item.notes || '')

  async function save(patch, which) {
    setSaving(which)
    try {
      await onSave(patch)
    } finally {
      setSaving(null)
    }
  }

  return (
    <Card>
      <CardHeader title="Triage" />
      <div className="space-y-4 p-4 sm:p-5">
        <Field label="Status" htmlFor="status">
          <Select id="status" value={item.status} disabled={saving === 'status'} onChange={(e) => save({ status: e.target.value }, 'status')}>
            {statuses.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
          </Select>
        </Field>
        <Field label="Internal notes" htmlFor="notes" hint="Only admins see these.">
          <Textarea id="notes" rows={5} value={notes} maxLength={5000} onChange={(e) => setNotes(e.target.value)} placeholder="Add a note for the team…" />
        </Field>
        <div className="flex justify-end gap-2">
          {dirty && <Button variant="ghost" size="sm" onClick={() => setNotes(item.notes || '')}>Undo</Button>}
          <Button variant="primary" size="sm" disabled={!dirty} loading={saving === 'notes'} onClick={() => save({ notes }, 'notes')}>Save notes</Button>
        </div>
      </div>
    </Card>
  )
}
