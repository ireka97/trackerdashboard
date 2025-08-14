import {useState, useEffect} from "react"
import {useNavigate} from "react-router-dom"
import Identicon from "../identicon/identicon"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faBell } from "@fortawesome/free-solid-svg-icons"
import { getregistrasi } from "../../api/registerasi.jsx" // Pastikan path sesuai
import './header.css'

export default function Header() {
 const [username, setUsername] = useState("")
 const [pendingCount, setPendingCount] = useState(0)
 const navigate = useNavigate()

 useEffect(() => {
  const fetchPending = async () => {
   try {
    const res = await getregistrasi()
    const registers = res.data.register || []
    const pending = registers.filter((reg) => reg.status === "perlu verifikasi")
    setPendingCount(pending.length)
   } catch (err) {
    console.error("Gagal mengambil data pending:", err)
   }
  }

  fetchPending()

  // Optional: polling setiap 30 detik
  const interval = setInterval(fetchPending, 30000)
  return () => clearInterval(interval)
 }, [])
 useEffect(() => {
  const username = localStorage.getItem("username")
  if (username) {
   setUsername(username)
  }
 }, [])

 const handleLogout = () => {
  localStorage.removeItem("token")
  localStorage.removeItem("username")
  navigate("/login")
 }

 return (
  <header className="header">
   <h1
    style={{
     fontFamily: "Chewy",
     textShadow: "2px 2px 4px rgba(13, 129, 23, 0.94)",
     color: "#fff"
    }}>
    Gunung Trafik Control
   </h1>
   <div className="header-right">
    <div className="notification-wrapper" onClick={() => navigate("/dashboard/registrasi")}>
     <FontAwesomeIcon icon={faBell} size={25} className="bell-icon" />
     {pendingCount > 0 && <span className="badge">{pendingCount}</span>}
    </div>
    <div className="identicon-header" onClick={handleLogout}>
     <div className="identicon-top">
      <span className="identicon-header-username">{username}</span>
      <div>{username ? <Identicon username={username} size={40} /> : <span>Loading…</span>}</div>
     </div>
     <div className="logout-text">
      <span>LOGOUT</span>
     </div>
    </div>
   </div>
  </header>
 )
}
