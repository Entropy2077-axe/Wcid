import { format, addDays, parseISO } from 'date-fns'

export const localDate = (date = new Date()) => format(date, 'yyyy-MM-dd')
export const uid = () => {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('')
}
export const priorities = { low: '低 · 绿', medium: '普通 · 蓝', high: '高 · 紫', urgent: '最高 · 金' }
export const noRepeat = () => ({ frequency: 'none', weekdays: [], monthDay: 1, month: 1 })
export function normalizeItem(item) {
  return item.type === 'task' ? { description: '', completed: false, recurrence: noRepeat(), ...item, dueDate: item.dueDate || null } : item
}
function clampedDate(year, month, day) {
  return new Date(year, month, Math.min(day, new Date(year, month + 1, 0).getDate()))
}
// Advance from the previous deadline (not completion time); retain missed occurrences.
export function nextDueDate(dueDate, rule) {
  if (!dueDate || !rule || rule.frequency === 'none') return null
  const date = parseISO(dueDate)
  if (rule.frequency === 'daily') return localDate(addDays(date, 1))
  if (rule.frequency === 'weekly') {
    const days = rule.weekdays?.length ? rule.weekdays : [date.getDay()]
    for (let step = 1; step <= 7; step++) {
      const next = addDays(date, step)
      if (days.includes(next.getDay())) return localDate(next)
    }
  }
  if (rule.frequency === 'monthly') {
    let next = clampedDate(date.getFullYear(), date.getMonth(), rule.monthDay)
    if (next <= date) next = clampedDate(date.getFullYear(), date.getMonth() + 1, rule.monthDay)
    return localDate(next)
  }
  if (rule.frequency === 'yearly') {
    let next = clampedDate(date.getFullYear(), rule.month - 1, rule.monthDay)
    if (next <= date) next = clampedDate(date.getFullYear() + 1, rule.month - 1, rule.monthDay)
    return localDate(next)
  }
  return null
}
export function recurrenceLabel(rule) {
  if (!rule || rule.frequency === 'none') return ''
  if (rule.frequency === 'daily') return '每天'
  if (rule.frequency === 'weekly') return `每周${(rule.weekdays || []).map(d => '日一二三四五六'[d]).join('、')}`
  if (rule.frequency === 'monthly') return `每月 ${rule.monthDay} 日`
  return `每年 ${rule.month} 月 ${rule.monthDay} 日`
}
export function completeItems(items, id) {
  const task = items.find(item => item.id === id)
  if (!task || task.type !== 'task') return items
  const result = items.map(item => item.id === id ? { ...item, completed: !item.completed } : item)
  const dueDate = nextDueDate(task.dueDate, task.recurrence)
  // Keep the link even after undo/delete: rechecking must never create duplicates.
  if (!task.completed && dueDate && !task.nextOccurrenceId) {
    const nextId = uid()
    result.find(item => item.id === id).nextOccurrenceId = nextId
    const { nextOccurrenceId, ...copy } = task
    result.push({ ...copy, id: nextId, dueDate, completed: false, createdAt: new Date().toISOString() })
  }
  return result
}
