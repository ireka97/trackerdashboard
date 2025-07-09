import React from "react"
import {useState, useEffect, useMemo} from "react"
import {MapContainer, TileLayer, Marker, Popup, Polyline, useMap} from "react-leaflet"
import {GetUsers} from "../../../api/user"
import {GetTrackingByUserId} from "../../../api/tracking"
import {GetSessions} from "../../../api/session.jsx"
import jalurData from "../../../config/jalur"
import {getLeafletIconFromConfig, MarkerIcon} from "../../../config/markericon.jsx"
import {formatDateTime} from "../../../config/formateddate.js"
import {FaRunning} from "@react-icons/all-files/fa/FaRunning" // ✅ jika pakai all-files
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faSearch, faArrowLeft, faArrowRight} from "@fortawesome/free-solid-svg-icons"
import DirectionArrowDecorator from "../../../config/jalurline.jsx"
import "leaflet/dist/leaflet.css"
import "./home.css"

// Komponen untuk zoom otomatis ke overlayBounds
function FitBoundsToJalur({bounds}) {
 const map = useMap()

 useEffect(() => {
  if (bounds && bounds.length === 2) {
   map.fitBounds(bounds)
  }
 }, [bounds, map])

 return null
}

const COLORS = ["red", "blue", "green", "orange", "purple", "brown", "pink", "black", "teal", "gray"]

