import axios from "axios";

const BASE_URL = `${import.meta.env.VITE_BASE_URL}/sessions`

export const GetSessions = () => axios.get(`${BASE_URL}/`)
export const GetSessionById = (tracking_session_id) => axios.get(`${BASE_URL}/${tracking_session_id}`)
export const GetSessionByUserId = (user_id) => axios.get(`${BASE_URL}/user/${user_id}`)
export const DeleteSession = (session_id) => axios.delete(`${BASE_URL}/${session_id}`)
