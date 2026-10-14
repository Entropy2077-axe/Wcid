import { useState } from 'react'
import useStore from '../store.js'
import './ScheduleView.css'
import ScheduleItem from './ScheduleItem.jsx'
import { format, addDays, subDays, parseISO } from 'date-fns'

export default function ScheduleView({ onEdit }) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10))
  const items = useStore((s) => s.items)

  const schedules = items
    .filter((i) => i.type === 'schedule' && i.date === selectedDate)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))

  function prev() {
    setSelectedDate(subDays(parseISO(selectedDate), 1).toISOString().slice(0, 10))
  }
  function next() {
    setSelectedDate(addDays(parseISO(selectedDate), 1).toISOString().slice(0, 10))
  }

  const displayDate = format(parseISO(selectedDate), 'M月d日 EEEE')

  return (
    <div className="schedule-view">
      <div className="date-nav">
        <button className="date-nav-btn" onClick={prev} aria-label="前一天">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span className="date-nav-label">{displayDate}</span>
        <button className="date-nav-btn" onClick={next} aria-label="后一天">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {schedules.length === 0 ? (
        <div className="empty-state">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <p>当天暂无日程</p>
        </div>
      ) : (
        <div className="schedule-list">
          {schedules.map((item) => (
            <ScheduleItem key={item.id} item={item} onEdit={onEdit} />
          ))}
        </div>
      )}
    </div>
  )
}
