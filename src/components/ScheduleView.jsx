import { useState, useEffect, useRef } from 'react'
import { addDays, startOfWeek, parseISO, format } from 'date-fns'
import useStore from '../store.js'
import { localDate } from '../model.js'
import { layoutEvents, minutes } from '../calendar.js'
import './ScheduleView.css'

export default function ScheduleView({ onEdit, onAdd }) {
  const [selected, setSelected] = useState(localDate())
  const [view, setView] = useState('week')
  const [now, setNow] = useState(new Date())
  const scroll = useRef(null)
  const items = useStore(s => s.items)
  const start = view === 'week' ? startOfWeek(parseISO(selected), { weekStartsOn: 1 }) : parseISO(selected)
  const dates = Array.from({ length: view === 'week' ? 7 : 1 }, (_, i) => localDate(addDays(start, i)))
  useEffect(() => { if (scroll.current) scroll.current.scrollTop = 7 * 64; const timer = setInterval(() => setNow(new Date()), 60000); return () => clearInterval(timer) }, [])
  const changeDate = delta => setSelected(localDate(addDays(parseISO(selected), delta * (view === 'week' ? 7 : 1))))
  return <section className="schedule-view" aria-label="日程日历">
    <div className="calendar-toolbar">
      <h2>{format(parseISO(selected), 'yyyy年M月')}</h2>
      <div className="calendar-controls"><button onClick={() => changeDate(-1)} aria-label={view === 'week' ? '上一周' : '上一天'}>‹</button><button onClick={() => setSelected(localDate())}>今天</button><button onClick={() => changeDate(1)} aria-label={view === 'week' ? '下一周' : '下一天'}>›</button></div>
      <input type="date" value={selected} onChange={e => e.target.value && setSelected(e.target.value)} aria-label="跳转日期" />
      <div className="calendar-controls"><button aria-pressed={view === 'week'} onClick={() => setView('week')}>周</button><button aria-pressed={view === 'day'} onClick={() => setView('day')}>日</button></div>
    </div>
    <p className="calendar-hint">固定的时间，留给重要的安排。点击日期下方的 ＋ 新建日程。</p>
    <div className="calendar-scroll" ref={scroll}>
      <div className={`calendar-grid ${view}`}>
        <div className="calendar-days"><div className="time-corner">时间</div>{dates.map(date => <div className={date === localDate(now) ? 'day-heading is-today' : 'day-heading'} key={date}><span>周{'日一二三四五六'[parseISO(date).getDay()]}</span><strong>{parseISO(date).getDate()}</strong><button aria-label={`${date} 新建日程`} onClick={() => onAdd(date)}>＋</button></div>)}</div>
        <div className="calendar-body">
          <div className="time-axis">{Array.from({ length: 24 }, (_, h) => <span key={h} style={{ top: h * 64 }}>{String(h).padStart(2,'0')}:00</span>)}</div>
          {dates.map(date => <div className="day-column" key={date} aria-label={date}>
            {layoutEvents(items.filter(i => i.type === 'schedule' && i.date === date)).map((event, index) => <button key={event.id} className={`calendar-event tone-${index % 3}`} style={{ top: minutes(event.startTime) * 64 / 60, height: Math.max(12, (minutes(event.endTime) - minutes(event.startTime)) * 64 / 60), left: `${event.lane * 100 / event.lanes}%`, width: `${100 / event.lanes}%` }} onClick={() => onEdit(event)} title={`${event.title} ${event.startTime}–${event.endTime}\n${event.description || ''}`}><strong>{event.title}</strong><small>{event.startTime}–{event.endTime}</small>{event.description && <span>{event.description}</span>}</button>)}
            {date === localDate(now) && <div className="now-line" style={{ top: (now.getHours() * 60 + now.getMinutes()) * 64 / 60 }} aria-label="当前时间" />}
          </div>)}
        </div>
      </div>
    </div>
  </section>
}
