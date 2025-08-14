import React, {useState, useMemo} from "react"
import {MapContainer, TileLayer, LayersControl} from "react-leaflet"
import RenderUserLogs from "./RenderUserLogs"

const {BaseLayer} = LayersControl

export default function PetaPerJalur({jalur, users}) {
 const [searchTerm, setSearchTerm] = useState("")
 const [showAllLogs, setShowAllLogs] = useState(false)

 // Filter user berdasarkan search dan jalur
 const filteredUsers = useMemo(() => {
  return users.filter((u) => {
   const matchNama = u.nama_user?.toLowerCase().includes(searchTerm.toLowerCase())
   const matchJalur = u.tracking_logs?.some((log) => log.jalur_id === jalur.jalur_id)
   return matchNama && matchJalur
  })
 }, [users, searchTerm, jalur])

 // Gabungkan semua logs dari user
 const allLogs = useMemo(() => {
  return filteredUsers.flatMap((u) =>
   u.tracking_logs
    .filter((log) => log.jalur_id === jalur.jalur_id)
    .map((log) => ({
     ...log,
     nama_user: u.nama_user,
     status: u.status
    }))
  )
 }, [filteredUsers, jalur])

 return (
  <div className="jalur-map-container">
   <h4>{jalur.nama_jalur}</h4>
   <div className="map-toolbar">
    <input
     type="text"
     placeholder="Cari pendaki..."
     value={searchTerm}
     onChange={(e) => setSearchTerm(e.target.value)}
    />
    <label>
     <input type="checkbox" checked={showAllLogs} onChange={(e) => setShowAllLogs(e.target.checked)} />
     Tampilkan Semua Titik
    </label>
   </div>

   <MapContainer center={[-7.3, 110.5]} zoom={13} style={{height: "400px", width: "100%"}}>
    <LayersControl position="topright">
     <BaseLayer checked name="OpenStreetMap">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
     </BaseLayer>
     <BaseLayer name="Satellite">
      <TileLayer url="https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}" subdomains={["mt0", "mt1", "mt2", "mt3"]} />
     </BaseLayer>
    </LayersControl>

    <RenderUserLogs logs={allLogs} showAllLogs={showAllLogs} />
   </MapContainer>
  </div>
 )
}
