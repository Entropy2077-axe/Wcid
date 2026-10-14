import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { localDate, normalizeItem, completeItems } from './model.js'

const today = localDate()
const SEED_ITEMS = [
  { id: 'seed-1', type: 'task', title: '阅读项目文档', dueDate: today, priority: 'high', description: '了解任务与日程的区别，安排自己的节奏。' },
  { id: 'seed-2', type: 'task', title: '整理桌面文件', dueDate: null, priority: 'low' },
  { id: 'seed-3', type: 'schedule', title: '团队周会', date: today, startTime: '10:00', endTime: '11:00', description: '每周例行会议' },
  { id: 'seed-4', type: 'schedule', title: '午餐时间', date: today, startTime: '12:00', endTime: '13:00', description: '' },
].map(item => normalizeItem({ createdAt: new Date().toISOString(), ...item }))

const useStore = create(persist((set) => ({
  items: SEED_ITEMS,
  addItem: (item) => set(state => ({ items: [...state.items, normalizeItem(item)] })),
  updateItem: (id, patch) => set(state => ({ items: state.items.map(item => item.id === id ? normalizeItem({ ...item, ...patch }) : item) })),
  deleteItem: (id) => set(state => ({ items: state.items.filter(item => item.id !== id) })),
  toggleComplete: (id) => set(state => ({ items: completeItems(state.items, id) })),
}), {
  name: 'wcid-store', version: 1,
  migrate: state => ({ ...state, items: (state.items || []).map(normalizeItem) }),
}))
export default useStore
