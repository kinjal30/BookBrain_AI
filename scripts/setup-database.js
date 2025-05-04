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

    // Insert sample summaries
    await sql`
      INSERT INTO book_summaries (book_id, summary)
      VALUES 
        (1, 'To Kill a Mockingbird is a novel by Harper Lee published in 1960. It is set in the Depression-era South and follows young Scout Finch as she observes her father, Atticus, defend Tom Robinson, a Black man falsely accused of raping a white woman. The novel explores themes of racial injustice, moral growth, and the loss of innocence. Through Scout''s innocent perspective, readers witness the prejudice and hypocrisy of their small town. The novel also features the mysterious neighbor Boo Radley, who ultimately saves Scout and her brother Jem from an attack. The title refers to Atticus''s moral lesson that it''s a sin to kill mockingbirds—innocent creatures who only bring joy. The novel won the Pulitzer Prize and remains a powerful examination of human behavior and dignity in the face of hatred and prejudice.'),
        (2, '1984 is George Orwell''s dystopian masterpiece published in 1949. Set in a totalitarian superstate called Oceania, it follows Winston Smith, a low-ranking member of the ruling Party who secretly hates the government and dreams of rebellion. The society is under constant surveillance by Big Brother, and the Thought Police persecute individualism and independent thinking. Winston works at the Ministry of Truth, rewriting historical records to match the Party''s ever-changing version of history. He begins a forbidden relationship with Julia, a fellow worker, and they join what they believe is an underground resistance movement. However, they are betrayed, captured, and subjected to months of psychological torture until they betray each other and are completely broken. The novel explores themes of totalitarianism, mass surveillance, and the manipulation of truth. It introduced concepts like "doublethink," "Newspeak," and "thoughtcrime" that have become part of our cultural lexicon.'),
        (3, 'The Great Gatsby, published in 1925, is F. Scott Fitzgerald''s masterpiece capturing the essence of the Jazz Age. Set in the summer of 1922, it follows narrator Nick Carraway as he moves to West Egg, Long Island, next door to the mysterious millionaire Jay Gatsby. Gatsby hosts extravagant parties while pining for Nick''s cousin, Daisy Buchanan, now married to the wealthy but brutish Tom. The novel reveals Gatsby''s past: he reinvented himself from poor James Gatz to pursue wealth solely to win Daisy, whom he loved before the war. When Gatsby and Daisy reunite, their affair leads to tragedy after a confrontation with Tom. The novel ends with Gatsby''s murder by a grieving husband who mistakenly believes Gatsby killed his wife in a car accident actually caused by Daisy. Abandoned by the socialites who once flocked to his parties, Gatsby''s funeral is nearly unattended. The novel critiques the hollow pursuit of wealth and the corruption of the American Dream.')
      ON CONFLICT DO NOTHING
    `
    console.log("✅ Sample summaries created")

    console.log("Database setup completed successfully!")
  } catch (error) {
    console.error("Error setting up database:", error)
    throw error
  }
}

setupDatabase().catch(console.error)
