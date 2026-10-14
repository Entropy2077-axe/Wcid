import { useState, useEffect, useRef } from 'react'
import useStore from '../store.js'
import './AddModal.css'

import { localDate as today, uid, noRepeat, priorities } from '../model.js'

function emptyTask() {
  return { type: 'task', title: '', dueDate: '', priority: 'medium', description: '', recurrence: noRepeat() }
}
function emptySchedule() {
  return { type: 'schedule', title: '', date: today(), startTime: '', endTime: '', description: '' }
}

export default function AddModal({ editingItem, defaultTab, initialDate, onClose }) {
  const addItem = useStore((s) => s.addItem)
  const updateItem = useStore((s) => s.updateItem)

  const isEdit = Boolean(editingItem)
  const [itemType, setItemType] = useState(editingItem?.type ?? (defaultTab === 'schedule' ? 'schedule' : 'task'))
  const [form, setForm] = useState(() => {
    if (editingItem) return { ...editingItem }
    return itemType === 'schedule' ? { ...emptySchedule(), date: initialDate || today() } : emptyTask()
  })
  const [errors, setErrors] = useState({})
  const titleRef = useRef(null)

  useEffect(() => {
    const previous = document.activeElement
    titleRef.current?.focus()
    function keyboard(e) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Tab') {
        const nodes = [...document.querySelectorAll('.modal-sheet button, .modal-sheet input, .modal-sheet select, .modal-sheet textarea')].filter(n => !n.disabled && n.getClientRects().length)
        const first = nodes[0], last = nodes[nodes.length - 1]
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown', keyboard)
    return () => { document.removeEventListener('keydown', keyboard); previous?.focus() }
  }, [])

  function switchType(t) {
    setItemType(t)
    setForm(t === 'schedule' ? emptySchedule() : emptyTask())
    setErrors({})
  }

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
    if (errors[field]) setErrors((e) => ({ ...e, [field]: null }))
  }

  function validate() {
    const e = {}
    if (!form.title.trim()) e.title = '请输入标题'
    if (form.type === 'schedule') {
      if (!form.date) e.date = '请选择日期'
      if (!form.startTime) e.startTime = '请选择开始时间'
      if (!form.endTime) e.endTime = '请选择结束时间'
      if (form.startTime && form.endTime && form.endTime <= form.startTime) {
        e.endTime = '结束时间必须晚于开始时间'
      }
    }
    if (form.type === 'task' && form.recurrence?.frequency !== 'none') {
      if (!form.dueDate) e.dueDate = '重复任务需要截止日期，作为首次执行日期'
      if (form.recurrence?.frequency === 'weekly' && !form.recurrence.weekdays.length) e.recurrence = '请至少选择一个星期'
      if (['monthly', 'yearly'].includes(form.recurrence?.frequency) && !(Number.isInteger(form.recurrence.monthDay) && form.recurrence.monthDay >= 1 && form.recurrence.monthDay <= 31)) e.recurrence = '日期必须为 1–31'
      if (form.recurrence?.frequency === 'yearly' && form.recurrence.monthDay > new Date(2000, form.recurrence.month, 0).getDate()) e.recurrence = '该月份不存在这个日期'
    }
    return e
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    if (isEdit) {
      updateItem(editingItem.id, { ...form, title: form.title.trim(), dueDate: form.dueDate || null })
    } else {
      addItem({ ...form, title: form.title.trim(), id: uid(), completed: false, createdAt: new Date().toISOString() })
    }
    onClose()
  }

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick} role="dialog" aria-modal="true" aria-label={isEdit ? '编辑' : '新建'}>
      <div className="modal-sheet">
        <div className="modal-header">
          <span className="modal-heading">{isEdit ? '编辑' : '新建'}</span>
          <button className="modal-close" onClick={onClose} aria-label="关闭">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {!isEdit && (
          <div className="type-toggle" role="group" aria-label="类型">
            <button className={itemType === 'task' ? 'type-btn active' : 'type-btn'} onClick={() => switchType('task')}>任务</button>
            <button className={itemType === 'schedule' ? 'type-btn active' : 'type-btn'} onClick={() => switchType('schedule')}>日程</button>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label className="field-label" htmlFor="f-title">标题</label>
            <input
              id="f-title" ref={titleRef} className={errors.title ? 'field-input error' : 'field-input'}
              value={form.title} onChange={(e) => set('title', e.target.value)}
              placeholder={itemType === 'schedule' ? '例如：团队会议' : '例如：完成报告'}
              autoComplete="off"
            />
            {errors.title && <span className="field-error" role="alert">{errors.title}</span>}
          </div>

          {itemType === 'task' && (
            <>
              <div className="field">
                <label className="field-label" htmlFor="f-due">截止日期（可选）</label>
                <input id="f-due" type="date" className="field-input" value={form.dueDate || ''} onChange={(e) => set('dueDate', e.target.value)} />
              </div>
              {errors.dueDate && <p className="field-error" role="alert">{errors.dueDate}</p>}
              <div className="field"><label className="field-label" htmlFor="task-description">描述（可选）</label><textarea id="task-description" className="field-input field-textarea" value={form.description || ''} onChange={e => set('description', e.target.value)} /></div>
              <fieldset className="field priority-fieldset">
                <legend className="field-label">优先级</legend>
                <div className="priority-options">
                  {Object.keys(priorities).map((p) => (
                    <label key={p} className={form.priority === p ? 'priority-opt active' : 'priority-opt'}>
                      <input type="radio" name="priority" value={p} checked={form.priority === p} onChange={() => set('priority', p)} className="sr-only" />
                      <span className={`priority-dot priority-${p}`} /> {priorities[p]}
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="field">
                <label className="field-label" htmlFor="repeat-frequency">重复</label>
                <select id="repeat-frequency" className="field-input" value={form.recurrence?.frequency || 'none'} onChange={e => set('recurrence', { ...noRepeat(), ...form.recurrence, frequency: e.target.value })}>
                  <option value="none">不重复</option><option value="daily">每天</option><option value="weekly">每周 · 指定星期</option><option value="monthly">每月 · 指定日期</option><option value="yearly">每年 · 指定月日</option>
                </select>
              </div>
              {form.recurrence?.frequency === 'weekly' && <fieldset className="weekday-options"><legend className="field-label">每周的哪几天</legend>{[1,2,3,4,5,6,0].map(day => <label key={day}><input type="checkbox" checked={form.recurrence.weekdays.includes(day)} onChange={e => set('recurrence', { ...form.recurrence, weekdays: e.target.checked ? [...form.recurrence.weekdays, day] : form.recurrence.weekdays.filter(d => d !== day) })} />{'一二三四五六日'[[1,2,3,4,5,6,0].indexOf(day)]}</label>)}</fieldset>}
              {['monthly','yearly'].includes(form.recurrence?.frequency) && <div className="field-row">
                {form.recurrence.frequency === 'yearly' && <div className="field"><label className="field-label" htmlFor="repeat-month">月份</label><select id="repeat-month" className="field-input" value={form.recurrence.month} onChange={e => set('recurrence', { ...form.recurrence, month: Number(e.target.value) })}>{Array.from({length:12}, (_,i) => <option key={i+1} value={i+1}>{i+1} 月</option>)}</select></div>}
                <div className="field"><label className="field-label" htmlFor="repeat-day">几号</label><input id="repeat-day" type="number" min="1" max="31" className="field-input" value={form.recurrence.monthDay} onChange={e => set('recurrence', { ...form.recurrence, monthDay: Number(e.target.value) })} /></div>
              </div>}
              {form.recurrence?.frequency !== 'none' && <p className="repeat-help">完成后生成下一次，保留完成记录。截止日期为首次日期；后续按规则重复，月底不足天数取当月最后一天。</p>}
              {errors.recurrence && <p className="field-error" role="alert">{errors.recurrence}</p>}

            </>
          )}

          {itemType === 'schedule' && (
            <>
              <div className="field">
                <label className="field-label" htmlFor="f-date">日期</label>
                <input id="f-date" type="date" className={errors.date ? 'field-input error' : 'field-input'} value={form.date} onChange={(e) => set('date', e.target.value)} />
                {errors.date && <span className="field-error" role="alert">{errors.date}</span>}
              </div>
              <div className="field-row">
                <div className="field">
                  <label className="field-label" htmlFor="f-start">开始时间</label>
                  <input id="f-start" type="time" className={errors.startTime ? 'field-input error' : 'field-input'} value={form.startTime} onChange={(e) => set('startTime', e.target.value)} />
                  {errors.startTime && <span className="field-error" role="alert">{errors.startTime}</span>}
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="f-end">结束时间</label>
                  <input id="f-end" type="time" className={errors.endTime ? 'field-input error' : 'field-input'} value={form.endTime} onChange={(e) => set('endTime', e.target.value)} />
                  {errors.endTime && <span className="field-error" role="alert">{errors.endTime}</span>}
                </div>
              </div>
              <div className="field">
                <label className="field-label" htmlFor="f-desc">备注（可选）</label>
                <textarea id="f-desc" className="field-input field-textarea" value={form.description} onChange={(e) => set('description', e.target.value)} rows={2} />
              </div>
            </>
          )}

          {isEdit && <button type="button" className="delete-entry" onClick={() => { if (window.confirm('删除这条记录？此操作无法撤销。')) { useStore.getState().deleteItem(editingItem.id); onClose() } }}>删除此{itemType === 'task' ? '任务' : '日程'}</button>}
          <button type="submit" className="submit-btn">{isEdit ? '保存' : '添加'}</button>
        </form>
      </div>
    </div>
  )
}
