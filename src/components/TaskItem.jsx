import useStore from '../store.js'
import { format, parseISO } from 'date-fns'
import './TaskItem.css'

const PRIORITY_CLASS = { low: 'priority-low', medium: 'priority-medium', high: 'priority-high' }

export default function TaskItem({ task, onEdit }) {
  const toggleComplete = useStore((s) => s.toggleComplete)
  const deleteItem = useStore((s) => s.deleteItem)
  const today = new Date().toISOString().slice(0, 10)
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
      <div className="task-body">
        <span className="task-title">{task.title}</span>
        {task.dueDate && (
          <span className={`task-due${isOverdue ? ' overdue' : ''}`}>
            {format(parseISO(task.dueDate), 'M月d日')}
          </span>
        )}
      </div>
      <span className={`priority-dot ${PRIORITY_CLASS[task.priority]}`} aria-hidden="true" />
      <button
        className="task-delete"
        aria-label="删除任务"
        onClick={() => deleteItem(task.id)}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  )
}
