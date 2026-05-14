# 🤖 AI Text Humanizer

<div align="center">

**An intelligent web application that detects AI-generated content and transforms it into natural, human-like text.**

[![Built with React](https://img.shields.io/badge/Built%20with-React-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![Built with .NET](https://img.shields.io/badge/Built%20with-.NET-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/)
[![Database SQLite](https://img.shields.io/badge/Database-SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![AI Gemini](https://img.shields.io/badge/AI-Google%20Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)

</div>

---

# 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Screenshots](#screenshots)
- [Future Enhancements](#future-enhancements)
- [Contributing](#contributing)
- [License](#license)

---

# 📖 Overview

**AI Text Humanizer** is a modern full-stack web application that helps users detect AI-generated content and transform robotic text into natural, human-like writing.

The application uses **Google Gemini AI** for advanced AI detection and intelligent text humanization while preserving the original meaning and context.

This project demonstrates full-stack development using **React**, **ASP.NET Core Web API**, **SQLite**, and **Google Gemini AI Integration**.

### Why AI Text Humanizer?

| Challenge | Solution |
|-----------|----------|
| AI-generated text sounds robotic | Humanize text naturally |
| Difficult to identify AI-written content | AI detection with confidence score |
| Need multiple writing styles | Multiple tone options |
| Managing text history is difficult | Save and track previous analyses |

---

# ✨ Features

## 🚀 Core Features

| Feature | Description |
|---------|-------------|
| 🔍 **AI Detection** | Analyze text and detect AI-generated content |
| ✨ **Text Humanization** | Convert robotic AI text into natural writing |
| 🎯 **Multiple Tone Options** | Casual, Professional, Friendly, Academic, Creative, Technical, Student, Persuasive |
| 📊 **History Tracking** | Save previous analyses and humanized texts |
| 🔎 **Search & Filters** | Easily find past records |
| 📥 **CSV Export** | Export analysis history as CSV |
| 📈 **Text Comparison** | Compare original and humanized text |
| 📱 **Responsive Design** | Works on desktop, tablet, and mobile |

---

# 🛠️ Tech Stack

## 🖥 Frontend

- React 18  
- Tailwind CSS  
- Axios  
- React Router DOM  
- React Hot Toast  
- Heroicons  

## ⚙️ Backend

- ASP.NET Core Web API  
- .NET 9  
- Entity Framework Core  
- JWT Authentication  
- Swagger / OpenAPI  

## 🗄 Database

- SQLite  

## 🤖 AI Integration

- Google Gemini 2.5 Pro  
- Gemini 2.5 Flash  
- Gemini 2.0 Flash  

---

# 🏗️ Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                    Client Browser                          │
│                    (React Frontend)                        │
└─────────────────────────────┬───────────────────────────────┘
                              │ HTTP / HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 ASP.NET Core Web API                       │
│                                                             │
│ ┌─────────────┐ ┌─────────────────┐ ┌───────────────────┐  │
│ │ Auth API    │ │ Text Analysis   │ │ Gemini AI Service │  │
│ │ Controller  │ │ Controller      │ │ Integration       │  │
│ └─────────────┘ └─────────────────┘ └───────────────────┘  │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                   SQLite Database                      │ │
│ │        (Users, Analyses, Humanized Texts)              │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

# 📂 Project Structure

```text
AI-Text-Humanizer
│
├── backend
│   │
│   ├── Controllers
│   │   ├── AuthController.cs
│   │   ├── TextAnalysisController.cs
│   │   └── HistoryController.cs
│   │
│   ├── Models
│   │   ├── User.cs
│   │   ├── TextAnalysis.cs
│   │   └── HumanizedText.cs
│   │
│   ├── DTOs
│   │   ├── LoginDTO.cs
│   │   ├── RegisterDTO.cs
│   │   └── HumanizeRequestDTO.cs
│   │
│   ├── Services
│   │   ├── GeminiService.cs
│   │   ├── AuthService.cs
│   │   └── TextAnalysisService.cs
│   │
│   ├── Data
│   │   └── AppDbContext.cs
│   │
│   └── Program.cs
│
├── frontend
│   │
│   ├── src
│   │   │
│   │   ├── components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Detector.jsx
│   │   │   ├── Humanizer.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── History.jsx
│   │   │
│   │   ├── services
│   │   │   └── api.js
│   │   │
│   │   ├── pages
│   │   │
│   │   └── App.jsx
│   │
│   └── package.json
│
├── screenshots
│   ├── dashboard.png
│   ├── detector.png
│   ├── humanizer.png
│   └── history.png
│
└── README.md
```

---

# 🚀 Installation

## 📌 Prerequisites

- [.NET 9 SDK](https://dotnet.microsoft.com/download)
- [Node.js 18+](https://nodejs.org/)
- [Git](https://git-scm.com/)

---

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/yourusername/ai-text-humanizer.git
cd ai-text-humanizer
```

---

## 2️⃣ Backend Setup

```bash
cd backend

# Restore dependencies
dotnet restore

# Run migrations
dotnet ef database update

# Run backend
dotnet run
```

Backend runs at:

```text
http://localhost:5227
```

Swagger Documentation:

```text
http://localhost:5227/swagger
```

---

## 3️⃣ Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start frontend
npm run dev
```

Frontend runs at:

```text
http://localhost:5173
```

---

## 4️⃣ Configure Gemini API Key

Update `appsettings.json`:

```json
{
  "Gemini": {
    "ApiKey": "YOUR_API_KEY_HERE"
  }
}
```

Get your API key from Google AI Studio.

---

# 📱 Usage

## 🔍 AI Detection

- Open the **AI Detector** page  
- Paste your text  
- Click **Detect AI Text**  
- View AI confidence score and analysis  

## ✨ Text Humanization

- Navigate to the **Humanizer** page  
- Select a writing tone  
- Paste AI-generated text  
- Click **Humanize Text**  
- Review the improved human-like content  

## 📊 History Management

- View previous analyses  
- Search and filter records  
- Compare original and humanized text  
- Export history as CSV  

---

# 📡 API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register user | ❌ |
| POST | `/api/auth/login` | Login user | ❌ |
| GET | `/api/auth/profile` | User profile | ✅ |
| POST | `/api/textanalysis/detect` | Detect AI text | ✅ |
| POST | `/api/textanalysis/humanize` | Humanize text | ✅ |
| GET | `/api/textanalysis/history` | Get history | ✅ |
| DELETE | `/api/textanalysis/history/{id}` | Delete history | ✅ |

---

# 📸 Screenshots

## 📊 Dashboard

![Dashboard](screenshots/dashboard.png)

---

## 🔍 AI Detector

![Detector](screenshots/detector.png)

---

## ✨ Text Humanizer

![Humanizer](screenshots/humanizer.png)

---

## 📜 History Page

![History](screenshots/history.png)

---

# 🔮 Future Enhancements

- 🌙 Dark mode support  
- 🌍 Multi-language text humanization  
- 📱 Mobile application  
- 🔗 Browser extension  
- 📊 Analytics dashboard  
- 🤖 OpenAI integration  
- ⚡ Bulk text processing  

---

# 🤝 Contributing

Contributions are welcome.

## Steps to Contribute

1. Fork the repository  

2. Create a feature branch

```bash
git checkout -b feature/new-feature
```

3. Commit changes

```bash
git commit -m "Added new feature"
```

4. Push changes

```bash
git push origin feature/new-feature
```

5. Open a Pull Request

---

# 👩‍💻 Author

Durga Srujana  

GitHub: https://github.com/DurgaSrujana57

---

# 📄 License

This project is licensed under the **MIT License**.

---

<div align="center">

⭐ If this project helped you, please give it a star! ⭐

</div>
