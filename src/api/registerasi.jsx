import axios from "axios"

// const BASE_URL = "http://localhost:80/register"
const BASE_URL = `${import.meta.env.VITE_BASE_URL}/register`


export const getregistrasi = (data) => axios.get(`${BASE_URL}`, data)
export const approvalregistrasi = (register_id) => axios.post(`${BASE_URL}/approve/${register_id}`)