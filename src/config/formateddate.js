export const formatDateTime = (timestamp = Date.now()) => {
 const tanggal = new Date(timestamp)
 const hari = tanggal.toLocaleDateString("id-ID", {weekday: "long"})
 const tanggalAngka = tanggal.getDate()
 const bulan = tanggal.toLocaleDateString("id-ID", {month: "long"})
 const tahun = tanggal.getFullYear()
 const jam = tanggal.toLocaleTimeString("id-ID", {hour: "2-digit", minute: "2-digit"})

 return `${hari}, ${tanggalAngka} ${bulan} ${tahun} ${jam}`
}

export const formatDate = (timestamp = Date.now()) => {
 const tanggal = new Date(timestamp)
 const tanggalAngka = tanggal.getDate()
 const bulan = tanggal.toLocaleDateString("id-ID", {month: "long"})
 const tahun = tanggal.getFullYear()

 return `${tanggalAngka} ${bulan} ${tahun}`
}
           