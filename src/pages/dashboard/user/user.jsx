import React from "react"
import {useState, useEffect, useMemo} from "react"
import {MapContainer, TileLayer, Marker, Popup, Polyline, useMap} from "react-leaflet"
import {GetUsers, DeleteUser} from "../../../api/user"
import {GetTrackingByUserId} from "../../../api/tracking"
import {GetSessions} from "../../../api/session.jsx"
import jalurData from "../../../config/jalur"
import {getLeafletIconFromConfig, MarkerIcon} from "../../../config/markericon.jsx"
import {formatDateTime} from "../../../config/formateddate.js"
import {FaRunning} from "@react-icons/all-files/fa/FaRunning" // ✅ jika pakai all-files
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faSearch, faArrowLeft, faArrowRight, faTrash} from "@fortawesome/free-solid-svg-icons"
import Swal from "sweetalert2"
import "leaflet/dist/leaflet.css"
import "./user.css"

// Komponen untuk zoom otomatis ke overlayBounds
// function FitBoundsToJalur({bounds}) {
//  const map = useMap()

//  useEffect(() => {
//   if (bounds && bounds.length === 2) {
//    map.fitBounds(bounds)
//   }
//  }, [bounds, map])

//  return null
// }

// const COLORS = ["red", "blue", "green", "orange", "purple", "brown", "pink", "black", "teal", "gray"]

