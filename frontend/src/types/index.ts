export interface User {
  id: string
  email: string
  full_name: string | null
  is_active: boolean
  is_admin: boolean
}

export interface DocumentItem {
  id: string
  original_filename: string
  file_type: string
  file_size_bytes: number
  page_count: number
  chunk_count: number
  status: 'processing' | 'ready' | 'failed'
  uploaded_at: string
}

export interface DocumentListResponse {
  documents: DocumentItem[]
  total_documents: number
  total_storage_bytes: number
}

export interface SourceOut {
  document_id: string
  document_name: string
  page: number
  snippet: string
}

export interface AskResponse {
  answer: string
  sources: SourceOut[]
  confidence: number
}

export interface ChatMessageItem {
  id: string
  question: string
  answer: string
  confidence: number
  sources: SourceOut[]
  created_at: string
}

export interface DashboardData {
  total_documents: number
  total_questions_asked: number
  storage_used_bytes: number
  recent_documents: DocumentItem[]
  recent_questions: ChatMessageItem[]
}

export interface SearchResultItem {
  document_id: string
  document_name: string
  page: number
  snippet: string
  similarity: number | null
}

export interface SearchResponse {
  results: SearchResultItem[]
  total_results: number
}

export interface AdminUser extends User {
  document_count: number
  question_count: number
}

export interface AdminAnalytics {
  total_users: number
  total_documents: number
  total_questions_asked: number
  total_storage_bytes: number
}
