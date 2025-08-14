import {Marker, Popup, Polyline} from "react-leaflet"
import {useMemo} from "react"
import {getLeafletIconUser} from "../../config/markericon"
import {formatDateTime} from "../../config/formateddate"
import getLogColor from "./getlogcolor.jsx"

export default function RenderUserLogs({logs, showAllLogsuser = false}) {
 if (!logs || logs.length === 0) return null

 const markerLogs = useMemo(() => {
  return showAllLogsuser ? logs : [logs[0], logs[logs.length - 1]]
 }, [logs, showAllLogsuser])

 const defaultColor = "red"

 function getMarkerColor(log, index) {
  if (!showAllLogsuser) {
   if (index === 0) return "green" // Awal
   if (index === 1) return "red" // Akhir
  }
  return getLogColor(log, defaultColor) // Untuk mode semua logs
 }

 return (
  <>
   {markerLogs.map((log, idx) => {
    const color = getMarkerColor(log, idx)
    return (
     <Marker
      key={`log-${idx}`}
      position={[log.latitude, log.longitude]}
      icon={getLeafletIconUser({
       lib: "FontAwesome5",
       name: "running",
       size: 30,
       color: color
      })}>
      <Popup>
       <b>{log.nama}</b>
       <br />
       <span>{log.keterangan ?? "-"}</span>
       <br />
       <span>{formatDateTime(log.timestamp)}</span>
       <br />
       <span>{log.accuracy ?? "-"} (M)</span>
      </Popup>
     </Marker>
    )
   })}

   {logs.length > 1 && (
    <Polyline positions={logs.map((l) => [l.latitude, l.longitude])} color={defaultColor} weight={6} />
   )}
  </>
 )
}
