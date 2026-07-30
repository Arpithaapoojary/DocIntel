import axios from 'axios'
import type {
  User,
  DocumentItem,
  DocumentListResponse,
  AskResponse,
  ChatMessageItem,
  DashboardData,
  SearchResultItem,
  SearchResponse,
  AdminUser,
  AdminAnalytics,
} from '../types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export const api = axios.create({ baseURL: API_BASE_URL })

const TOKEN_KEY = 'docintel_token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Redirect to login on any 401 (expired/invalid token), except for the
// login/register calls themselves — those should surface their own error.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthEndpoint = error.config?.url?.includes('/login') || error.config?.url?.includes('/register')
    if (error.response?.status === 401 && !isAuthEndpoint) {
      clearToken()
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export function extractErrorMessage(error: unknown, fallback = 'Something went wrong.'): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg
  }
  return fallback
}

// --- Auth ---
export async function registerUser(email: string, fullName: string, password: string): Promise<User> {
  const { data } = await api.post<User>('/register', { email, full_name: fullName, password })
  return data
}

export async function loginUser(email: string, password: string): Promise<{ access_token: string; user: User }> {
  const { data } = await api.post('/login', { email, password })
  return data
}

export async function getCurrentUser(): Promise<User> {
  const { data } = await api.get<User>('/me')
  return data
}

// --- Documents ---
export async function uploadDocument(file: File, onProgress?: (pct: number) => void): Promise<DocumentItem> {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await api.post<DocumentItem>('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (evt) => {
      if (onProgress && evt.total) onProgress(Math.round((evt.loaded / evt.total) * 100))
    },
  })
  return data
}

export async function listDocuments(): Promise<DocumentListResponse> {
  const { data } = await api.get<DocumentListResponse>('/documents')
  return data
}

export async function deleteDocument(id: string): Promise<void> {
  await api.delete(`/document/${id}`)
}

// --- Q&A ---
export async function askQuestion(question: string, documentIds?: string[]): Promise<AskResponse> {
  const { data } = await api.post<AskResponse>('/ask', { question, document_ids: documentIds ?? null })
  return data
}

export async function getHistory(): Promise<ChatMessageItem[]> {
  const { data } = await api.get<ChatMessageItem[]>('/history')
  return data
}

export async function clearHistory(): Promise<void> {
  await api.delete('/history')
}

// --- Dashboard ---
export async function getDashboard(): Promise<DashboardData> {
  const { data } = await api.get<DashboardData>('/dashboard')
  return data
}

// --- Search ---
export interface SearchParams {
  query: string
  mode: 'semantic' | 'keyword'
  document_ids?: string[] | null
  uploaded_after?: string | null
  uploaded_before?: string | null
  top_k?: number
}

export async function searchDocuments(params: SearchParams): Promise<{ results: SearchResultItem[]; total_results: number }> {
  const { data } = await api.post<SearchResponse>('/search', params)
  return data
}

// --- Admin ---
export async function adminListUsers(): Promise<AdminUser[]> {
  const { data } = await api.get<AdminUser[]>('/admin/users')
  return data
}

export async function adminDeleteUser(userId: string): Promise<void> {
  await api.delete(`/admin/users/${userId}`)
}

export async function adminDeleteDocument(documentId: string): Promise<void> {
  await api.delete(`/admin/documents/${documentId}`)
}

export async function adminGetAnalytics(): Promise<AdminAnalytics> {
  const { data } = await api.get<AdminAnalytics>('/admin/analytics')
  return data
}
