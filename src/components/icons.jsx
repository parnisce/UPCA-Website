import { Image as ImageIcon, Clapperboard, Sparkles, MonitorPlay, Camera, Play, Video, Orbit, Plane, Monitor, Megaphone, CalendarDays, Rocket, House, Gem, Crown, ChartColumn, Users } from 'lucide-react'

const MAP = { image: ImageIcon, clapper: Clapperboard, sparkles: Sparkles, monitorplay: MonitorPlay, camera: Camera, play: Play, video: Video, orbit: Orbit, drone: Plane, monitor: Monitor, megaphone: Megaphone, calendar: CalendarDays, rocket: Rocket, home: House, gem: Gem, crown: Crown, chart: ChartColumn, users: Users }

export default function Icon({ name, ...props }) {
  const C = MAP[name] || Camera
  return <C aria-hidden="true" {...props} />
}
