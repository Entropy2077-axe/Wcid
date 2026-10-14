import { useState } from 'react'
import Header from './components/Header.jsx'
import TabBar from './components/TabBar.jsx'
import TaskView from './components/TaskView.jsx'
import ScheduleView from './components/ScheduleView.jsx'
import AddModal from './components/AddModal.jsx'
import './App.css'

export default function App() {
  const [activeTab, setActiveTab] = useState('tasks')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)

  function openAdd() {
    setEditingItem(null)
    setModalOpen(true)
  }

  function openEdit(item) {
    setEditingItem(item)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditingItem(null)
  }

  return (
    <div className="app">
      <Header />
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="app-main">
        {activeTab === 'tasks'
          ? <TaskView onEdit={openEdit} />
          : <ScheduleView onEdit={openEdit} />
        }
      </main>
      <button className="fab" onClick={openAdd} aria-label="添加">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
      {modalOpen && (
        <AddModal
          editingItem={editingItem}
          defaultTab={activeTab === 'schedule' ? 'schedule' : 'task'}
          onClose={closeModal}
        />
      )}
    </div>
  )
}
