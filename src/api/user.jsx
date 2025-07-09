import axios from "axios";

const BASE_URL = `${import.meta.env.VITE_BASE_URL}/users`
//  const BASE_URL = "http://localhost:3008/users"

export const GetUsers = () => axios.get(`${BASE_URL}/`)
export const GetUserById = (user_id) => axios.get(`${BASE_URL}/${user_id}`)
export const DeleteUser = (user_id) => axios.delete(`${BASE_URL}/${user_id}`)


