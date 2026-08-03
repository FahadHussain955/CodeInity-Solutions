import axios from 'axios'
import { API_BASE_URL } from '@/constants/config'

export const axiosPublic = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

export const axiosPrivate = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

axiosPrivate.interceptors.request.use(
  (config) => {
    // TODO: Add JWT access token here
    return config
  },
  (error) => Promise.reject(error)
)

axiosPrivate.interceptors.response.use(
  (response) => response,
  async (error) => {
    // TODO: Handle 401 Unauthorized & Refresh Token logic here
    return Promise.reject(error)
  }
)
