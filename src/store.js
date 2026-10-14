import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const today = new Date().toISOString().slice(0, 10)
const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10)

const SEED_ITEMS = [
  {
    id: 'seed-1',
    type: 'task',
    title: '阅读项目文档',
    dueDate: today,
    priority: 'high',
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'seed-2',
    type: 'task',
    title: '整理桌面文件',
    dueDate: tomorrow,
    priority: 'low',
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'seed-3',
    type: 'schedule',
    title: '团队周会',
    date: today,
    startTime: '10:00',
    endTime: '11:00',
    description: '每周例行会议',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'seed-4',
    type: 'schedule',
    title: '午餐时间',
    date: today,
    startTime: '12:00',
    endTime: '13:00',
    description: '',
    createdAt: new Date().toISOString(),
  },
]

const useStore = create(
  persist(
    (set) => ({
      items: SEED_ITEMS,

      addItem: (item) =>
        set((state) => ({ items: [...state.items, item] })),

      updateItem: (id, patch) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, ...patch } : item
          ),
        })),

      deleteItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),

      toggleComplete: (id) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, completed: !item.completed } : item
          ),
        })),
    }),
    {
      name: 'wcid-store',
    }
  )
)

export default useStore
