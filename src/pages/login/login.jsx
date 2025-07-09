import React from "react"
import {useNavigate} from "react-router-dom"
import {useEffect, useState} from "react"
import {loginAdmin} from "../../api/admin"
import {ErrorAlert, SuccessAlert} from "../../components/alert"
import loginImg from "../../assets/login.jpg"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faUser, faLock} from "@fortawesome/free-solid-svg-icons"
import styles from "./login.module.css"

export default function Login() {
 const navigate = useNavigate()
 const [isError, setError] = useState("")
 const [isSuccess, setSuccess] = useState("")
 const [username, setUsername] = useState("")
 const [password, setPassword] = useState("")

 const handleLogin = async (e) => {
  e.preventDefault()
  const data = {username, password}

  if (!username || !password) {
   console.log("❌ Username/password kosong")
   setError("Username dan password tidak boleh kosong.")
   return
  }

  try {
   const response = await loginAdmin(data)
   console.log("✅ response:", response)

   if (response.status === 200) {
    setSuccess(response.data.message)
    localStorage.setItem("token", response.data.token)
    localStorage.setItem("username", response.data.admin?.username)
    setTimeout(() => navigate("/dashboard"), 1500)
   } else {
    setError(response?.data?.message || response?.data?.messege || "Terjadi kesalahan saat login.")
   }
  } catch (error) {
   console.error("❌ Error dari backend:", error)
   const msg = error.response?.data?.message || error.response?.data?.messege || "Terjadi kesalahan saat login."
   setError(msg)
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
    {isError && <ErrorAlert message={isError} onClose={() => setError("")} />}
    {isSuccess && <SuccessAlert message={isSuccess} onClose={() => setSuccess("")} />}
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
