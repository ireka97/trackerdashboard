import {BrowserRouter as Router, Routes, Route, Navigate} from "react-router-dom"
import PrivateRoute from "./hooks/privayeroute"
import Login from "./pages/login/login.jsx"
import Signup from "./pages/signup/signup.jsx"
import Dashboard from "./pages/dashboard/dashboard.jsx"
import HomePage from "./pages/dashboard/home/home.jsx"
import NotFound from "./pages/notfoundpage/notfound.jsx"
import User from "./pages/dashboard/user/user.jsx"
import UserPage from "./pages/dashboard/user/user.jsx"
import StatusPendakian from "./pages/dashboard/statuspendakian/statuspendakian.jsx"
import RegistrasiPage from "./pages/dashboard/registrasi/registrasi.jsx"
import PetaPage from "./pages/dashboard/peta/peta.jsx"

// import tailwindcss from "tailwindcss"

function App() {
 return (
  <Router>
   <Routes>
    <Route path="/" element={<Navigate to="/login" />} />
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<Signup />} />
    <Route
     path="/dashboard"
     element={
      <PrivateRoute>
       <Dashboard />
      </PrivateRoute>
     }>
     <Route index element={<HomePage />} />
     <Route path="user" element={<UserPage />} />
     <Route path="statuspendakian" element={<StatusPendakian />} />
     <Route path="registrasi" element={<RegistrasiPage />} />
     <Route path="peta" element={<PetaPage />} />
     <Route path="*" element={<NotFound />} />
    </Route>
   </Routes>
  </Router>
 )
}

export default App
