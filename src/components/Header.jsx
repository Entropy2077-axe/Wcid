import { format } from 'date-fns'
import './Header.css'

export default function Header() {
  const now = new Date()
  const dateStr = format(now, 'yyyy年M月d日')

  return (
    <header className="header">
      <span className="header-title">Wcid</span>
      <span className="header-date">{dateStr}</span>
    </header>
  )
}
