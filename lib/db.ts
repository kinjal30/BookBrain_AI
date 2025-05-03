import { neon, neonConfig } from "@neondatabase/serverless"
import bcryptjs from "bcryptjs"
import type { User, Book } from "@/types/book"

// Configure Neon
neonConfig.fetchConnectionCache = true

// Create a SQL query function using the connection string
const sql = neon(process.env.POSTGRES_URL!)

// Database initialization
let dbInitialized = false

export async function initializeDatabase() {
  if (dbInitialized) return true

  try {
    console.log("Checking database tables...")

    // Check if books table exists
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'books'
      );
    `

    const tablesExist = tableCheck[0]?.exists || false

    if (!tablesExist) {
      console.log("Creating database tables...")

      // Create users table
      await sql`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(100) NOT NULL UNIQUE,
          email VARCHAR(255) NOT NULL UNIQUE,
          password_hash VARCHAR(255) NOT NULL,
          is_admin BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `

      // Create books table
      await sql`
        CREATE TABLE IF NOT EXISTS books (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          author VARCHAR(255) NOT NULL,
          year INTEGER,
          genre VARCHAR(100),
          description TEXT,
          cover_image VARCHAR(255),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `

      // Create book_summaries table
      await sql`
        CREATE TABLE IF NOT EXISTS book_summaries (
          id SERIAL PRIMARY KEY,
          book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
          summary TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(book_id)
        )
      `

      // Create user_books table (for user's library)
      await sql`
        CREATE TABLE IF NOT EXISTS user_books (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
          added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, book_id)
        )
      `

      // Create book_files table (for uploaded PDFs)
      await sql`
        CREATE TABLE IF NOT EXISTS book_files (
          id SERIAL PRIMARY KEY,
          book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
          file_path VARCHAR(255) NOT NULL,
          file_size INTEGER NOT NULL,
          uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(book_id)
        )
      `

      // Create book_embeddings table (for vector search)
      await sql`
        CREATE TABLE IF NOT EXISTS book_embeddings (
          id SERIAL PRIMARY KEY,
          book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
          embedding JSON NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(book_id)
        )
      `

      // Create admin user (username: admin, password: admin)
      const adminPassword = "admin"
      const adminPasswordHash = await bcryptjs.hash(adminPassword, 10)

      await sql`
        INSERT INTO users (username, email, password_hash, is_admin)
        VALUES ('admin', 'admin@bookbrain.ai', ${adminPasswordHash}, TRUE)
        ON CONFLICT (username) DO NOTHING
      `

      // Insert sample books
      await sql`
        INSERT INTO books (title, author, year, genre, description, cover_image)
        VALUES 
          ('To Kill a Mockingbird', 'Harper Lee', 1960, 'Fiction', 'The story of young Scout Finch and her father Atticus, a lawyer who defends a black man accused of raping a white woman in the 1930s Alabama.', '/placeholder.svg?height=400&width=300'),
          ('1984', 'George Orwell', 1949, 'Dystopian', 'A dystopian social science fiction novel that examines the consequences of totalitarianism, mass surveillance, and repressive regimentation.', '/placeholder.svg?height=400&width=300'),
          ('The Great Gatsby', 'F. Scott Fitzgerald', 1925, 'Fiction', 'The story primarily concerns the young and mysterious millionaire Jay Gatsby and his quixotic passion and obsession with the beautiful former debutante Daisy Buchanan.', '/placeholder.svg?height=400&width=300')
        ON CONFLICT DO NOTHING
      `

      console.log("Database tables created successfully!")
    } else {
      console.log("Database tables already exist.")
    }

    dbInitialized = true
    return true
  } catch (error) {
    console.error("Error initializing database:", error)
    return false
  }
}

// User functions
export async function getUserByEmail(email: string): Promise<User | null> {
  await initializeDatabase()
  try {
    const result = await sql`SELECT * FROM users WHERE email = ${email}`
    if (result.length === 0) {
      return null
    }
    return mapDbUserToUser(result[0])
  } catch (error) {
    console.error("Error getting user by email:", error)
    return null
  }
}

export async function getUserById(id: number): Promise<User | null> {
  await initializeDatabase()
  try {
    const result = await sql`SELECT * FROM users WHERE id = ${id}`
    if (result.length === 0) {
      return null
    }
    return mapDbUserToUser(result[0])
  } catch (error) {
    console.error("Error getting user by ID:", error)
    return null
  }
}

export async function createUser(username: string, email: string, password: string): Promise<User | null> {
  await initializeDatabase()
  try {
    const passwordHash = await bcryptjs.hash(password, 10)
    const result = await sql`
      INSERT INTO users (username, email, password_hash) 
      VALUES (${username}, ${email}, ${passwordHash}) 
      RETURNING *
    `
    return mapDbUserToUser(result[0])
  } catch (error) {
    console.error("Error creating user:", error)
    return null
  }
}

export async function verifyCredentials(email: string, password: string): Promise<User | null> {
  await initializeDatabase()
  try {
    const result = await sql`SELECT * FROM users WHERE email = ${email}`
    if (result.length === 0) {
      return null
    }

    const user = result[0]
    const passwordMatch = await bcryptjs.compare(password, user.password_hash)
    if (!passwordMatch) {
      return null
    }

    return mapDbUserToUser(user)
  } catch (error) {
    console.error("Error verifying credentials:", error)
    return null
  }
}

// Book functions
export async function getAllBooks(): Promise<Book[]> {
  await initializeDatabase()
  try {
    const result = await sql`SELECT * FROM books ORDER BY title`
    return result.map(mapDbBookToBook)
  } catch (error) {
    console.error("Error getting all books:", error)
    return []
  }
}

export async function getBookById(id: number): Promise<Book | null> {
  await initializeDatabase()
  try {
    const result = await sql`SELECT * FROM books WHERE id = ${id}`
    if (result.length === 0) {
      return null
    }
    return mapDbBookToBook(result[0])
  } catch (error) {
    console.error("Error getting book by ID:", error)
    return null
  }
}

export async function createBook(book: Omit<Book, "id">): Promise<Book | null> {
  await initializeDatabase()
  try {
    const result = await sql`
      INSERT INTO books (title, author, year, genre, description, cover_image) 
      VALUES (${book.title}, ${book.author}, ${book.year}, ${book.genre}, ${book.description}, ${book.coverImage}) 
      RETURNING *
    `
    return mapDbBookToBook(result[0])
  } catch (error) {
    console.error("Error creating book:", error)
    return null
  }
}

export async function updateBook(id: number, book: Partial<Book>): Promise<Book | null> {
  await initializeDatabase()
  try {
    const currentBook = await getBookById(id)
    if (!currentBook) {
      return null
    }

    const updatedBook = {
      title: book.title || currentBook.title,
      author: book.author || currentBook.author,
      year: book.year || currentBook.year,
      genre: book.genre || currentBook.genre,
      description: book.description || currentBook.description,
      coverImage: book.coverImage || currentBook.coverImage,
    }

    const result = await sql`
      UPDATE books 
      SET 
        title = ${updatedBook.title}, 
        author = ${updatedBook.author}, 
        year = ${updatedBook.year}, 
        genre = ${updatedBook.genre}, 
        description = ${updatedBook.description}, 
        cover_image = ${updatedBook.coverImage}, 
        updated_at = CURRENT_TIMESTAMP 
      WHERE id = ${id} 
      RETURNING *
    `

    if (result.length === 0) {
      return null
    }

    return mapDbBookToBook(result[0])
  } catch (error) {
    console.error("Error updating book:", error)
    return null
  }
}

export async function deleteBook(id: number): Promise<boolean> {
  await initializeDatabase()
  try {
    const result = await sql`DELETE FROM books WHERE id = ${id} RETURNING id`
    return result.length > 0
  } catch (error) {
    console.error("Error deleting book:", error)
    return false
  }
}

// Book summary functions
export async function getBookSummary(bookId: number): Promise<string | null> {
  await initializeDatabase()
  try {
    const result = await sql`SELECT summary FROM book_summaries WHERE book_id = ${bookId}`
    if (result.length === 0) {
      return null
    }
    return result[0].summary
  } catch (error) {
    console.error("Error getting book summary:", error)
    return null
  }
}

export async function saveBookSummary(bookId: number, summary: string): Promise<boolean> {
  await initializeDatabase()
  try {
    await sql`
      INSERT INTO book_summaries (book_id, summary) 
      VALUES (${bookId}, ${summary}) 
      ON CONFLICT (book_id) 
      DO UPDATE SET summary = ${summary}, updated_at = CURRENT_TIMESTAMP
    `
    return true
  } catch (error) {
    console.error("Error saving book summary:", error)
    return false
  }
}

// User library functions
export async function addBookToUserLibrary(userId: number, bookId: number): Promise<boolean> {
  await initializeDatabase()
  try {
    await sql`
      INSERT INTO user_books (user_id, book_id) 
      VALUES (${userId}, ${bookId}) 
      ON CONFLICT (user_id, book_id) DO NOTHING
    `
    return true
  } catch (error) {
    console.error("Error adding book to user library:", error)
    return false
  }
}

export async function removeBookFromUserLibrary(userId: number, bookId: number): Promise<boolean> {
  await initializeDatabase()
  try {
    const result = await sql`
      DELETE FROM user_books 
      WHERE user_id = ${userId} AND book_id = ${bookId} 
      RETURNING id
    `
    return result.length > 0
  } catch (error) {
    console.error("Error removing book from user library:", error)
    return false
  }
}

export async function getUserLibrary(userId: number): Promise<Book[]> {
  await initializeDatabase()
  try {
    const result = await sql`
      SELECT b.* FROM books b
      JOIN user_books ub ON b.id = ub.book_id
      WHERE ub.user_id = ${userId}
      ORDER BY ub.added_at DESC
    `
    return result.map(mapDbBookToBook)
  } catch (error) {
    console.error("Error getting user library:", error)
    return []
  }
}

export async function isBookInUserLibrary(userId: number, bookId: number): Promise<boolean> {
  await initializeDatabase()
  try {
    const result = await sql`
      SELECT id FROM user_books 
      WHERE user_id = ${userId} AND book_id = ${bookId}
    `
    return result.length > 0
  } catch (error) {
    console.error("Error checking if book is in user library:", error)
    return false
  }
}

// Book file functions
export async function saveBookFile(bookId: number, filePath: string, fileSize: number): Promise<boolean> {
  await initializeDatabase()
  try {
    await sql`
      INSERT INTO book_files (book_id, file_path, file_size) 
      VALUES (${bookId}, ${filePath}, ${fileSize}) 
      ON CONFLICT (book_id) 
      DO UPDATE SET file_path = ${filePath}, file_size = ${fileSize}, uploaded_at = CURRENT_TIMESTAMP
    `
    return true
  } catch (error) {
    console.error("Error saving book file:", error)
    return false
  }
}

export async function getBookFile(bookId: number): Promise<{ filePath: string; fileSize: number } | null> {
  await initializeDatabase()
  try {
    const result = await sql`
      SELECT file_path, file_size FROM book_files 
      WHERE book_id = ${bookId}
    `
    if (result.length === 0) {
      return null
    }
    return {
      filePath: result[0].file_path,
      fileSize: result[0].file_size,
    }
  } catch (error) {
    console.error("Error getting book file:", error)
    return null
  }
}

// Book embedding functions
export async function saveBookEmbedding(bookId: number, embedding: number[]): Promise<boolean> {
  await initializeDatabase()
  try {
    await sql`
      INSERT INTO book_embeddings (book_id, embedding) 
      VALUES (${bookId}, ${JSON.stringify(embedding)}) 
      ON CONFLICT (book_id) 
      DO UPDATE SET embedding = ${JSON.stringify(embedding)}, updated_at = CURRENT_TIMESTAMP
    `
    return true
  } catch (error) {
    console.error("Error saving book embedding:", error)
    return false
  }
}

export async function getBookEmbedding(bookId: number): Promise<number[] | null> {
  await initializeDatabase()
  try {
    const result = await sql`
      SELECT embedding FROM book_embeddings 
      WHERE book_id = ${bookId}
    `
    if (result.length === 0) {
      return null
    }
    return result[0].embedding
  } catch (error) {
    console.error("Error getting book embedding:", error)
    return null
  }
}

export async function getAllBookEmbeddings(): Promise<{ bookId: number; embedding: number[] }[]> {
  await initializeDatabase()
  try {
    const result = await sql`SELECT book_id, embedding FROM book_embeddings`
    return result.map((row) => ({
      bookId: row.book_id,
      embedding: row.embedding,
    }))
  } catch (error) {
    console.error("Error getting all book embeddings:", error)
    return []
  }
}

// Search functions
export async function searchBooks(query: string): Promise<Book[]> {
  await initializeDatabase()
  try {
    const searchPattern = `%${query}%`
    const result = await sql`
      SELECT * FROM books 
      WHERE title ILIKE ${searchPattern} OR author ILIKE ${searchPattern} OR description ILIKE ${searchPattern}
      ORDER BY title
    `
    return result.map(mapDbBookToBook)
  } catch (error) {
    console.error("Error searching books:", error)
    return []
  }
}

// Helper functions to map database objects to application objects
function mapDbUserToUser(dbUser: any): User {
  return {
    id: dbUser.id.toString(),
    username: dbUser.username,
    email: dbUser.email,
    isAdmin: dbUser.is_admin,
  }
}

function mapDbBookToBook(dbBook: any): Book {
  return {
    id: dbBook.id.toString(),
    title: dbBook.title,
    author: dbBook.author,
    year: dbBook.year,
    genre: dbBook.genre,
    description: dbBook.description || undefined,
    coverImage: dbBook.cover_image || undefined,
  }
}
