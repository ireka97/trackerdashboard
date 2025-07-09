import React from "react"
import {Marker, Popup, Polyline} from "react-leaflet"
import {getLeafletIconUser} from "../../config/markericon"
import {formatDateTime} from "../../config/formateddate"
import getLogColor from "./getlogcolor" // pastikan path-nya sesuai

export default function RenderGroupedLogs({groupedLogs, colors}) {
 return Object.entries(groupedLogs).map(([userId, logs], i) => {
  const defaultColor = colors[i % colors.length]

  return (
   <React.Fragment key={`user-${userId}`}>
    {logs.map((log, idx) => (
     <Marker
      key={`log-${userId}-${idx}`}
      position={[log.latitude, log.longitude]}
      icon={getLeafletIconUser({
       lib: "FontAwesome5",
       name: "running",
       size: 20,
       color: getLogColor(log, defaultColor)
      })}>
      <Popup>
       <b>{log.nama_user}</b>
       <br />
       {log.keterangan ?? "-"}
       <br />
       {formatDateTime(log.timestamp)}
       <br />
       {log.accuracy ?? "-"}
      </Popup>
     </Marker>
    ))}

    {logs.length > 1 && (
     <Polyline key={`poly-${userId}`} positions={logs.map((l) => [l.latitude, l.longitude])} color={defaultColor} />
    )}
   </React.Fragment>
  )
 })
}
