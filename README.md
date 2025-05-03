# BookBrain AI

> Your AI-powered assistant for managing and exploring books with intelligent summaries and a modern UI.

**BookBrain AI** is a full-stack, LLM-integrated book management system built using cutting-edge technologies like **Groq**, **Pinecone**, and **PostgreSQL**. Designed for scalability, speed, and simplicity, it provides both users and admins with a seamless experience for searching, summarizing, and managing book data.

---

## ✨ Features

- 🔍 **Book Search & Browsing**  
  Intuitive interface for searching and navigating through the book collection.

- 🧠 **AI-Powered Summaries**  
  Leverages Groq’s LLM to generate high-quality summaries on demand.

- 🛠️ **Admin Dashboard**  
  Full CRUD capabilities for adding, updating, or removing books.

- 🔐 **User Authentication**  
  Secure login & registration system with role-based access control.

- 📱 **Responsive UI**  
  Built with `shadcn/ui` to look great across all screen sizes and devices.

---

## 🛠 Tech Stack

| Layer        | Technology                            |
|--------------|----------------------------------------|
| Frontend     | **Next.js** with App Router & RSC      |
| UI Library   | **shadcn/ui**, Tailwind CSS            |
| AI Backend   | **Groq** LLM for summarization         |
| Vector Store | **Pinecone** *(planned)*               |
| Database     | **PostgreSQL** *(mocked, planned)*     |
| Auth         | Role-based *(JWT or NextAuth planned)* |

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/BookBrainAI.git
cd BookBrainAI
