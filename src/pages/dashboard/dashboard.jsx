import {Outlet} from "react-router-dom"
import {useState} from "react"
import Header from "../../components/header/header"
import Sidebar from "../../components/sidebar/sidebar"
import Footer from "../../components/footer/footer"
import "./dashboard.css"

export default function Dashboard() {
 const [isSidebarOpen, setIsSidebarOpen] = useState(false)
 return (
  <>
   <div className="dashboard-wrapper">
    <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
    <div className={`main-content-wrapper ${isSidebarOpen ? "with-sidebar" : "full-width"}`}>
     <Header />
     <main className="dashboard-content">
      <Outlet />
     </main>
     <Footer />
    </div>
   </div>
  </>
 )
}
