import useStore from '../store.js'
import './ScheduleItem.css'

export default function ScheduleItem({ item, onEdit }) {
  const deleteItem = useStore((s) => s.deleteItem)

  return (
    <div className="schedule-item" onClick={() => onEdit(item)}>
      <div className="schedule-bar" aria-hidden="true" />
      <div className="schedule-time">
        <span className="schedule-time-start">{item.startTime}</span>
        <span className="schedule-time-sep">—</span>
        <span className="schedule-time-end">{item.endTime}</span>
      </div>
      <div className="schedule-body">
        <span className="schedule-title">{item.title}</span>
        {item.description && (
          <span className="schedule-desc">{item.description}</span>
        )}
      </div>
      <button
        className="schedule-delete"
        aria-label="删除日程"
        onClick={(e) => { e.stopPropagation(); deleteItem(item.id) }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  )
}
