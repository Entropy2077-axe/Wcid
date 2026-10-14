import { useState } from 'react'
import Header from './components/Header.jsx'
import TabBar from './components/TabBar.jsx'
import TaskView from './components/TaskView.jsx'
import ScheduleView from './components/ScheduleView.jsx'
import AddModal from './components/AddModal.jsx'
import useStore from './store.js'
import { localDate } from './model.js'
import './App.css'

export default function App() {
  const [activeTab, setActiveTab] = useState('tasks')
  const [modal, setModal] = useState(null)
  const items = useStore(s => s.items)
  const pending = items.filter(i => i.type === 'task' && !i.completed)
  const today = items.filter(i => i.type === 'schedule' && i.date === localDate()).sort((a,b) => a.startTime.localeCompare(b.startTime))
  const openEdit = item => setModal({ editingItem: item })
  return <div className="app">
    <aside className="sidebar">
      <div className="brand">Wcid<span>留一点空间，给生活。</span></div>
      <button className="desktop-add" onClick={() => setModal({})}>＋ 新建{activeTab === 'tasks' ? '任务' : '日程'}</button>
      <nav aria-label="主导航">
        <button className={activeTab === 'tasks' ? 'selected' : ''} onClick={() => setActiveTab('tasks')}>◷ 所有任务 <span>{pending.length}</span></button>
        <button className={activeTab === 'schedule' ? 'selected' : ''} onClick={() => setActiveTab('schedule')}>▦ 日程日历</button>
      </nav>
      <div className="sidebar-note">自己的节奏<br/>一步一步，也是在向前。</div>
      <small>本机存储 · 离线可用</small>
    </aside>
    <div className="workspace">
      <div className="mobile-header"><Header /><TabBar activeTab={activeTab} onTabChange={setActiveTab} /></div>
      <header className="workspace-heading"><div><p>让每一天，清晰一点</p><h1>{activeTab === 'tasks' ? '所有任务' : '日程日历'}</h1></div><span>{new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })}</span></header>
      <div className={activeTab === 'tasks' ? 'content-layout' : ''}>
        <main className="app-main">{activeTab === 'tasks' ? <TaskView onEdit={openEdit} /> : <ScheduleView onEdit={openEdit} onAdd={date => setModal({ initialDate: date })} />}</main>
        {activeTab === 'tasks' && <aside className="day-summary"><p className="eyebrow">TODAY</p><h2>今天的安排</h2><p>{pending.filter(t => t.dueDate === localDate()).length} 项任务今天截止</p><div className="summary-line"/>{today.length ? today.map(item => <button key={item.id} onClick={() => openEdit(item)}><small>{item.startTime} — {item.endTime}</small><strong>{item.title}</strong></button>) : <p>今天暂无日程。<br/>为自己留一点自由时间。</p>}<button className="view-calendar" onClick={() => setActiveTab('schedule')}>查看日历 →</button></aside>}
      </div>
    </div>
    <button className="fab" onClick={() => setModal({})} aria-label="添加">＋</button>
    {modal && <AddModal {...modal} defaultTab={activeTab === 'schedule' ? 'schedule' : 'task'} onClose={() => setModal(null)} />}
  </div>
}
