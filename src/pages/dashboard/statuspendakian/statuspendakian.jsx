import {getstatuspendakian, updatestatuspendakian} from "../../../api/status_pendakian"
import { formatDate } from "../../../config/formateddate"
import {useState, useEffect} from "react"
import Loader from "../../../components/loader/loader"
import "./statuspendakian.css"

export default function StatusPendakianDashboard() {
 const [data, setData] = useState([])
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState(null)

 useEffect(() => {
  const fetchData = async () => {
   try {
    setLoading(true)
    const response = await getstatuspendakian() // ✅ endpoint return semua jalur
    setData(response.data.data)
   } catch (err) {
    setError(err.message)
   } finally {
    setLoading(false)
   }
  }
  fetchData()
 }, [])

 const handleToggle = async (jalur, currentStatus, kuota_max, biaya) => {
  const newStatus = currentStatus === "Dibuka" ? "Ditutup" : "Dibuka"
  try {
   await updatestatuspendakian({jalur, status: newStatus, kuota_max, biaya})
   setData((prev) => prev.map((item) => (item.jalur === jalur ? {...item, status: newStatus} : item)))
  } catch (err) {
   alert("Gagal update status")
  }
 }

 if (loading) return <Loader/>
 if (error) return <div>Error: {error}</div>

 return (
  <div className="status-pendakian-container">
   <div className="tittle">
    <h1>Status Pendakian per Jalur</h1>
   </div>

   <div className="pendakian-status-wrapper">
    {data.map((item) => {
     const isOpen = item.status === "Dibuka"
     return (
      <div key={item.jalur} className={`status-wrapper ${isOpen ? "status-open" : "status-closed"}`}>
       <h2>{item.jalur}</h2>
       <p>
        <strong>Status:</strong> {item.status}
       </p>
       <p>
        <strong>Kuota Maks:</strong> {item.kuota_max}
       </p>
       <p>
        <strong>Kuota Terpakai:</strong> {item.kuota_terpakai}
       </p>
       <p>
        <strong>Kuota Tersisa:</strong> {item.kuota_tersisa}
       </p>
       <button
        onClick={() => handleToggle(item.jalur, item.status, item.kuota_max, item.biaya)}
        className="button-status">
        {isOpen ? "Tutup Pendakian" : "Buka Pendakian"}
       </button>
      </div>
     )
    })}
   </div>
  </div>
 )
}
