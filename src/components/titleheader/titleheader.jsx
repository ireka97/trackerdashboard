import React, {useEffect, useState} from "react"
import "./titleheader.css"

export default function TitleHeader({title, subtitle}) {
 const [time, setTime] = useState(new Date())

 useEffect(() => {
  const timer = setInterval(() => setTime(new Date()), 1000)
  return () => clearInterval(timer)
 }, [])

 const formattedTime = time.toLocaleTimeString("id-ID", {hour12: false})
 const formattedDate = time.toLocaleDateString("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric"
 })

 return (
  <div className="page-header">
   <div className="page-header-left">
    <h1 className="page-title-header">{title}</h1>
    <p className="page-subtitle">{subtitle}</p>
   </div>
   <div className="page-header-right">
    <p className="time-label">Waktu Real-time</p>
    <p className="time-value">{formattedTime}</p>
    <p className="date-value">{formattedDate}</p>
   </div>
  </div>
 )
}
