export interface Book {
  id: string
  title: string
  author: string
  year: number
  genre: string
  description?: string
  coverImage?: string
}

export interface BookSummary {
  bookId: string
  summary: string
  createdAt: string
}

export interface User {
  id: string
  username: string
  email: string
  isAdmin: boolean
}

export interface BookFile {
  bookId: string
  filePath: string
  fileSize: number
}

export interface Session {
  user: User
  expires: string
}