export default function UserPage() {
 const [users, setUsers] = useState([])
 const [selectedUserId, setSelectedUserId] = useState("")
 const [allUserLogs, setAllUserLogs] = useState({})
 const [userTrackingData, setUserTrackingData] = useState(null)
 const [selectedJalur, setSelectedJalur] = useState(jalurData[1])
 const [searchTerm, setSearchTerm] = useState("")
 const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("") // State untuk debounce
 const [isDataDirty, setIsDataDirty] = useState(false) // State untuk memicu re-fetch data
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
 }, [isDataDirty])

 const handleDelete = async (user_id) => {
  const result = await Swal.fire({
   title: "Yakin ingin menghapus?",
   text: "Data user akan dihapus permanen.",
   icon: "warning",
   showCancelButton: true,
   confirmButtonColor: "#d33",
   cancelButtonColor: "#3085d6",
   confirmButtonText: "Ya, hapus!",
   cancelButtonText: "Batal"
  })
  if (result.isConfirmed)
   try {
    await DeleteUser(user_id)
    Swal.fire("Terhapus!", "User berhasil dihapus.", "success")
    setUsers((prevUsers) => prevUsers.filter((user) => user.user_id !== user_id))

    setIsDataDirty(true)
   } catch (e) {
    console.error("Error deleting surveyor:", e)
    Swal.fire("Gagal!", "Terjadi kesalahan saat menghapus.", e)
   }
 }

 // Ambil tracking log user
 //  useEffect(() => {
 //   if (!selectedUserId) {
 //    setUserTrackingData(null)
 //    return
 //   }

 //   let intervalId

 //   const fetchTracking = async () => {
 //    try {
 //     const response = await GetTrackingByUserId(selectedUserId)
 //     const fetched = Array.isArray(response.data) ? response.data[0] : response.data
 //     const newSessions = fetched.tracking_session ?? []

 //     setUserTrackingData((prev) => {
 //      if (!prev) return fetched

 //      const prevSessions = prev.tracking_session ?? []

 //      // Gabungkan sesi berdasarkan ID
 //      const mergedSessions = newSessions.map((newSession) => {
 //       const prevSession = prevSessions.find((s) => s.tracking_session_id === newSession.tracking_session_id)

 //       // Jika sesi sudah ada, hanya tambahkan log yang baru
 //       if (prevSession) {
 //        const prevLogTimestamps = new Set(prevSession.tracking_log.map((l) => l.timestamp))
 //        const newLogs = newSession.tracking_log.filter((l) => !prevLogTimestamps.has(l.timestamp))

 //        return {
 //         ...newSession,
 //         tracking_log: [...prevSession.tracking_log, ...newLogs].sort(
 //          (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
 //         )
 //        }
 //       }

 //       // Jika sesi belum ada, tambahkan seluruh sesi
 //       return newSession
 //      })

 //      return {
 //       ...fetched,
 //       tracking_session: mergedSessions
 //      }
 //     })
 //    } catch (err) {
 //     console.error("Gagal fetch logs", err)
 //    }
 //   }
 //   fetchTracking()
 //   intervalId = setInterval(fetchTracking, 10000) // setiap 10 detik

 //   return () => {
 //    clearInterval(intervalId)
 //   }
 //  }, [selectedUserId])

 //  useEffect(() => {
 //   if (selectedUserId) return
 //   const fetchAllTracking = async () => {
 //    const logData = {}

 //    await Promise.all(
 //     currentItems.map(async (user) => {
 //      try {
 //       const res = await GetTrackingByUserId(user.user_id)
 //       const sessions = res.data[0]?.tracking_session ?? []
 //       const logs = sessions.flatMap((session) =>
 //        session.tracking_log
 //         .filter((log) => selectedJalur?.jalur_id == log.jalur_id)
 //         .map((log) => ({
 //          ...log,
 //          user_id: user.user_id,
 //          nama_user: user.nama
 //         }))
 //       )

 //       const processLogsWithOfflineDetection = (logs, threshold = 1 * 60 * 1000) => {
 //        const sorted = [...logs].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
 //        const offlineIndices = [] // ✅ deklarasikan dulu

 //        for (let i = 0; i < sorted.length - 1; i++) {
 //         const cur = sorted[i]
 //         const next = sorted[i + 1]
 //         const delta = new Date(next.timestamp) - new Date(cur.timestamp)
 //         if (delta > threshold) {
 //          offlineIndices.push(i) // index titik terakhir sebelum offline
 //         }
 //        }

 //        return sorted.map((log, i) => {
 //         const isReconnect = offlineIndices.includes(i - 1) // titik setelah offlineStart
 //         const isLostBefore = offlineIndices.includes(i) // titik terakhir sebelum offline
 //         return {
 //          ...log,
 //          offlineStart: isLostBefore,
 //          offlineEnd: isReconnect
 //         }
 //        })
 //       }
 //       logData[user.user_id] = processLogsWithOfflineDetection(logs)
 //      } catch (e) {
 //       console.error("Gagal ambil tracking", user.user_id)
 //      }
 //     })
 //    )

 //    setAllUserLogs(logData)
 //   }

 //   fetchAllTracking()
 //   const intervalId = setInterval(fetchAllTracking, 10000)

 //   return () => clearInterval(intervalId)
 //  }, [currentItems, selectedJalur, selectedUserId])

 //  useEffect(() => {
 //   if (filteredUsers.length === 1) {
 //    setSelectedUserId(filteredUsers[0].user_id)
 //   }
 //  }, [filteredUsers])

 //  // Flatten tracking logs
 //  const enhancedLogs = useMemo(() => {
 //   if (!userTrackingData?.tracking_session) return []

 //   const rawLogs = userTrackingData.tracking_session.flatMap((session) =>
 //    session.tracking_log
 //     .filter((log) => selectedJalur?.jalur_id == log.jalur_id)
 //     .map((log) => ({
 //      ...log,
 //      session_id: session.tracking_session_id,
 //      user_id: userTrackingData.user_id,
 //      nama_user: userTrackingData.nama
 //     }))
 //   )

 //   const logs = [...rawLogs].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
 //   const threshold = 1 * 60 * 1000
 //   const offlineIndices = []

 //   for (let i = 0; i < logs.length - 1; i++) {
 //    const cur = logs[i]
 //    const next = logs[i + 1]
 //    const delta = new Date(next.timestamp) - new Date(cur.timestamp)
 //    if (delta > threshold) {
 //     offlineIndices.push(i)
 //    }
 //   }

 //   return logs.map((log, i) => {
 //    const isReconnect = offlineIndices.includes(i - 1)
 //    const isLostBefore = offlineIndices.includes(i)
 //    return {
 //     ...log,
 //     offlineStart: isLostBefore,
 //     offlineEnd: isReconnect
 //    }
 //   })
 //  }, [userTrackingData, selectedJalur])

 //  const polylineCoords = useMemo(() => {
 //   return enhancedLogs.map((log) => [log.latitude, log.longitude])
 //  }, [enhancedLogs])

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

   {/* Tabel User */}
   <div className="table-wrapper">
    <h3 style={{marginTop: "20px"}}>Daftar User</h3>
    <table border="1" cellPadding={6} style={{width: "100%"}}>
     <thead>
      <tr>
       <th>ID</th>
       <th>Nama</th>
       <th>No Telpon</th>
       <th>Alamat</th>
       <th>Usia</th>
       <th>Waktu Mulai</th>
       <th>Waktu Akhir</th>
       <th>Status</th>
       <th className="action-tabel">Aksi</th>
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
        <td>
         <div className="action-buttons">
          {/* <button onClick={() => openModal(surveyor)} className="edit-button">
           <FontAwesomeIcon icon={faPen} className="add-icon" />
          </button> */}
          <button onClick={() => handleDelete(u.user_id)} className="delete-button">
           <FontAwesomeIcon icon={faTrash} className="add-icon" />
          </button>
         </div>
        </td>
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
