import {Marker, Popup} from "react-leaflet"
import {getLeafletIconUser} from "../../config/markericon"
import {formatDateTime} from "../../config/formateddate"
import getLogColor from "./getlogcolor.jsx"

export default function RenderUserLogs({logs}) {
 return logs.map((log, idx) => (
  <Marker
   key={`log-${idx}`}
   position={[log.latitude, log.longitude]}
   icon={getLeafletIconUser({
    lib: "FontAwesome5",
    name: "running",
    size: 20,
    color: getLogColor(log)
   })}>
   <Popup>
    <b>{log.nama_user}</b>
    <br />
    <span>{log.keterangan ?? "-"}</span>
    <br />
    <span> {formatDateTime(log.timestamp)} </span>
    <br />
    <span> {log.accuracy ?? "-"} (M) </span>
   </Popup>
  </Marker>
 ))
}
