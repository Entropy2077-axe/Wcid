export const minutes = time => { const [h,m] = time.split(':').map(Number); return h * 60 + m }
// Connected overlap clusters use equal-width lanes; touching endpoints may reuse a lane.
export function layoutEvents(events) {
  const sorted = [...events].sort((a,b) => a.startTime.localeCompare(b.startTime) || a.endTime.localeCompare(b.endTime))
  const result = []
  let cluster = [], end = -1
  function flush() {
    const lanes = []
    const placed = cluster.map(event => {
      const start = minutes(event.startTime)
      let lane = lanes.findIndex(until => until <= start)
      if (lane < 0) lane = lanes.length
      lanes[lane] = minutes(event.endTime)
      return { ...event, lane }
    })
    result.push(...placed.map(event => ({ ...event, lanes: lanes.length })))
    cluster = []
  }
  for (const event of sorted) {
    if (minutes(event.startTime) >= end) flush()
    cluster.push(event)
    end = Math.max(cluster.length === 1 ? -1 : end, minutes(event.endTime))
  }
  flush()
  return result
}
