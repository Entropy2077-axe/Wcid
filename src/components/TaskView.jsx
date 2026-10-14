import useStore from '../store.js'
import TaskItem from './TaskItem.jsx'
import './TaskView.css'

const today = () => new Date().toISOString().slice(0, 10)

function groupTasks(tasks) {
  const t = today()
  const overdue = []
  const todayItems = []
  const upcoming = []
  const noDate = []

  for (const task of tasks) {
    if (!task.dueDate) { noDate.push(task); continue }
    if (task.dueDate < t) overdue.push(task)
    else if (task.dueDate === t) todayItems.push(task)
    else upcoming.push(task)
  }
  return { overdue, today: todayItems, upcoming, noDate }
}

export default function TaskView({ onEdit }) {
  const items = useStore((s) => s.items)
  const tasks = items.filter((i) => i.type === 'task')

  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="3" />
          <path d="M9 12l2 2 4-4" />
        </svg>
        <p>暂无任务</p>
      </div>
    )
  }

  const groups = groupTasks(tasks)
  const sections = [
    { key: 'overdue', label: '已逾期', items: groups.overdue },
    { key: 'today', label: '今天', items: groups.today },
    { key: 'upcoming', label: '即将到来', items: groups.upcoming },
    { key: 'noDate', label: '无截止日期', items: groups.noDate },
  ]

  return (
    <div className="task-view">
      {sections.map((section) =>
        section.items.length === 0 ? null : (
          <div key={section.key} className="task-group">
            <h2 className={`group-label${section.key === 'overdue' ? ' overdue' : ''}`}>
              {section.label}
            </h2>
            {section.items.map((task) => (
              <TaskItem key={task.id} task={task} onEdit={onEdit} />
            ))}
          </div>
        )
      )}
    </div>
  )
}
