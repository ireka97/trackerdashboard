import React from "react"
import {Marker, Popup, Polyline} from "react-leaflet"
import {getLeafletIconUser} from "../../config/markericon"
import {formatDateTime} from "../../config/formateddate"
import getLogColor from "./getlogcolor" // pastikan path-nya sesuai

export default function RenderGroupedLogs({groupedLogs, colors, userList}) {
 // Buat map userId → index agar warnanya konsisten
 const userIndexMap = userList.reduce((acc, user, idx) => {
  acc[user.user_id] = idx
  return acc
 }, {})

 return Object.entries(groupedLogs).map(([userId, logs]) => {
  if (logs.length === 0) return null

  const index = userIndexMap[userId] ?? 0 // fallback index 0
  const defaultColor = colors[index % colors.length]

  const firstLog = logs[0]
  const lastLog = logs[logs.length - 1]

  return (
   <React.Fragment key={`user-${userId}`}>
    {/* Marker Awal */}
    <Marker
     position={[firstLog.latitude, firstLog.longitude]}
     icon={getLeafletIconUser({
      lib: "FontAwesome5",
      name: "running",
      size: 30,
      color: getLogColor(firstLog, defaultColor)
     })}>
     <Popup>
      <b>{firstLog.nama_user}</b>
      <br />
      {firstLog.keterangan ?? "-"}
      <br />
      {formatDateTime(firstLog.timestamp)}
      <br />
      {firstLog.accuracy ?? "-"}
     </Popup>
    </Marker>

    {/* Marker Akhir */}
    {logs.length > 1 && (
     <Marker
      position={[lastLog.latitude, lastLog.longitude]}
      icon={getLeafletIconUser({
       lib: "FontAwesome5",
       name: "running",
       size: 30,
       color: getLogColor(lastLog, defaultColor)
      })}>
      <Popup>
       <b>{lastLog.nama_user}</b>
       <br />
       {lastLog.keterangan ?? "-"}
       <br />
       {formatDateTime(lastLog.timestamp)}
       <br />
       {lastLog.accuracy ?? "-"}
      </Popup>
     </Marker>
    )}

    {/* Polyline Full */}
    {logs.length > 1 && (
     <Polyline
      key={`poly-${userId}`}
      positions={logs.map((l) => [l.latitude, l.longitude])}
      color={defaultColor}
      weight={6}
     />
    )}
   </React.Fragment>
  )
 })
}
