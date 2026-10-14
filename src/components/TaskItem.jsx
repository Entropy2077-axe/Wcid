import { localDate, priorities, recurrenceLabel } from '../model.js'
import useStore from '../store.js'
import { format, parseISO } from 'date-fns'
import './TaskItem.css'

const PRIORITY_CLASS = { low: 'priority-low', medium: 'priority-medium', high: 'priority-high', urgent: 'priority-urgent' }

export default function TaskItem({ task, onEdit }) {
  const toggleComplete = useStore((s) => s.toggleComplete)
  const deleteItem = useStore((s) => s.deleteItem)
  const today = localDate()
  const isOverdue = task.dueDate && task.dueDate < today && !task.completed

  function handleRowClick(e) {
    if (e.target.closest('.task-checkbox') || e.target.closest('.task-delete')) return
    onEdit(task)
  }

  return (
    <div className={`task-item${task.completed ? ' completed' : ''}`} onClick={handleRowClick}>
      <button
        className="task-checkbox"
        aria-label={task.completed ? '标记未完成' : '标记完成'}
        onClick={() => toggleComplete(task.id)}
      >
        {task.completed && (
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="2 7 5.5 10.5 11 3" />
          </svg>
        )}
      </button>
      <div className="task-body" role="button" tabIndex={0} aria-label={`编辑 ${task.title}`} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onEdit(task) } }}>
        <span className="task-title">{task.title}</span>
        {task.description && <span className="task-description">{task.description}</span>}
        {recurrenceLabel(task.recurrence) && <span className="task-due">↻ {recurrenceLabel(task.recurrence)}</span>}
        {task.dueDate && (
          <span className={`task-due${isOverdue ? ' overdue' : ''}`}>
            {format(parseISO(task.dueDate), 'M月d日')}
          </span>
        )}
      </div>
      <span className={`priority-dot ${PRIORITY_CLASS[task.priority]}`} role="img" aria-label={`优先级：${priorities[task.priority]}`} title={priorities[task.priority]} />
      <button
        className="task-delete"
        aria-label="删除任务"
        onClick={() => { if (window.confirm('删除这条任务？')) deleteItem(task.id) }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  )
}
