import axios from "axios"

// const BASE_URL = "http://localhost:3008/admin"
const BASE_URL = `${import.meta.env.VITE_BASE_URL}/admin`

export const loginAdmin = (data) => axios.post(`${BASE_URL}/login`, data)
export const registerAdmin = (data) => axios.post(`${BASE_URL}/signup`, data)
