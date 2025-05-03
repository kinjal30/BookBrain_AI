import { neon } from "@neondatabase/serverless"
import bcrypt from "bcryptjs"
import dotenv from "dotenv"

// Load environment variables
dotenv.config()

// Create a SQL query function using the connection string
const sql = neon(process.env.POSTGRES_URL)

async function setupDatabase() {
  try {
    console.log("Connected to PostgreSQL database")
    console.log("Creating tables...")

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
    console.log("✅ Users table created")

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
    console.log("✅ Books table created")

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
    console.log("✅ Book summaries table created")

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
    console.log("✅ User books table created")

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
    console.log("✅ Book files table created")

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
    console.log("✅ Book embeddings table created")

    // Create admin user (username: admin, password: admin)
    const adminPassword = "admin"
    const adminPasswordHash = await bcrypt.hash(adminPassword, 10)

    await sql`
      INSERT INTO users (username, email, password_hash, is_admin)
      VALUES ('admin', 'admin@bookbrain.ai', ${adminPasswordHash}, TRUE)
      ON CONFLICT (username) DO NOTHING
    `
    console.log("✅ Admin user created")

    // Insert sample books
    await sql`
      INSERT INTO books (title, author, year, genre, description, cover_image)
      VALUES 
        ('To Kill a Mockingbird', 'Harper Lee', 1960, 'Fiction', 'The story of young Scout Finch and her father Atticus, a lawyer who defends a black man accused of raping a white woman in the 1930s Alabama.', '/placeholder.svg?height=400&width=300'),
        ('1984', 'George Orwell', 1949, 'Dystopian', 'A dystopian social science fiction novel that examines the consequences of totalitarianism, mass surveillance, and repressive regimentation.', '/placeholder.svg?height=400&width=300'),
        ('The Great Gatsby', 'F. Scott Fitzgerald', 1925, 'Fiction', 'The story primarily concerns the young and mysterious millionaire Jay Gatsby and his quixotic passion and obsession with the beautiful former debutante Daisy Buchanan.', '/placeholder.svg?height=400&width=300')
      ON CONFLICT DO NOTHING
    `
    console.log("✅ Sample books created")

    console.log("Database setup completed successfully!")
  } catch (error) {
    console.error("Error setting up database:", error)
    throw error
  }
}

setupDatabase().catch(console.error)
