
import {useState, useEffect, useMemo} from "react"
import {GetUsers, DeleteUser} from "../../../api/user"
import {GetSessions} from "../../../api/session.jsx"
import jalurData from "../../../config/jalur"
import {formatDateTime} from "../../../config/formateddate.js"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import TitleHeader from "../../../components/titleheader/titleheader"
import {faSearch, faArrowLeft, faArrowRight, faTrash} from "@fortawesome/free-solid-svg-icons"
import Swal from "sweetalert2"
import "leaflet/dist/leaflet.css"
import "./user.css"


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

 return (
  <div className="user-container-fluid">
   <TitleHeader title="Data Pendakil" subtitle="Kelola dan pantau data lengkap pendaki" />
   {/* Tabel User */}
   <div className="table-wrapper">
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
