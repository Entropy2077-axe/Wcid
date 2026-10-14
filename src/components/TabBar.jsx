import './TabBar.css'

export default function TabBar({ activeTab, onTabChange }) {
  return (
    <nav className="tabbar" role="tablist">
      <button
        role="tab"
        aria-selected={activeTab === 'tasks'}
        className={activeTab === 'tasks' ? 'tabbar-tab active' : 'tabbar-tab'}
        onClick={() => onTabChange('tasks')}
      >
        任务
      </button>
      <button
        role="tab"
        aria-selected={activeTab === 'schedule'}
        className={activeTab === 'schedule' ? 'tabbar-tab active' : 'tabbar-tab'}
        onClick={() => onTabChange('schedule')}
      >
        日程
      </button>
    </nav>
  )
}
