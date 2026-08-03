export interface User {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'SELLER'
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}
