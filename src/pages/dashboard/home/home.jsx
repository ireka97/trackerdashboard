import React, {useState, useEffect, useMemo} from "react"
import {faArrowUp, faArrowDown, faUsers, faFlagCheckered, faSearch, faRunning} from "@fortawesome/free-solid-svg-icons"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {MapContainer, TileLayer, Polyline} from "react-leaflet"
import {getLeafletIconFromConfig, MarkerIcon} from "../../../config/markericon.jsx"
import RenderGroupedLogs from "../../../components/map/rendergrouplog.jsx"
import RenderPosMarkers from "../../../components/map/renderpos.jsx"
import RenderUserLogs from "../../../components/map/renderuser.jsx"
import FitBoundsToJalur from "../../../config/fitboundjalur.jsx"
import DirectionArrowDecorator from "../../../config/jalurline.jsx"
import {MAP_LAYERS} from "../../../config/map"
import jalurData from "../../../config/jalur"
import {GetAllTrackingModelByUser} from "../../../api/tracking"
import {formatDateTime} from "../../../config/formateddate.js"
import Divider from "@mui/material/Divider"
import "leaflet/dist/leaflet.css"
import "./home.css"
const COLORS = [
 "#FF5733", // Merah
 "#33B5FF", // Biru
 "#28A745", // Hijau
 "#FFC107", // Kuning
 "#8E44AD", // Ungu
 "#E67E22", // Oranye Tua
 "#00C8A2", // Tosca
 "#C70039", // Merah Tua
 "#3F51B5", // Indigo
 "#009688" // Teal
]

// const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY || ""

