import React, {useState} from "react"
import {useNavigate} from "react-router-dom"
import {loginAdmin} from "../../api/admin"
import Swal from "sweetalert2" // 🔹 Import SweetAlert2
import loginImg from "../../assets/login.jpg"
import styles from "./login.module.css"

export default function Login() {
 const navigate = useNavigate()
 const [username, setUsername] = useState("")
 const [password, setPassword] = useState("")

 const handleLogin = async (e) => {
  e.preventDefault()
  const data = {username, password}

  if (!username || !password) {
   Swal.fire({
    icon: "error",
    title: "Oops...",
    text: "Username dan password tidak boleh kosong."
   })
   return
  }

  try {
   const response = await loginAdmin(data)

   if (response.status === 200) {
    Swal.fire({
     icon: "success",
     title: "Berhasil!",
     text: response.data.message,
     timer: 1500,
     showConfirmButton: false
    })
    localStorage.setItem("token", response.data.token)
    localStorage.setItem("username", response.data.admin?.username)
    setTimeout(() => navigate("/dashboard"), 1500)
   } else {
    Swal.fire({
     icon: "error",
     title: "Gagal Login",
     text: response?.data?.message || "Terjadi kesalahan saat login."
    })
   }
  } catch (error) {
   Swal.fire({
    icon: "error",
    title: "Error",
    text: error.response?.data?.message || "Terjadi kesalahan saat login."
   })
  }
 }

 const handleNavigateRegister = () => {
  navigate("/signup")
 }

 return (
  <div className={styles.loginContainer}>
   <div className={styles.imageSection}>
    <img className={styles.loginImage} src={loginImg} alt="image" />
    <div className={styles.imageOverlay} />
   </div>

   <div className={styles.formSection}>
    <form onSubmit={handleLogin} className={styles.formBox}>
     <h2 className={styles.formTitle}>LOGIN</h2>

     <div className={styles.inputGroup}>
      <label className={styles.inputLabel}>Username</label>
      <input
       placeholder="username"
       className={styles.inputField}
       type="text"
       value={username}
       onChange={(e) => setUsername(e.target.value)}
      />
     </div>

     <div className={styles.inputGroup}>
      <label className={styles.inputLabel}>Password</label>
      <input
       placeholder="password"
       className={styles.inputField}
       type="password"
       value={password}
       onChange={(e) => setPassword(e.target.value)}
      />
     </div>

     <div className={styles.buttonGroup}>
      <div className={styles.buttonWrapper}>
       <button type="submit" className={styles.btn}>
        LOGIN
       </button>
      </div>
      <div className={styles.buttonWrapper}>
       <button type="button" onClick={handleNavigateRegister} className={styles.btn}>
        REGISTER
       </button>
      </div>
     </div>
    </form>
   </div>
  </div>
 )
}
