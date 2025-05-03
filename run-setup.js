import { exec } from "child_process"
import dotenv from "dotenv"

// Load environment variables
dotenv.config()

console.log("Starting database setup...")
console.log(`Using database URL: ${process.env.POSTGRES_URL ? "✅ Found" : "❌ Missing"}`)

// Run the setup script
exec("node scripts/setup-database.js", (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`)
    return
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`)
    return
  }
  console.log(`stdout: ${stdout}`)
  console.log("Database setup completed!")
})
