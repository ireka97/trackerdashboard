import React from "react"
import {useNavigate} from "react-router-dom"
import "./NotFound.css"

export default function NotFound() {
 const navigate = useNavigate()

 return (
  <div className="notfound-container">
   <h1 className="notfound-oops">Oops!</h1>
   <h2 className="notfound-title">404 - PAGE NOT FOUND</h2>
   <p className="notfound-description">
    The page you are looking for might have been removed,
    <br />
    had its name changed or is temporarily unavailable.
   </p>
  </div>
 )
}

