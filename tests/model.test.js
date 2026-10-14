import test from 'node:test'
import assert from 'node:assert/strict'
import { nextDueDate, normalizeItem, completeItems, localDate } from '../src/model.js'
import { layoutEvents } from '../src/calendar.js'

test('local dates retain the calendar day', () => assert.equal(localDate(new Date(2026,9,14,0,15)), '2026-10-14'))
test('daily handles year boundary', () => assert.equal(nextDueDate('2026-12-31', {frequency:'daily'}), '2027-01-01'))
test('weekly selects next chosen weekday and wraps Sunday', () => {
  assert.equal(nextDueDate('2026-10-14', {frequency:'weekly',weekdays:[1,3,5]}), '2026-10-16')
  assert.equal(nextDueDate('2026-10-18', {frequency:'weekly',weekdays:[1]}), '2026-10-19')
})
test('monthly clamps February but preserves day 31 in March', () => {
  const rule = {frequency:'monthly',monthDay:31}
  assert.equal(nextDueDate('2026-01-31',rule),'2026-02-28')
  assert.equal(nextDueDate('2026-02-28',rule),'2026-03-31')
  assert.equal(nextDueDate('2026-01-10',rule),'2026-01-31')
})
test('annual leap day clamps and returns in leap years', () => {
  const rule = {frequency:'yearly',month:2,monthDay:29}
  assert.equal(nextDueDate('2024-02-29',rule),'2025-02-28')
  assert.equal(nextDueDate('2027-02-28',rule),'2028-02-29')
})
test('old tasks gain defaults without losing original fields', () => {
  const task = normalizeItem({id:'old',type:'task',priority:'high',title:'Keep me',dueDate:''})
  assert.equal(task.title,'Keep me');assert.equal(task.priority,'high');assert.equal(task.recurrence.frequency,'none');assert.equal(task.dueDate,null)
})
test('completion preserves history, advances once and never duplicates after undo', () => {
  const item = normalizeItem({id:'a',type:'task',title:'repeat',dueDate:'2026-10-14',recurrence:{frequency:'daily'}})
  const done = completeItems([item],'a')
  assert.equal(done.length,2);assert.equal(done[0].completed,true);assert.equal(done[1].dueDate,'2026-10-15');assert.equal(done[1].completed,false)
  assert.equal(completeItems(completeItems(done,'a'),'a').length,2)
  const next = completeItems(done,done[1].id)
  assert.equal(next.length,3);assert.equal(next[2].dueDate,'2026-10-16')
})
test('one-time task does not generate a successor', () => assert.equal(completeItems([normalizeItem({id:'a',type:'task'})],'a').length,1))
test('overlapping events get separate lanes; adjacent events reuse full width', () => {
  const layout = layoutEvents([{id:'a',startTime:'09:00',endTime:'11:00'},{id:'b',startTime:'10:00',endTime:'12:00'},{id:'c',startTime:'12:00',endTime:'13:00'}])
  assert.equal(layout[0].lanes,2);assert.notEqual(layout[0].lane,layout[1].lane);assert.equal(layout[2].lanes,1)
})
