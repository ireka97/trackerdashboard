import axios from "axios"

// const BASE_URL = "http://localhost:3008/statuspendakian"
const BASE_URL = `${import.meta.env.VITE_BASE_URL}/statuspendakian`

export const getstatuspendakian = (data) => axios.get(`${BASE_URL}/status`, data)
export const updatestatuspendakian = (data) => axios.post(`${BASE_URL}/status`, data)