export default function HomePage() {
 const [users, setUsers] = useState([])
 const [searchTermPerJalur, setSearchTermPerJalur] = useState({})
 const [selectedUserPerJalur, setSelectedUserPerJalur] = useState({})
 const [hasSelectedPerJalur, setHasSelectedPerJalur] = useState({})
 const [showAllLogsuser, setShowAllLogsuser] = useState(false)
 const [selectedSessionIndexPerJalur, setSelectedSessionIndexPerJalur] = useState({})
 const [maplayer, setMapLayer] = useState("OpenStreetMap")
 const [selectedJalur, setSelectedJalur] = useState(jalurData[1])
 const [showDropdown, setShowDropdown] = useState(false)

 const todayStr = new Date().toISOString().slice(0, 10)
 const today = new Date().toLocaleDateString("id-ID", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric"
 })

 useEffect(() => {
  const fetchData = async () => {
   try {
    const res = await GetAllTrackingModelByUser()
    setUsers(res.data)
   } catch (err) {
    console.error("Gagal ambil data tracking user", err)
   }
  }

  // Ambil data pertama kali
  fetchData()

  // Set interval setiap 1 menit (60000 ms)
  const intervalId = setInterval(fetchData, 6000)

  // Bersihkan interval saat komponen unmount
  return () => clearInterval(intervalId)
 }, [])

 const jalurSummaries = useMemo(() => {
  return jalurData.map((jalur) => {
   let naik = 0,
    turun = 0,
    selesai = 0

   users.forEach((u) => {
    u.tracking_sessions?.forEach((s) => {
     const sessionDate = new Date(s.updated_at || s.start_time || s.created_at).toISOString().slice(0, 10)
     const status = s.status?.toLowerCase()

     // cek session sesuai jalur dan tanggal hari ini
     if (String(s.jalur_id) === String(jalur.jalur_id) && sessionDate === todayStr) {
      if (
       status === "mulai pendakian" ||
       status === "pendakian naik di-pause" ||
       status === "pendakian naik dilanjutkan" ||
       (status.startsWith("check-in") && status.includes("(naik)"))
      ) {
       naik++
      } else if (
       status === "memulai turun pendakian" ||
       status === "pendakian turun di-pause" ||
       status === "pendakian turun dilanjutkan" ||
       (status.startsWith("check-in") && status.includes("(turun)"))
      ) {
       turun++
      } else if (status === "pendakian berakhir") {
       selesai++
      }
     }
    })
   })

   return {
    jalur_id: jalur.jalur_id,
    nama_jalur: jalur.nama_jalur,
    naik,
    turun,
    selesai,
    total: naik + turun + selesai // total ikut semua status
   }
  })
 }, [users, todayStr, jalurData])

 const globalSummary = useMemo(() => {
  let naik = 0,
   turun = 0,
   selesai = 0

  users.forEach((u) => {
   u.tracking_sessions?.forEach((s) => {
    const sessionDate = new Date(s.updated_at || s.start_time || s.created_at).toISOString().slice(0, 10)
    const status = s.status?.toLowerCase()

    if (sessionDate === todayStr) {
     if (
      status === "mulai pendakian" ||
      status === "pendakian naik di-pause" ||
      status === "pendakian naik dilanjutkan" ||
      (status.startsWith("check-in") && status.includes("(naik)"))
     )
      naik++
     else if (
      status === "memulai turun pendakian" ||
      status === "pendakian turun di-pause" ||
      status === "pendakian turun dilanjutkan" ||
      (status.startsWith("check-in") && status.includes("(turun)"))
     )
      turun++
     else if (status === "pendakian berakhir") selesai++
    }
   })
  })

  return {naik, turun, selesai, total: naik + turun + selesai}
 }, [users, todayStr])

 const handleUserSelect = (jalurId, user) => {
  setSelectedUserPerJalur((prev) => ({...prev, [jalurId]: user.user_id}))
  setSearchTermPerJalur((prev) => ({...prev, [jalurId]: user.nama}))
  setHasSelectedPerJalur((prev) => ({...prev, [jalurId]: true}))
  setSelectedSessionIndexPerJalur((prev) => ({...prev, [jalurId]: 0}))
 }

 const renderJalurMap = (jalur) => {
  const todayStr = new Date().toISOString().slice(0, 10)
  const jalurId = jalur.jalur_id
  const searchTerm = searchTermPerJalur[jalurId] || ""
  const selectedUserId = selectedUserPerJalur[jalurId] || ""
  const selectedSessionIndex = selectedSessionIndexPerJalur[jalurId] ?? 0

  const allUsersInJalur = users.filter((u) =>
   u.tracking_sessions?.some((s) => Number(s.jalur_id) === Number(jalur.jalur_id))
  )

  const filteredUsers = searchTerm
   ? allUsersInJalur.filter((u) => u.nama?.toLowerCase().includes(searchTerm.toLowerCase()))
   : allUsersInJalur

  const selectedUser = users.find((u) => Number(u.user_id) === Number(selectedUserId)) || null
  const userSessionsInJalur =
   selectedUser?.tracking_sessions?.filter((s) => Number(s.jalur_id) === Number(jalurId)) || []

  const selectedLogs = [...(userSessionsInJalur[selectedSessionIndex]?.tracking_log || [])]
   .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
   .map((log) => ({
    ...log,
    timestamp: new Date(log.timestamp),
    created_at: new Date(log.created_at)
   }))

  const THRESHOLD_MS = 4000 // 4 detik atau 1 menit bisa
  let wasOffline = false
  const enhancedLogs = []

  for (let i = 0; i < selectedLogs.length; i++) {
   const current = selectedLogs[i]
   const prev = selectedLogs[i - 1]

   let offline = false
   let offlineStart = false
   let offlineEnd = false

   if (prev) {
    const delta = current.created_at - prev.created_at

    if (current.created_at.getTime() === prev.created_at.getTime() || delta <= THRESHOLD_MS) {
     offline = true
     if (!wasOffline && delta >= THRESHOLD_MS) {
      offlineStart = true
     }
     wasOffline = true
    } else {
     if (wasOffline && delta > THRESHOLD_MS) {
      offlineEnd = true
      wasOffline = false
     } else {
      wasOffline = false
     }
    }
   }

   enhancedLogs.push({
    ...current,
    offline,
    offlineStart,
    offlineEnd
   })
  }
  enhancedLogs.sort((a, b) => a.timestamp - b.timestamp)

  const polylineCoords = [...enhancedLogs]
   .sort((a, b) => a.timestamp - b.timestamp) // ⬅️ Ini urutkan by timestamp
   .map((log) => [log.latitude, log.longitude])

  return (
   <div key={`jalur-${jalurId}`} className="map-container-home">
    <h3 className="map-header-title">{jalur.nama_jalur}</h3>
    <div className="jalur-card-grid">
     {jalurSummaries
      .filter((item) => item.jalur_id === jalur.jalur_id) // ✅ filter sesuai jalur di map
      .map((jalur) => (
       <div key={jalur.jalur_id} className="jalur-card">
        <div className="jalur-card-wrapper">
         <div className="subcard blue">
          <FontAwesomeIcon icon={faArrowUp} /> <p>Pendaki Naik</p>
          <h2>{jalur.naik}</h2>
         </div>
         <div className="subcard green">
          <FontAwesomeIcon icon={faArrowDown} /> <p>Pendaki Turun</p>
          <h2>{jalur.turun}</h2>
         </div>
         <div className="subcard orange">
          <FontAwesomeIcon icon={faUsers} /> <p>Total Hari Ini</p>
          <h2>{jalur.total}</h2>
         </div>
         <div className="subcard gray">
          <FontAwesomeIcon icon={faFlagCheckered} /> <p>Pendaki Selesai</p>
          <h2>{jalur.selesai}</h2>
         </div>
        </div>
       </div>
      ))}
    </div>
    <Divider className="divider" />

    <div className="map-wrapper">
     {renderSidebar(jalur, searchTerm, filteredUsers, allUsersInJalur)}
     {renderMapView(
      jalur,
      polylineCoords,
      selectedUserId,
      selectedLogs,
      enhancedLogs,
      userSessionsInJalur,
      selectedSessionIndex,
      allUsersInJalur
     )}
    </div>
    <LegendComponent
     selectedUserId={selectedUserId}
     allUsersInJalur={allUsersInJalur}
     selectedJalur={jalur}
     users={users}
     COLORS={COLORS}
    />
   </div>
  )
 }

 const renderSidebar = (jalur, searchTerm, filteredUsers, allUsersInJalur) => (
  <div className="map-sidebar">
   <div className="search-wrapper">
    <FontAwesomeIcon icon={faSearch} className="search-icon" />
    <input
     type="text"
     placeholder="Cari nama..."
     value={searchTerm}
     onChange={(e) => {
      const value = e.target.value
      setSearchTermPerJalur((prev) => ({...prev, [jalur.jalur_id]: value}))

      if (value === "") {
       // Kalau kosong, reset selected user
       setSelectedUserPerJalur((prev) => ({...prev, [jalur.jalur_id]: ""}))
       setHasSelectedPerJalur((prev) => ({...prev, [jalur.jalur_id]: false}))
       setSelectedSessionIndexPerJalur((prev) => ({...prev, [jalur.jalur_id]: 0}))
      } else {
       setHasSelectedPerJalur((prev) => ({...prev, [jalur.jalur_id]: false}))
      }
     }}
     className="search-input"
    />
    {searchTerm && !hasSelectedPerJalur[jalur.jalur_id] && (
     <ul className="suggest-list">
      {filteredUsers.length > 0 ? (
       filteredUsers.map((u) => (
        <li key={u.user_id} onClick={() => handleUserSelect(jalur.jalur_id, u)}>
         {u.nama} <small>{u.tracking_sessions?.[0]?.start_time?.slice(0, 10) || "-"}</small>
        </li>
       ))
      ) : (
       <li className="no-result">Tidak ditemukan di jalur {jalur.nama_jalur}</li>
      )}
     </ul>
    )}
   </div>
   <h4 className="daftar-pendaki-tittle">Daftar Pendaki</h4>
   {filteredUsers.length > 0 ? (
    renderUserList(filteredUsers, jalur)
   ) : (
    <div className="no-data-message">Belum ada data di jalur ini</div>
   )}
  </div>
 )

 const renderUserList = (usersList, jalur) => (
  <div className="pendaki-list">
   {usersList.flatMap((user) => {
    const sessions = user.tracking_sessions?.filter((s) => String(s.jalur_id) === String(jalur.jalur_id)) || []

    return sessions.map((session, idx) => {
     const status = session.status?.toLowerCase() || "-"
     return (
      <div
       key={`${user.user_id}-${idx}`}
       className="pendaki-card"
       onClick={() => handleUserSelect(jalur.jalur_id, user)}>
       <div className="pendaki-header">
        <div className="status-icon-left">
         {status === "mulai pendakian" && <span className="icon naik">↑ naik</span>}
         {status === "memulai turun pendakian" && <span className="icon turun">↓ turun</span>}
         {status === "pendakian berakhir" && <span className="icon selesai">✔ selesai</span>}
         {status === "pendakian naik di-pause" && <span className="icon pause">↑ pause</span>}
         {status === "pendakian turun di-pause" && <span className="icon pause">↓ pause</span>}
         {status === "pendakian naik dilanjutkan" && <span className="icon continue">↑ continue</span>}
         {status === "pendakian turun dilanjutkan" && <span className="icon continue">↓ continue</span>}
         {status?.startsWith("check-in") && status.includes("(naik)") && <span className="icon naik">↑ {status}</span>}
         {status?.startsWith("check-in") && status.includes("(turun)") && <span className="icon turun">↓ {status}</span>}
        </div>
        <strong>{user.nama}</strong>
       </div>
       <div className="pendaki-info">
        <p>
         <small>🗺️ Jalur: {jalur.nama_jalur}</small>
        </p>
        <p>
         <small>🔖Status: {session.status}</small>
        </p>
        <p>
         <small>🕗 Mulai: {formatDateTime(session.start_time)}</small>
        </p>
        <p>
         <small>🕒 Update: {formatDateTime(session.updated_at || session.end_time || session.start_time)}</small>
        </p>
       </div>
      </div>
     )
    })
   })}
  </div>
 )

 const groupLogsPerUser = (userList, jalurId) => {
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0)

  const result = {}

  userList.forEach((u) => {
   // Ambil semua session di jalur ini
   const sessions = (u.tracking_sessions || []).filter((s) => Number(s.jalur_id) === Number(jalurId))

   if (!sessions.length) return

   // Ambil session terbaru yang punya log hari ini
   const latestWithTodayLogs = sessions
    .map((s) => ({
     ...s,
     tracking_log: (s.tracking_log || []).filter((log) => {
      const ts = new Date(log.timestamp)
      return ts >= startOfDay && ts < endOfDay
     })
    }))
    .filter((s) => s.tracking_log.length > 0)
    .sort((a, b) => new Date(b.updated_at || b.start_time) - new Date(a.updated_at || a.start_time))[0]

   if (!latestWithTodayLogs) return

   // Sort log berdasarkan waktu tracking
   const logs = latestWithTodayLogs.tracking_log
    .map((log) => ({
     ...log,
     timestamp: new Date(log.timestamp),
     created_at: new Date(log.created_at)
    }))
    .sort((a, b) => a.timestamp - b.timestamp)

   result[u.user_id] = logs
  })

  return result
 }

 // Legend Component
 function LegendComponent({selectedUserId, allUsersInJalur, selectedJalur, users, COLORS}) {
  return (
   <div className="legend-wrapper-home">
    <h1 className="legend-title">Legenda</h1>
    <div className="legend-grid">
     <div className="legend-column">
      <h2 className="legend-subtitle">🛍 Simbol Pos</h2>
      {selectedJalur?.map?.markers.map((m, i) => (
       <div key={i} className="legend-item">
        {MarkerIcon(m.icon)}
        <span>{m.nama_pos}</span>
       </div>
      ))}
     </div>
     <div className="legend-column">
      <h2 className="legend-subtitle">🧍 User</h2>
      {selectedUserId
       ? (() => {
          const selectedUser = users.find((u) => String(u.user_id) === String(selectedUserId))
          return (
           <div key={selectedUserId} className="legend-item">
            <FontAwesomeIcon icon={faRunning} color="red" />
            <span>{selectedUser?.nama ?? "User"}</span>
           </div>
          )
         })()
       : allUsersInJalur.map((u, i) => (
          <div key={u.user_id} className="legend-item">
           <FontAwesomeIcon icon={faRunning} color={COLORS[i % COLORS.length]} />
           <span>{u.nama}</span>
          </div>
         ))}
      <div className="legend-item">
       <FontAwesomeIcon icon={faRunning} color="orange" />
       <span>User Offline</span>
      </div>
      <div className="legend-item">
       <FontAwesomeIcon icon={faRunning} color="green" />
       <span>User Reconnect</span>
      </div>
     </div>
     <div className="legend-column">
      <h2 className="legend-subtitle">📍 Jalur & Jejak</h2>
      <div className="legend-item">
       <div className="color-box-jalur"></div>
       <span>Jalur Pendakian</span>
      </div>
      {selectedUserId
       ? (() => {
          const selectedUser = users.find((u) => String(u.user_id) === String(selectedUserId))
          return (
           <div key={`jejak-${selectedUserId}`} className="legend-item">
            <div className="color-box-jejak" style={{backgroundColor: "red"}} />
            <span>Jejak {selectedUser?.nama ?? "User"}</span>
           </div>
          )
         })()
       : allUsersInJalur.map((u, i) => (
          <div key={`jejak-${u.user_id}`} className="legend-item">
           <div className="color-box-jejak" style={{backgroundColor: COLORS[i % COLORS.length]}} />
           <span>Jejak {u.nama}</span>
          </div>
         ))}
     </div>
    </div>
   </div>
  )
 }

 const renderMapView = (
  jalur,
  polylineCoords,
  selectedUserId,
  selectedLogs,
  enhancedLogs,
  userSessionsInJalur,
  selectedSessionIndex,
  allUsersInJalur
 ) => (
  <MapContainer
   center={jalur.map?.center || [-7.25, 112.75]}
   zoom={20}
   maxZoom={22} // ⬅️ ini penting
   className="map-view-dahsboard">
   <TileLayer url={MAP_LAYERS[maplayer].url} attribution={MAP_LAYERS[maplayer].attribution} maxZoom={22} />

   {/* <TileLayer
    url={`https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${WEATHER_API_KEY}`}
    opacity={0.8}
    zIndex={999}
   /> */}
   {jalur.map?.markers && <RenderPosMarkers markers={jalur.map.markers} />}
   {jalur.map?.polylineCoordnate.map((segment, idx) => (
    <Polyline
     key={`poly-${jalur.jalur_id}-${idx}`}
     positions={segment.map(([lng, lat]) => [lat, lng])}
     color="black"
     weight={5}
    />
   ))}
   {selectedUserId
    ? polylineCoords.length >= 2 && <DirectionArrowDecorator polylineCoords={polylineCoords} color="red" />
    : Object.entries(groupLogsPerUser(allUsersInJalur, jalur.jalur_id)).map(([userId, logs], idx) => {
       const polyline = logs.sort((a, b) => a.timestamp - b.timestamp).map((log) => [log.latitude, log.longitude])

       return polyline.length >= 2 ? (
        <DirectionArrowDecorator
         key={`arrow-${userId}`}
         polylineCoords={polyline}
         color={COLORS[idx % COLORS.length]} // Biar warnanya beda-beda
        />
       ) : null
      })}
   {selectedUserId ? (
    <RenderUserLogs logs={enhancedLogs} showAllLogsuser={showAllLogsuser} />
   ) : (
    <RenderGroupedLogs
     groupedLogs={groupLogsPerUser(allUsersInJalur, jalur.jalur_id)}
     userList={allUsersInJalur}
     colors={COLORS}
    />
   )}
   {jalur.map?.overlayBounds && <FitBoundsToJalur bounds={jalur.map.overlayBounds} />}
   <div className="map-overlay-panel">
    {userSessionsInJalur.length > 1 && (
     <div className="session-selector">
      <label htmlFor={`session-select-${jalur.jalur_id}`}>Tanggal Pendakian:</label>
      <select
       id={`session-select-${jalur.jalur_id}`}
       value={selectedSessionIndex}
       onChange={(e) =>
        setSelectedSessionIndexPerJalur((prev) => ({...prev, [jalur.jalur_id]: Number(e.target.value)}))
       }>
       {userSessionsInJalur.map((session, idx) => (
        <option key={idx} value={idx}>
         {new Date(session.start_time).toLocaleDateString("id-ID", {day: "numeric", month: "long", year: "numeric"})}
        </option>
       ))}
      </select>
     </div>
    )}
    <div className="marker-toggle">
     <label>
      <input type="checkbox" checked={showAllLogsuser} onChange={(e) => setShowAllLogsuser(e.target.checked)} />{" "}
      Tampilkan Semua Marker
     </label>
    </div>
   </div>

   <div className="map-layer-select-container">
    <div className="selected-layer" onClick={() => setShowDropdown(!showDropdown)}>
     <img src={MAP_LAYERS[maplayer].thumbnail} alt={MAP_LAYERS[maplayer].name} />
     <span>{MAP_LAYERS[maplayer].name}</span>
    </div>

    {showDropdown && (
     <div className="dropdown-options">
      {Object.entries(MAP_LAYERS).map(([key, layer]) => (
       <div
        key={key}
        className="dropdown-option"
        onClick={() => {
         setMapLayer(key)
         setShowDropdown(false)
        }}>
        <img src={layer.thumbnail} alt={layer.name} />
        <span>{layer.name}</span>
       </div>
      ))}
     </div>
    )}
   </div>
  </MapContainer>
 )

 return (
  <div className="user-container-fluid">
   <div className="status-pendakian-wrapper">
    <h3 className="status-header-title">Status Pendakian Hari Ini - {today}</h3>
    <div className="global-summary-wrapper">
     <div className="global-card green">
      <h4>Pendaki Naik</h4>
      <h2>{globalSummary.naik}</h2>
      <p>Sedang mendaki</p>
     </div>
     <div className="global-card yellow">
      <h4>Pendaki Turun</h4>
      <h2>{globalSummary.turun}</h2>
      <p>Sedang turun</p>
     </div>
     <div className="global-card blue">
      <h4>Pendaki Selesai</h4>
      <h2>{globalSummary.selesai}</h2>
      <p>Telah menyelesaikan</p>
     </div>
     <div className="global-card gray">
      <h4>Total Hari Ini</h4>
      <h2>{globalSummary.total}</h2>
      <p>Semua pendaki</p>
     </div>
    </div>
    {/* <div className="jalur-card-grid">
     {jalurSummaries.map((jalur) => (
      <div key={jalur.jalur_id} className="jalur-card">
       <h3 className="jalur-title">{jalur.nama_jalur}</h3>
       <div className="jalur-card-wrapper">
        <div className="subcard blue">
         <FontAwesomeIcon icon={faArrowUp} /> <p>Pendaki Naik</p>
         <h2>{jalur.naik}</h2>
        </div>
        <div className="subcard green">
         <FontAwesomeIcon icon={faArrowDown} /> <p>Pendaki Turun</p>
         <h2>{jalur.turun}</h2>
        </div>
        <div className="subcard orange">
         <FontAwesomeIcon icon={faUsers} /> <p>Total Hari Ini</p>
         <h2>{jalur.total}</h2>
        </div>
        <div className="subcard gray">
         <FontAwesomeIcon icon={faFlagCheckered} /> <p>Pendaki Selesai</p>
         <h2>{jalur.selesai}</h2>
        </div>
       </div>
      </div>
     ))}
    </div> */}
   </div>
   {jalurData.map(renderJalurMap)}
  </div>
 )
}
