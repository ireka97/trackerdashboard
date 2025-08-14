import {useEffect, useState} from "react"
import {getregistrasi, approvalregistrasi} from "../../../api/registerasi"
import Swal from "sweetalert2"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faSearch, faChevronLeft, faChevronRight, faEye} from "@fortawesome/free-solid-svg-icons"
import {formatDate} from "../../../config/formateddate"
import Loader from "../../../components/loader/loader"
import TitleHeader from "../../../components/titleheader/titleheader"
import Table from "react-bootstrap/Table"
import "./registrasi.css"

export default function RegistrasiPage() {
 const [registers, setRegisters] = useState([])
 const [loading, setLoading] = useState(false)
 const [error, setError] = useState("")

 const [isDataDirty, setIsDataDirty] = useState(false)
 const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
 const [searchTerm, setSearchTerm] = useState("")
 const [pdfUrl, setPdfUrl] = useState(null)
 const [isPdfModalOpen, setIsPdfModalOpen] = useState(false)
 const [page, setPage] = useState(1)
 const [itemsPerPage] = useState(10)

 useEffect(() => {
  const fetchData = async () => {
   setLoading(true)
   try {
    const response = await getregistrasi()
    console.log(response)
    setRegisters(response.data.register || [])
   } catch (error) {
    console.error("Error fetching surveyors:", error)
   } finally {
    setLoading(false)
   }
  }
  fetchData()
 }, [isDataDirty])

 useEffect(() => {
  const timerId = setTimeout(() => {
   setDebouncedSearchTerm(searchTerm)
  }, 500)
  return () => {
   clearTimeout(timerId)
  }
 }, [searchTerm])

 const handleInputChange = (e) => {
  setSearchTerm(e.target.value)
 }

 const handleApprove = async (register_id) => {
  try {
   setLoading(true)
   await approvalregistrasi(register_id)
   Swal.fire("Pendakian berhasil disetujui")
   setIsDataDirty(true)
  } catch (error) {
   console.log(error)
   Swal.fire("Gagal!", "Terjadi kesalahan saat menyetujui pendakian", "error")
  } finally {
   setLoading(false)
  }
 }

 const filteredRegisters = registers.filter((reg) => reg.nama.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))

 const indexOfLastItem = page * itemsPerPage
 const indexOfFirstItem = indexOfLastItem - itemsPerPage
 const currentItems = filteredRegisters.slice(indexOfFirstItem, indexOfLastItem)
 const totalPages = Math.ceil(filteredRegisters.length / itemsPerPage)

 const handleNextPage = () => {
  if (page < totalPages) setPage(page + 1)
 }

 const handlePrevPage = () => {
  if (page > 1) setPage(page - 1)
 }

 if (loading) {
  return (
   <>
    <Loader />
   </>
  )
 }

 return (
  <div className="register-container">
   <TitleHeader title="Data Registrasi Pendakian" subtitle="Kelola pendaftaran dan booking pendakian" />
   <div className="register-actions">
    <div className="search-wrapper">
     <FontAwesomeIcon icon={faSearch} className="search-icon" />
     <input
      type="text"
      placeholder="Cari Register..."
      value={searchTerm}
      onChange={handleInputChange}
      className="search-input"
     />
    </div>
   </div>

   {isPdfModalOpen && (
    <div className="custom-modal-overlay" onClick={() => setIsPdfModalOpen(false)}>
     <div className="custom-modal-content" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
       <h4>Bukti Booking</h4>
       <button className="modal-close" onClick={() => setIsPdfModalOpen(false)}>
        ×
       </button>
      </div>
      <div className="modal-body">
       <iframe
        src={`https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(pdfUrl)}`}
        width="100%"
        height="500px"
        title="Bukti Booking PDF"
       />
      </div>
     </div>
    </div>
   )}

   <Table className="register-table">
    <thead>
     <tr className="table-header">
      <th>No</th>
      <th>Nama Register</th>
      <th>Tanggal Pendakian</th>
      <th>Tanggal Turun</th>
      <th>Jumlah Anggota</th>
      <th>Jalur</th>
      <th>Status</th>
      <th>Bukti Booking</th>
      <th>Aksi</th>
     </tr>
    </thead>
    <tbody>
     {currentItems.map((reg, i) => (
      <tr key={reg.register_id} className="table-row">
       <td>{i + 1}</td>
       <td>{reg.nama}</td>
       <td>{formatDate(reg.tanggal_pendakian)}</td>
       <td>{formatDate(reg.tanggal_turun)}</td>
       <td>{reg.jumlah_anggota}</td>
       <td>{reg.jalur}</td>
       <td>
        {reg.status === "diterima" && <span className="status-diterima">✔ Diterima</span>}
        {reg.status === "perlu verifikasi" && <span className="status-pending">⚠ Pending</span>}
        {reg.status === "ditolak" && <span className="status-ditolak">❌ Ditolak</span>}
       </td>
       <td>
        {reg.bukti_booking ? (
         <button
          className="view-button"
          onClick={() => {
           setPdfUrl(reg.bukti_booking)
           setIsPdfModalOpen(true)
          }}
          title="Lihat Bukti Booking">
          <FontAwesomeIcon icon={faEye} />
         </button>
        ) : (
         <span className="no-bukti">Tidak ada bukti</span>
        )}
       </td>
       <td>
        {reg.status === "perlu verifikasi" && (
         <button onClick={() => handleApprove(reg.register_id)} className="approve-button">
          Setujui
         </button>
        )}
       </td>
      </tr>
     ))}
    </tbody>
   </Table>
   <div className="pagination-controls">
    <button onClick={handlePrevPage} disabled={page === 1} className="pagination-button">
     <FontAwesomeIcon icon={faChevronLeft} /> Prev
    </button>
    <span className="pagination-info">
     {page} dari {totalPages}
    </span>
    <button onClick={handleNextPage} disabled={page === totalPages} className="pagination-button">
     Next <FontAwesomeIcon icon={faChevronRight} />
    </button>
   </div>
  </div>
 )
}