export default function HomePage() {
 const [users, setUsers] = useState([])
 const [selectedUserId, setSelectedUserId] = useState("")
 const [allUserLogs, setAllUserLogs] = useState([])
 const [userTrackingData, setUserTrackingData] = useState(null)
 const [selectedJalur, setSelectedJalur] = useState(jalurData[1])
 const [searchTerm, setSearchTerm] = useState("")
 const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("") // State untuk debounce
 const [page, setPage] = useState(1)
 const [itemsPerPage] = useState(10)


 useEffect(() => {
  const timerId = setTimeout(() => {
   setDebouncedSearchTerm(searchTerm)
  }, 500) // Atur delay debounce (misalnya 500ms)
  return () => {
   clearTimeout(timerId)
  }
 }, [searchTerm])

 const handleInputChange = (e) => {
  setSearchTerm(e.target.value)
 }

 const filteredUsers = useMemo(() => {
  return users.filter((user) => user.nama.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
 }, [debouncedSearchTerm, users])

 const indexOfLastItem = page * itemsPerPage
 const indexOfFirstItem = indexOfLastItem - itemsPerPage
 const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem)
 const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)

 const handleNextPage = () => {
  if (page < totalPages) {
   setPage(page + 1)
  }
 }

 const handlePrevPage = () => {
  if (page > 1) {
   setPage(page - 1)
  }
 }

 useEffect(() => {
  const fetchCombinedUsers = async () => {
   try {
    const usersRes = await GetUsers()
    const sessionsRes = await GetSessions()

    const users = Array.isArray(usersRes.data.users) ? usersRes.data.users : []
    const sessions = Array.isArray(sessionsRes.data) ? sessionsRes.data : []

    const merged = users.map((u) => {
     const session = sessions.find((s) => String(s.user_id) === String(u.user_id))

     return {
      ...u,
      start_time: session?.start_time ?? null,
      end_time: session?.end_time ?? null,
      status: session?.status ?? null
     }
    })

    setUsers(merged)
   } catch (err) {
    console.error("Gagal fetch data user/sessions", err)
   }
  }

  fetchCombinedUsers()
  const intervalId = setInterval(fetchCombinedUsers, 10000) // ✅ refresh data setiap 10 detik

  return () => {
   clearInterval(intervalId)
  }
 }, [])


 useEffect(() => {
  if (!selectedUserId) {
   setUserTrackingData(null)
   return
  }

  const fetchInitialTracking = async () => {
   try {
    const response = await GetTrackingByUserId(selectedUserId)
    const fetched = Array.isArray(response.data) ? response.data[0] : response.data
    setUserTrackingData(fetched) // langsung render, tanpa merge
   } catch (err) {
    console.error("Gagal fetch tracking awal", err)
   }
  }

  fetchInitialTracking()
 }, [selectedUserId])

 useEffect(() => {
  if (!selectedUserId) return

  const intervalId = setInterval(async () => {
   try {
    const response = await GetTrackingByUserId(selectedUserId)
    const fetched = Array.isArray(response.data) ? response.data[0] : response.data
    const newSessions = fetched.tracking_session ?? []

    setUserTrackingData((prev) => {
     if (!prev) return fetched

     const prevSessions = prev.tracking_session ?? []

     const mergedSessions = newSessions.map((newSession) => {
      const prevSession = prevSessions.find((s) => s.tracking_session_id === newSession.tracking_session_id)

      if (prevSession) {
       const prevLogTimestamps = new Set(prevSession.tracking_log.map((l) => l.timestamp))
       const newLogs = newSession.tracking_log.filter((l) => !prevLogTimestamps.has(l.timestamp))

       return {
        ...newSession,
        tracking_log: [...prevSession.tracking_log, ...newLogs].sort(
         (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
        )
       }
      }

      return newSession
     })

     return {
      ...fetched,
      tracking_session: mergedSessions
     }
    })
   } catch (err) {
    console.error("Gagal refresh tracking berkala", err)
   }
  }, 10000)

  return () => clearInterval(intervalId)
 }, [selectedUserId])


 useEffect(() => {
  if (selectedUserId) return

  const fetchInitialTracking = async () => {
   const allLogs = []

   await Promise.all(
    currentItems.map(async (user) => {
     try {
      const res = await GetTrackingByUserId(user.user_id)
      const sessions = res.data[0]?.tracking_session ?? []

      const logs = sessions.flatMap((session) =>
       session.tracking_log
        .filter((log) => selectedJalur?.jalur_id == log.jalur_id)
        .map((log) => ({
         ...log,
         user_id: user.user_id,
         nama_user: user.nama
        }))
      )

      allLogs.push(...logs)
     } catch (e) {
      console.error("Gagal ambil tracking awal", user.user_id)
     }
    })
   )

   setAllUserLogs(allLogs) // 🔁 hanya di-set sekali
  }

  fetchInitialTracking()
 }, [currentItems, selectedJalur, selectedUserId])

 useEffect(() => {
  if (selectedUserId) return

  const intervalId = setInterval(async () => {
   const newLogs = []

   await Promise.all(
    currentItems.map(async (user) => {
     try {
      const res = await GetTrackingByUserId(user.user_id)
      const sessions = res.data[0]?.tracking_session ?? []

      const logs = sessions.flatMap((session) =>
       session.tracking_log
        .filter((log) => selectedJalur?.jalur_id == log.jalur_id)
        .map((log) => ({
         ...log,
         user_id: user.user_id,
         nama_user: user.nama
        }))
      )

      newLogs.push(...logs)
     } catch (e) {
      console.error("Gagal ambil tracking baru", user.user_id)
     }
    })
   )

   setAllUserLogs((prev) => {
    const prevTimestamps = new Set(prev.map((log) => log.timestamp))
    const filtered = newLogs.filter((log) => !prevTimestamps.has(log.timestamp))
    return [...prev, ...filtered]
   })
  }, 10000)

  return () => clearInterval(intervalId)
 }, [currentItems, selectedJalur, selectedUserId])

 useEffect(() => {
  if (filteredUsers.length === 1) {
   setSelectedUserId(filteredUsers[0].user_id)
  }
 }, [filteredUsers])

 // Flatten tracking logs
 const enhancedLogs = useMemo(() => {
  if (!userTrackingData?.tracking_session) return []

  const rawLogs = userTrackingData.tracking_session.flatMap((session) =>
   session.tracking_log
    .filter((log) => selectedJalur?.jalur_id == log.jalur_id)
    .map((log) => ({
     ...log,
     session_id: session.tracking_session_id,
     user_id: userTrackingData.user_id,
     nama_user: userTrackingData.nama,
     timestamp: new Date(log.timestamp),
     created_at: new Date(log.created_at)
    }))
  )

  const logs = [...rawLogs].sort((a, b) => a.created_at - b.created_at)

  const markedLogs = []
  const THRESHOLD_MS = 4000 // 1 menit
  //  const THRESHOLD_MS = 60 * 1000 // 1 menit
  let wasOffline = false

  for (let i = 0; i < logs.length; i++) {
   const current = logs[i]
   const prev = logs[i - 1]

   let offline = false
   let offlineStart = false
   let offlineEnd = false

   if (prev) {
    const delta = current.created_at - prev.created_at

    if (current.created_at.getTime() === prev.created_at.getTime() || delta <= THRESHOLD_MS) {
     // Jika dikirim bareng atau dalam < 1 menit = offline
     offline = true
     if (!wasOffline && delta >= THRESHOLD_MS) {
      // Jika sebelumnya normal → ini adalah awal offline
      offlineStart = true
     }
     wasOffline = true
    } else {
     // Jika sebelumnya offline dan sekarang > 1 menit → reconnect
     if (wasOffline && delta > THRESHOLD_MS) {
      offlineEnd = true
      wasOffline = false
     } else {
      wasOffline = false
     }
    }
   }

   markedLogs.push({
    ...current,
    offline,
    offlineStart,
    offlineEnd
   })
  }

  // urut kembali berdasarkan waktu kejadian
  return markedLogs.sort((a, b) => a.timestamp - b.timestamp)
 }, [userTrackingData, selectedJalur])


 const polylineCoords = useMemo(() => {
  return enhancedLogs.map((log) => [log.latitude, log.longitude])
 }, [enhancedLogs])

 const groupedLogs = useMemo(() => {
  const grouped = {}

  const logsByUser = {}

  for (const log of allUserLogs) {
   const key = log.user_id
   if (!logsByUser[key]) logsByUser[key] = []

   logsByUser[key].push({
    ...log,
    timestamp: new Date(log.timestamp),
    created_at: new Date(log.created_at)
   })
  }

  const THRESHOLD_MS = 4000 // Sama seperti enhancedLogs
  for (const userId in logsByUser) {
   const logs = [...logsByUser[userId]].sort((a, b) => a.created_at - b.created_at)

   const markedLogs = []
   let wasOffline = false

   for (let i = 0; i < logs.length; i++) {
    const current = logs[i]
    const prev = logs[i - 1]

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
      }
      wasOffline = false
     }
    }

    markedLogs.push({
     ...current,
     offline,
     offlineStart,
     offlineEnd
    })
   }

   // Urutkan berdasarkan timestamp jika perlu
   grouped[userId] = markedLogs.sort((a, b) => a.timestamp - b.timestamp)
  }

  return grouped
 }, [allUserLogs])

 return (
  <div className="user-container-fluid">
   <h2>User Tracking Dashboard</h2>
   <div className="users-actions">
    <div className="search-wrapper">
     <FontAwesomeIcon icon={faSearch} className="search-icon" />
     <input
      type="text"
      placeholder="Cari nama"
      value={searchTerm}
      onChange={handleInputChange}
      className="search-input"
     />
    </div>
   </div>

   {/* Dropdown Filter */}
   <div className="select-wrapper">
    <label>
     Pilih User:
     <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)}>
      <option value="">-- Pilih --</option>
      {users.map((u) => (
       <option key={u.user_id} value={u.user_id}>
        {u.nama}
       </option>
      ))}
     </select>
    </label>

    <label>
     Pilih Jalur:
     <select
      value={selectedJalur?.jalur_id || ""}
      onChange={(e) => {
       const selected = jalurData.find((j) => j.jalur_id === e.target.value)
       setSelectedJalur(selected)
      }}
      style={{marginLeft: "10px"}}>
      <option value="">-- Pilih Jalur --</option>
      {jalurData.map((j) => (
       <option key={j.jalur_id} value={j.jalur_id}>
        {j.nama_jalur}
       </option>
      ))}
     </select>
    </label>
   </div>

   {/* Peta */}
   <div className="map-container">
    <h3 className="title-peta">Peta Tracking: {selectedJalur?.nama_jalur ?? " "}</h3>
    <MapContainer
     whenCreated={(mapInstance) => {
      mapRef.current = mapInstance
     }}
     center={selectedJalur?.map?.center || [-7.25, 112.75]}
     zoom={13}
     style={{height: "500px", border: "2px solid #000"}}>
     <TileLayer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      attribution="&copy; OpenStreetMap contributors"
     />

     {/* Pos dari jalur */}
     {selectedJalur?.map?.markers.map((m, idx) => (
      <Marker
       key={`pos-${idx}`}
       position={[m.geometry.coordinates[1], m.geometry.coordinates[0]]}
       icon={getLeafletIconFromConfig(m.icon)}>
       <Popup>
        <b>{m.nama_pos}</b>
        <br />
        <span>{m.description}</span>
       </Popup>
      </Marker>
     ))}

     {/* Polyline jalur */}
     {selectedJalur?.map?.polylineCoordnate.map((segment, idx) => (
      <Polyline key={`poly-${idx}`} positions={segment.map(([lng, lat]) => [lat, lng])} color="black" weight={5} />
     ))}

     {/* Marker dari log user */}
     {enhancedLogs.map((log, idx) => {
      let color = "red" // Default warna online
      if (log.offlineEnd) {
       color = "green"
      } else if (log.offline || log.offlineStart) {
       color = "orange"
      }
      return (
       <Marker
        key={`log-${idx}`}
        position={[log.latitude, log.longitude]}
        icon={getLeafletIconFromConfig({
         lib: "FontAwesome5",
         name: "running",
         size: 20,
         color: color
        })}>
        <Popup>
         <b>{log.tracking_log_id}</b>
         <br />
         <b>{log.nama_user}</b>
         <br />
         {log.keterangan ?? "-"}
         <br />
         {formatDateTime(log.timestamp)}
         <br />
         {log.accuracy ?? "-"} (M)
        </Popup>
       </Marker>
      )
     })}
     {polylineCoords.length > 1 && <Polyline positions={polylineCoords} color="red" weight={8} />}
     {selectedUserId && <DirectionArrowDecorator polylineCoords={polylineCoords} />}

     {!selectedUserId &&
      Object.entries(groupedLogs).map(([userId, logs], i) => {
       const color = COLORS[i % COLORS.length]

       return (
        <React.Fragment key={`user-${userId}`}>
         {logs.map((log, idx) => {
          let iconColor = color
          if (log.offlineEnd) iconColor = "green"
          else if (log.offline || log.offlineStart) iconColor = "orange"

          return (
           <Marker
            key={`log-${userId}-${idx}`}
            position={[log.latitude, log.longitude]}
            icon={getLeafletIconFromConfig({
             lib: "FontAwesome5",
             name: "running",
             size: 20,
             color: iconColor
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
          )
         })}

         {logs.length > 1 && (
          <Polyline key={`poly-${userId}`} positions={logs.map((l) => [l.latitude, l.longitude])} color={color} />
         )}
        </React.Fragment>
       )
      })}

     {/* Zoom otomatis ke jalur */}
     {selectedJalur?.map?.overlayBounds && <FitBoundsToJalur bounds={selectedJalur.map.overlayBounds} />}
    </MapContainer>

    <div className="legend-wrapper">
     <h1 className="legend-title">Legenda</h1>
     <div className="legend">
      {/* Marker pos */}
      {selectedJalur?.map?.markers.map((m, i) => (
       <div key={i} className="legend-item">
        {MarkerIcon(m.icon)}
        <span>{m.nama_pos}</span>
       </div>
      ))}

      {selectedUserId
       ? (() => {
          const selectedUser = users.find((u) => String(u.user_id) === String(selectedUserId))
          const color = COLORS[0] // satu warna default
          return (
           <div key={selectedUserId} className="legend-item">
            <FaRunning color={color} />
            <span>{selectedUser?.nama ?? "User"}</span>
           </div>
          )
         })()
       : Array.isArray(currentItems) &&
         currentItems.length > 0 &&
         currentItems.map((u, i) => (
          <div key={`${u.user_id ?? "noid"}-${i}`} className="legend-item">
           <FaRunning color={COLORS[i % COLORS.length]} />
           <span>{u.nama}</span>
          </div>
         ))}

      <div className="legend-item">
       <div className="color-box-jalur"></div>
       <span>Jalur pendakian</span>
      </div>
      <div className="legend-item">
       <div className="color-box-jejak"></div>
       <span>Jejak Pendaki</span>
      </div>
      <div className="legend-item">
       <FaRunning color="orange" />
       <span>Terakhir Sebelum Offline</span>
      </div>
      <div className="legend-item">
       <FaRunning color="green" />
       <span>Pertama Setelah Reconnect</span>
      </div>
     </div>
    </div>
   </div>

   {/* Tabel User */}
   <div className="table-wrapper">
    <h3 style={{marginTop: "20px"}}>Tabel Daftar User</h3>
    <table border="1" cellPadding={6} style={{width: "100%"}}>
     <thead>
      <tr>
       <th>User ID</th>
       <th>Nama</th>
       <th>No Telpon</th>
       <th>Alamat</th>
       <th>Usia</th>
       <th>Waktu Mulai</th>
       <th>Waktu Akhir</th>
       <th>Status</th>
      </tr>
     </thead>
     <tbody>
      {currentItems.map((u) => (
       <tr key={u.user_id}>
        <td>{u.user_id}</td>
        <td>{u.nama}</td>
        <td>{parseInt(u.telepon)}</td>
        <td>{u.alamat}</td>
        <td>{u.umur}</td>
        <td>{u.start_time ? formatDateTime(u.start_time) : "Belum Mulai Pendakian"}</td>
        <td>
         {!u.start_time ? "Tidak ada Pendakian" : u.end_time ? formatDateTime(u.end_time) : "Masih Dalam Pendakian"}{" "}
        </td>
        <td>{u.status ? u.status : "Tidak Ada pendakian"}</td>
       </tr>
      ))}
     </tbody>
    </table>
    <div className="pagination-controls">
     <button className="pagination-button" onClick={handlePrevPage} disabled={page === 1}>
      <FontAwesomeIcon icon={faArrowLeft} />
      <span> Prev </span>
     </button>
     <span data-pagination-info>
      {page} dari {totalPages}
     </span>
     <button className="pagination-button" onClick={handleNextPage} disabled={page === totalPages}>
      <span> Next </span> <FontAwesomeIcon icon={faArrowRight} />
     </button>
    </div>
   </div>
  </div>
 )
}
