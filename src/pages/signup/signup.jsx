import {registerAdmin} from "../../api/admin"
import {useNavigate} from "react-router-dom"
import {useEffect, useState} from "react"
import loginImg from "../../assets/login.jpg"
import {ErrorAlert, SuccessAlert} from "../../components/alert"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faUser, faLock, faEnvelope} from "@fortawesome/free-solid-svg-icons"
import styles from "./Signup.module.css"

export default function Signup() {
 const navigate = useNavigate()
 const [isError, setError] = useState("")
 const [isSuccess, setSuccess] = useState("")
 const [username, setUsername] = useState("")
 const [password, setPassword] = useState("")
 const [email, setEmail] = useState("")

 const handleSignup = async (e) => {
  e.preventDefault()
  const data = {username, password, email}
  if (!username || !password || !email) {
   setError("Username, password, dan email tidak boleh kosong.")
   return
  }

  try {
   const res = await registerAdmin(data)
   console.log("data signup", res)
   if (res.status === 200) {
    setSuccess(res.data?.message || "Signup berhasil")
    setTimeout(() => navigate("/login"), 1500)
   } else {
    setError(res.data?.message || "Signup gagal")
   }
  } catch (err) {
   setError("Terjadi kesalahan saat signup.")
  }
 }

 const handlenavigatelogin = () => {
  navigate("/login")
 }

return (
 <div className={styles.container}>
  <div className={styles.formSection}>
   <form className={styles.formBox} onSubmit={handleSignup}>
    {isError && <ErrorAlert message={isError} onClose={() => setError("")} />}
    {isSuccess && <SuccessAlert message={isSuccess} onClose={() => setSuccess("")} />}
    <h1 className={styles.title}>Signup</h1>

    <div className={styles.inputBlock}>
     <label className={styles.inputLabel}>Email</label>
     <div className={styles.inputWrapper}>
      <FontAwesomeIcon icon={faEnvelope} className={styles.inputIcon} />
      <input
       type="email"
       placeholder="Email"
       className={styles.inputField}
       value={email}
       onChange={(e) => setEmail(e.target.value)}
      />
     </div>
    </div>

    <div className={styles.inputBlock}>
     <label className={styles.inputLabel}>Username</label>
     <div className={styles.inputWrapper}>
      <FontAwesomeIcon icon={faUser} className={styles.inputIcon} />
      <input
       type="text"
       placeholder="Username"
       className={styles.inputField}
       value={username}
       onChange={(e) => setUsername(e.target.value)}
      />
     </div>
    </div>

    <div className={styles.inputBlock}>
     <label className={styles.inputLabel}>Password</label>
     <div className={styles.inputWrapper}>
      <FontAwesomeIcon icon={faLock} className={styles.inputIcon} />
      <input
       type="password"
       placeholder="Password"
       className={styles.inputField}
       value={password}
       onChange={(e) => setPassword(e.target.value)}
      />
     </div>
    </div>

    <div className={styles.buttonGroup}>
     <div className={styles.buttonWrapper}>
      <button type="submit" className={styles.btn}>
       Sign Up
      </button>
     </div>
     <div className={styles.buttonWrapper}>
      <button type="button" onClick={handlenavigatelogin} className={styles.btn}>
       Back to Login
      </button>
     </div>
    </div>
   </form>
  </div>

  <div className={styles.imageSection}>
   <img className={styles.image} src={loginImg} alt="login" />
   <div className={styles.overlay}></div>
  </div>
 </div>
)
}
