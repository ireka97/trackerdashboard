import axios from "axios"

const BASE_URL = `${import.meta.env.VITE_BASE_URL}/tracking`
//  const BASE_URL = "http://localhost:3008/tracking"

export const GetTrackings = () => axios.get(`${BASE_URL}/getall`)
export const GetTrackingById = (tracking_id) => axios.get(`${BASE_URL}/${tracking_id}`)
export const GetTrackingByUserId = (user_id) => axios.get(`${BASE_URL}/user/${user_id}`)
