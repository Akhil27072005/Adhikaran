# ⚖️ AI-Powered Judicial Case Management System

![Banner](https://res.cloudinary.com/dqcov9axv/image/upload/w_800,h_150,c_fill/v1760866938/e41562460a931c7006dee8d0e123f715_ctcr9v.jpg)

![MERN Stack](https://img.shields.io/badge/MERN-Full%20Stack-green?style=for-the-badge)
![AI Powered](https://img.shields.io/badge/AI-Powered-blueviolet?style=for-the-badge)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-brightgreen?style=for-the-badge)
![NodeJS](https://img.shields.io/badge/Backend-Node.js-yellow?style=for-the-badge)
![React](https://img.shields.io/badge/Frontend-React-blue?style=for-the-badge)

---

### 💡“Justice made smarter — where AI empowers judges, informs users, and predicts fair outcomes.”

**AI-Powered Judicial Case Management System** is developed to **digitalize and streamline core court operations.**
It provides **role-based dashboards** for judges, lawyers, and citizens — enabling transparent case filing, secure evidence handling, and **AI-driven legal insights**.

The platform allows citizens to **file and track cases online, lawyers to manage case proceedings**, and **judges to review, analyze, and issue case decisions** — all within a secure, centralized environment.

Built with a **custom-trained ML model** for case prediction, and supported by **Gemini API** for scalable AI reasoning and fallback inference.

---

## 🌐 Live Demo

🔗 **Frontend:** [yet to be deployed](#)  

---

## 🚀 Features

### 👥 Role-Based Dashboards
- **Citizen Portal:** File new cases, view progress, and access AI-based summaries and predictions.  
- **Judge Portal:** Access consolidated case summaries, review AI recommendations, and issue judgments.

---

### 🔐 Authentication & Authorization
- Secure **JWT-based authentication**.  
- Passwords are hashed using **bcrypt**.

---

### ⚖️ Case Management
- File and track cases online with automatic case ID generation.  
- View filer, defendant, assigned judge, case type, and progress.  
- Judges can **update hearings, mark verdicts, and close cases**.  
- Fully integrated with AI and evidence data for end-to-end transparency.

---

### 📑 Evidence Management
- Upload documents, images, and PDFs securely to **Cloudinary**.  
- Linked to uploader identity and case ID.  
- View all case evidence in an organized, downloadable grid view.  

---

### 🧠 AI-Driven Case Analysis (Custom ML Model + Gemini API)
The AI engine combines a **custom machine learning model** (for in-house predictions) with the **Gemini API** (for advanced reasoning and scalability).  
Each case is processed into structured insights, including:

1. **AI Summary** – Concise, neutral summary of case facts.  
2. **Prediction (Outcome + Confidence)** – Forecasted decision and probability score.  
3. **Judge-Style Reasoning** – Formal paragraph justifying the prediction.  
4. **Key Evidence Points** – 3–6 crucial facts influencing the outcome.  
5. **Relevant Legal Sections (IPC Codes)** – Predicted legal codes with confidence levels.

---

### ⚖️ Judge Tools
- AI-powered case summary view with detailed reasoning and prediction.  
- Case filtering based on verdict stage or AI confidence.  
- Judges can **override AI suggestions** and record their verdicts.  
- AI reliability comparison with actual outcomes.

---

### 📊 Dashboard Insights
- Overall court analytics: case count, active cases, resolved cases.  
- Case type trends and AI confidence distribution.  
- AI accuracy tracking and trend analysis for judges.

---

### 💬 Static Information Pages
- **About Page:** Explains system purpose, digital transformation vision, and **court working hours**.  
- **Privacy Policy:** Outlines data encryption, confidentiality, and AI ethics.

---

## 🧩 Tech Stack

### 🖥️ Frontend
- React.js  
- React Router  
- Axios   
- Bootstrap  

### ⚙️ Backend
- Node.js + Express.js  
- MongoDB + Mongoose  
- JSON Web Token (JWT)  
- bcrypt (Password hashing)  
- Multer + Cloudinary (File uploads)  
- Gemini API (AI integration)  
- Custom ML Model (Local inference)

---

## 🗄️ Database Models

| Model | Description |
|-------|--------------|
| **User** | Citizen or Lawyer with profile, contact info, and role |
| **Judge** | Full name, court, city, description, and contact |
| **Case** | Stores filer, defendant, lawyer, judge, and status |
| **Evidence** | File URL, file type, and uploader |
| **MLAnalysis** | AI summary, prediction, confidence, and reasoning |

---

## ⚙️ Setup Instructions

### 💻 Frontend

```bash
cd client
npm install
npm start
```

### 📦 Backend
```bash
cd backend
npm install
npm start
```

### 🔐 Environment Variables (.env)
```bash
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GEMINI_API_KEY=your_gemini_api_key
```
---

## 🚀 Deployment

- 🖥️ Frontend – Deployed on Vercel

- 🧠 Backend – Deployed on Render

- ☁️ Media Storage – Cloudinary
 
---


</p>

