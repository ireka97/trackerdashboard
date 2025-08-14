import {useState, useEffect, useMemo} from "react"
import Swal from "sweetalert2"; // 🔹 Tambahkan import
import {getstatuspendakian, updatestatuspendakian} from "../../../api/status_pendakian"
import {GetAllTrackingModelByUser} from "../../../api/tracking"
import Loader from "../../../components/loader/loader"
import jalurData from "../../../config/jalur"
import "./statuspendakian.css"

export default function StatusPendakianDashboard() {
 const [data, setData] = useState([])
 const [originalData, setOriginalData] = useState([])
 const [users, setUsers] = useState([])
 const [cuaca, setCuaca] = useState({})
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState(null)

 const todayStr = new Date().toISOString().slice(0, 10)

 const weatherDescriptions = {
  0: "Cerah",
  1: "Sebagian berawan",
  2: "Berawan",
  3: "Mendung",
  45: "Berkabut",
  48: "Berkabut (es)",
  51: "Gerimis ringan",
  53: "Gerimis sedang",
  55: "Gerimis lebat",
  61: "Hujan ringan",
  63: "Hujan sedang",
  65: "Hujan lebat",
  71: "Salju ringan",
  73: "Salju sedang",
  75: "Salju lebat",
  95: "Badai petir"
 }

 const getWeatherIcon = (code) => {
  if ([0].includes(code)) return "☀️"
  if ([1, 2].includes(code)) return "⛅"
  if ([3].includes(code)) return "☁️"
  if ([45, 48].includes(code)) return "🌫️"
  if ([51, 53, 55, 61, 63, 65].includes(code)) return "🌧️"
  if ([95].includes(code)) return "⛈️"
  return "❓"
 }

 // Fetch status pendakian
 useEffect(() => {
  const fetchData = async () => {
   try {
    setLoading(true)
    const response = await getstatuspendakian()
    console.log(response.data.data)
    setData(response.data.data)
    setOriginalData(response.data.data)
   } catch (err) {
    setError(err.message)
   } finally {
    setLoading(false)
   }
  }
  fetchData()
 }, [])

 // Fetch tracking users
 useEffect(() => {
  const fetchUsers = async () => {
   try {
    const res = await GetAllTrackingModelByUser()
    setUsers(res.data)
   } catch (err) {
    console.error("Gagal ambil data tracking user", err)
   }
  }
  fetchUsers()
  const intervalId = setInterval(fetchUsers, 60000)
  return () => clearInterval(intervalId)
 }, [])

 // Fetch cuaca
 useEffect(() => {
  const fetchWeather = async () => {
   try {
    const cuacaData = {}
    for (const jalur of jalurData) {
     const bounds = jalur.map?.overlayBounds
     if (!bounds || bounds.length < 2) continue

     const [sw, ne] = bounds
     const latCenter = (sw[0] + ne[0]) / 2
     const lonCenter = (sw[1] + ne[1]) / 2
     const url = `https://api.open-meteo.com/v1/forecast?latitude=${latCenter}&longitude=${lonCenter}&current_weather=true&timezone=auto`

     try {
      const res = await fetch(url)
      const json = await res.json()
      if (json.current_weather) {
       cuacaData[String(jalur.jalur_id)] = {
        suhu: json.current_weather.temperature,
        kode: json.current_weather.weathercode
       }
      }
     } catch (err) {
      console.error(`Gagal fetch cuaca untuk ${jalur.jalur}`, err)
     }
    }
    setCuaca(cuacaData)
   } catch (err) {
    console.error("Gagal ambil cuaca:", err)
   }
  }
  fetchWeather()
 }, [])

 const normalize = (s) => (s || "").toString().trim().toLowerCase().replace(/\s+/g, " ")

 // mapping: nama dari jalurData → jalur_id
 const jalurIdByName = useMemo(() => {
  const map = {}
  jalurData.forEach((j) => {
   map[normalize(j.nama_jalur)] = String(j.jalur_id)
  })
  return map
 }, [])

 const jalurSummaries = useMemo(() => {
  return jalurData.map((jalur) => {
   const idJalur = String(jalur.jalur_id)

   // Cari status berdasarkan ID
   let jalurDetail = data.find((d) => String(jalurIdByName[normalize(d.jalur)]) === idJalur)

   let naik = 0,
    turun = 0,
    selesai = 0
   users.forEach((u) => {
    u.tracking_sessions?.forEach((s) => {
     const sessionDate = new Date(s.updated_at || s.start_time || s.created_at).toISOString().slice(0, 10)
     const status = s.status?.toLowerCase()
     if (String(s.jalur_id) === idJalur && sessionDate === todayStr) {
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
    jalur_id: idJalur,
    nama_jalur: jalur.nama_jalur, // dari config, biar konsisten di UI
    status: jalurDetail?.status || "Ditutup",
    kuota_max: jalurDetail?.kuota_max || 0,
    naik,
    turun,
    selesai,
    totalHariIni: naik + turun + selesai
   }
  })
 }, [users, todayStr, data, jalurIdByName])

 const handleFieldChange = (index, field, value) => {
  setData((prev) => prev.map((item, i) => (i === index ? {...item, [field]: value} : item)))
 }

 const handleToggleStatus = (index) => {
  setData((prev) =>
   prev.map((item, i) => (i === index ? {...item, status: item.status === "Dibuka" ? "Ditutup" : "Dibuka"} : item))
  )
 }

 const handleReset = () => {
  Swal.fire({
   title: "Yakin ingin reset?",
   text: "Semua perubahan yang belum disimpan akan hilang.",
   icon: "warning",
   showCancelButton: true,
   confirmButtonColor: "#3085d6",
   cancelButtonColor: "#d33",
   confirmButtonText: "Ya, reset",
   cancelButtonText: "Batal"
  }).then((result) => {
   if (result.isConfirmed) {
    setData(originalData)
    Swal.fire({
     icon: "success",
     title: "Reset Berhasil",
     timer: 1500,
     showConfirmButton: false
    })
   }
  })
 }

 const handleSaveAll = async () => {
  Swal.fire({
   title: "Simpan Perubahan?",
   text: "Semua perubahan akan disimpan ke server.",
   icon: "question",
   showCancelButton: true,
   confirmButtonColor: "#3085d6",
   cancelButtonColor: "#d33",
   confirmButtonText: "Ya, simpan",
   cancelButtonText: "Batal"
  }).then(async (result) => {
   if (result.isConfirmed) {
    try {
     for (const item of data) {
      await updatestatuspendakian({
       jalur: item.jalur,
       status: item.status,
       kuota_max: Number(item.kuota_max),
       biaya: Number(item.biaya)
      })
     }
     Swal.fire({
      icon: "success",
      title: "Berhasil",
      text: "Semua perubahan berhasil disimpan",
      timer: 1500,
      showConfirmButton: false
     })
     setOriginalData(data)
    } catch (err) {
     Swal.fire({
      icon: "error",
      title: "Gagal",
      text: "Gagal menyimpan perubahan"
     })
    }
   }
  })
 }
          

 if (loading) return <Loader />
 if (error) return <div>Error: {error}</div>

 return (
  <>
   {/* Summary */}
   <div className="summary-container">
    {jalurSummaries.map((sum, idx) => {
     const isOpen = sum.status === "Dibuka"
     const kuotaMax = Number(sum.kuota_max || 0)
     const kuotaHariIni = sum.totalHariIni
     const kapasitasPersen = kuotaMax > 0 ? Math.min((kuotaHariIni / kuotaMax) * 100, 100) : 0
     const cuacaJalur = cuaca[sum.jalur_id]

     return (
      <div key={sum.jalur_id || `summary-${idx}`} className={`summary-card ${isOpen ? "jalur-open" : "jalur-closed"}`}>
       <div className="summary-header">
        <h3>{sum.nama_jalur}</h3>
        <span className={`status-badge ${isOpen ? "open" : "closed"}`}>{isOpen ? "Buka" : "Tutup"}</span>
       </div>

       {cuacaJalur && (
        <div className="weather-info">
         <span>Cuaca:</span>
         <span>
          {getWeatherIcon(cuacaJalur.kode)} {weatherDescriptions[cuacaJalur.kode] || "Tidak diketahui"} -{" "}
          {cuacaJalur.suhu}°C
         </span>
        </div>
       )}

       <div className="capacity-bar">
        <span>
         {kuotaHariIni}/{kuotaMax}
        </span>
        <div className="bar-bg">
         <div className="bar-fill" style={{width: `${kapasitasPersen}%`}}></div>
        </div>
       </div>

       <div className="summary-stats">
        <span>Naik: {sum.naik}</span>
        <span>Turun: {sum.turun}</span>
        <span>Selesai: {sum.selesai}</span>
       </div>
      </div>
     )
    })}
   </div>

   {/* Edit Status */}
   <div className="status-container">
    {data.map((item, index) => {
     const isOpen = item.status === "Dibuka"
     return (
      <div
       key={item.jalur_id || `${item.jalur}-${index}`}
       className={`jalur-card ${isOpen ? "jalur-open" : "jalur-closed"}`}>
       <div className="jalur-header">
        <h2>{item.jalur}</h2>
        <div className="status-toggle">
         <span className="status-label">{isOpen ? "Buka" : "Tutup"}</span>
         <label className="switch">
          <input type="checkbox" checked={isOpen} onChange={() => handleToggleStatus(index)} />
          <span className="slider round"></span>
         </label>
        </div>
       </div>

       <div className="jalur-body">
        <div className="form-group">
         <label>Kapasitas Maksimal</label>
         <input
          type="number"
          value={item.kuota_max}
          onChange={(e) => handleFieldChange(index, "kuota_max", e.target.value)}
         />
        </div>

        <div className="form-group">
         <label>Kuota Terpakai</label>
         <input type="number" value={item.kuota_terpakai} readOnly />
        </div>

        <div className="form-group">
         <label>Kuota Tersisa</label>
         <input type="number" value={item.kuota_tersisa} readOnly />
        </div>

        <div className="form-group">
         <label>Estimasi Biaya</label>
         <input type="number" value={item.biaya} onChange={(e) => handleFieldChange(index, "biaya", e.target.value)} />
        </div>
       </div>
      </div>
     )
    })}

    <div className="jalur-footer">
     <button className="reset-button" onClick={handleReset}>
      Reset
     </button>
     <button className="save-button" onClick={handleSaveAll}>
      Simpan Perubahan
     </button>
    </div>
   </div>
  </>
 )
}
