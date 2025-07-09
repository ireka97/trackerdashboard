import {useState, useEffect} from "react"
import {useNavigate} from "react-router-dom"
import Identicon from "../identicon/identicon"
import './header.css'

export default function Header() {
 const [username, setUsername] = useState("")
 const navigate = useNavigate()

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
   <h1>Dashboard</h1>
   <div className="header-right">
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
