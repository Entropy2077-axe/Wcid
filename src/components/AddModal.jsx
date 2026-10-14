import { useState, useEffect, useRef } from 'react'
import useStore from '../store.js'
import './AddModal.css'

const today = () => new Date().toISOString().slice(0, 10)

function emptyTask() {
  return { type: 'task', title: '', dueDate: '', priority: 'medium' }
}
function emptySchedule() {
  return { type: 'schedule', title: '', date: today(), startTime: '', endTime: '', description: '' }
}

export default function AddModal({ editingItem, defaultTab, onClose }) {
  const addItem = useStore((s) => s.addItem)
  const updateItem = useStore((s) => s.updateItem)

  const isEdit = Boolean(editingItem)
  const [itemType, setItemType] = useState(editingItem?.type ?? (defaultTab === 'schedule' ? 'schedule' : 'task'))
  const [form, setForm] = useState(() => {
    if (editingItem) return { ...editingItem }
    return itemType === 'schedule' ? emptySchedule() : emptyTask()
  })
  const [errors, setErrors] = useState({})
  const titleRef = useRef(null)

  useEffect(() => {
    titleRef.current?.focus()
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
    return e
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    if (isEdit) {
      updateItem(editingItem.id, { ...form })
    } else {
      addItem({ ...form, id: crypto.randomUUID(), createdAt: new Date().toISOString() })
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
                <input id="f-due" type="date" className="field-input" value={form.dueDate} onChange={(e) => set('dueDate', e.target.value)} />
              </div>
              <fieldset className="field priority-fieldset">
                <legend className="field-label">优先级</legend>
                <div className="priority-options">
                  {['low', 'medium', 'high'].map((p) => (
                    <label key={p} className={form.priority === p ? 'priority-opt active' : 'priority-opt'}>
                      <input type="radio" name="priority" value={p} checked={form.priority === p} onChange={() => set('priority', p)} className="sr-only" />
                      {p === 'low' ? '低' : p === 'medium' ? '中' : '高'}
                    </label>
                  ))}
                </div>
              </fieldset>
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

          <button type="submit" className="submit-btn">{isEdit ? '保存' : '添加'}</button>
        </form>
      </div>
    </div>
  )
}
