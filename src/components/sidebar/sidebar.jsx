import {Link, useLocation} from "react-router-dom"
import sar from "/public/images/sarkra.jpg"
import agl from "/public/images/agl.jpeg"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
 faHome,
 faUser,
 faCog,
 faCircleUser,
 faFile,
 faPenNib,
 faGear,
 faPenToSquare,
 faMap,
 faBars,
 faXmark,
 faCheckSquare,
 faAddressCard,
 faHiking
} from "@fortawesome/free-solid-svg-icons"
import "./sidebar.css"

const navItems = [
 {
  name: "Home",
  icon: faHome,
  path: "/dashboard"
 },
 {
  name: "Peta",
  icon: faMap,
  path: "/dashboard/peta"
 },
 {
  name: "User/Pendaki",
  icon: faHiking,
  path: "/dashboard/user"
 },
 {
  name: "Status Pendakian",
  icon: faCheckSquare,
  path: "/dashboard/statuspendakian"
 },
 {
  name: "Registrasi",
  icon: faAddressCard,
  path: "/dashboard/registrasi"
 },
 {
  name: "Setting",
  icon: faCog,
  path: "/dashboard/setting"
 }
]

export default function Sidebar({isOpen, setIsOpen}) {
 const location = useLocation()
 return (
  <div className={`sidebar ${isOpen ? "show" : "hide"}`}>
   <div className="sidebar-toggle" onClick={() => setIsOpen(!isOpen)}>
    <FontAwesomeIcon icon={isOpen ? faXmark : faBars} />
   </div>
   <div className="sidebar-header">
    <img src={sar} alt="logo" className="sidebar-logo" />
    <div className="sidebar-brand">Dashboard Tracking</div>
    <img src={agl} alt="logo" className="sidebar-logo" />
   </div>
   <ul className="sidebar-list">
    {navItems.map((item) => (
     <li key={item.path} className={location.pathname === item.path ? "active" : ""}>
      <Link to={item.path}>
       <FontAwesomeIcon icon={item.icon} className="sidebar-icon" />
       <span>{item.name}</span>
      </Link>
     </li>
    ))}
   </ul>
  </div>
 )
}
