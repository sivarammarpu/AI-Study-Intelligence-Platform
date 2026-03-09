# StudyAI – AI Learning Intelligence Platform

https://study-r39ffp4zz-sivaram-marpus-projects.vercel.app/study

StudyAI is a next-generation, AI-powered learning intelligence platform designed to help students learn 10x faster. It leverages advanced Large Language Models (LLMs) to automatically generate structured topic summaries, interactive quizzes, spaced-repetition flashcards, and personalized learning curriculums from any given topic, PDF document, or YouTube video.

---

## 🌟 Key Features

* **🧠 AI Topic Summaries:** Get instant, structured, and comprehensive summaries of any educational topic powered by Meta Llama 3.3.
* **❓ Smart Quiz Generator:** Automatically generate Multiple Choice, True/False, and Short-Answer quizzes tailored to your learning needs.
* **🃏 Flashcard System:** AI-generated flashcards with built-in SM2 spaced-repetition scheduling for long-term retention.
* **📄 PDF Learning:** Upload PDF documents, lecture notes, or slides and instantly extract structured study notes and quizzes.
* **🎬 YouTube Learning:** Turn any educational YouTube video into structured study materials purely from the video link.
* **📊 Learning Analytics:** Track your learning streak, XP, knowledge retention levels, and focus time natively.
* **🗺️ Curriculum Builder:** Generate personalized, step-by-step learning roadmaps and syllabus structures.
* **📝 Exam Simulator:** Take timed, AI-generated exams and get detailed readiness scores and explanations.
* **🛡️ Demo Mode / Offline Mode:** Fully functional using `localStorage` if Firebase backend is not configured.

---

## 🛠️ Tech Stack

* **Frontend Framework:** React 18, Vite
* **Routing:** React Router v6
* **Styling:** Tailwind CSS, Lucide React (Icons)
* **State Management:** React Context API
* **Backend & Auth:** Firebase (Authentication, Firestore Database, Storage)
* **AI Integration:** SambaNova API (OpenAI Compatible) / Meta-Llama-3.3-70B-Instruct
* **Utilities:** Recharts, pdfjs-dist, date-fns

---

## 🚀 Getting Started

To run StudyAI locally:

### 1. Clone the repository

```bash
git clone https://github.com/sivarammarpu/AI-Study-Intelligence-Platform.git
cd AI-Study-Intelligence-Platform
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in the root directory and add your API keys:

```env
# AI Integration
VITE_SAMBANOVA_API_KEY=your_sambanova_api_key

# Firebase Configuration (Optional - App runs in Demo Mode without it)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

### 4. Run Development Server

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🔐 Security & Data Privacy

* **API Keys:** Environment variables ensure that AI models and Firebase keys are not exposed in the source control.
* **Database Security:** Includes strict `firestore.rules` that restrict users to reading and writing solely their own personal study materials based on Authentication UID.
* **HTTP Security headers:** Enforces Strict-Transport-Security, Content-Security-Policy (CSP), and anti-clickjacking measures.

---

## ©️ Copyright & Ownership

**© 2026 Sivaram Marpu. All rights reserved.**

This platform, its source code, design, and intellectual property belong exclusively to **Sivaram Marpu**. Unauthorized duplication, distribution, or commercialization without explicit written consent is strictly prohibited.
