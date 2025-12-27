🚀 Resume Factory - AI-Powered Resume Builder

A modern, local-first web application that helps you build, tailor, and export professional resumes. Built with Next.js 14, standardizing the gap between "editing" and "PDF output" by using the same React components for both.

✨ Features

🧠 AI Intelligence (Powered by Gemini)

Auto-Tailoring: Paste a Job Description, and the AI rewrites your bullet points to match the role keywords and requirements.

Smart Import: Paste your existing resume text, and the AI parses it into a structured JSON schema automatically.

🎨 Visual Workspace

Real-Time Preview: See changes instantly on an 8.5" x 11" canvas that mirrors the final PDF exactly.

Visual Editor: Drag-and-drop experience for rearranging jobs, education, and skills.

Themes: Switch between distinct templates:

Modern: Clean, sans-serif layout for tech/startup roles.

Classic: Serif-based, Ivy League style for traditional industries.

Creative: Two-column layout with a persistent sidebar for design/creative roles.

📂 File Management (Local First)

Auto-Save: Changes are saved to your browser's Local Storage.

Versioning: Create duplicates to maintain different versions (e.g., "Software Engineer Resume" vs "Product Manager Resume").

Privacy Focused: No database required. Your data lives in your browser.

🖨️ Pixel-Perfect PDF Export

Uses Puppeteer to generate PDFs that look exactly like the React preview.

Solves common HTML-to-PDF issues (page breaks, margins, background colors) using advanced CSS print directives.

🛠️ Tech Stack

Framework: Next.js 14 (App Router)

Styling: Tailwind CSS

AI: Google Gemini API (@google/generative-ai)

PDF Engine: Puppeteer

Language: TypeScript

🚀 Getting Started

Prerequisites

Node.js 18+

A Google Gemini API Key (Get it here)

Installation

Clone the repo

git clone [https://github.com/yourusername/resume-factory.git](https://github.com/yourusername/resume-factory.git)
cd resume-factory



Install dependencies

npm install



Set up Environment Variables
Create a .env.local file in the root directory:

GEMINI_API_KEY=your_api_key_here



Run the development server

npm run dev



Open your browser
Navigate to http://localhost:3000.

📖 Usage Guide

Import or Start Fresh: Click "Import Text" to paste your old resume, or start typing in the editor.

Select a Theme: Use the toggle in the header to choose a style (Modern/Classic/Creative).

Tailor: Paste a Job Description in the left panel and click "Auto-Tailor" to optimize your experience section.

Export: Click "Download PDF" to get a ATS-friendly, printable file.

🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

Fork the Project

Create your Feature Branch (git checkout -b feature/AmazingFeature)

Commit your Changes (git commit -m 'Add some AmazingFeature')

Push to the Branch (git push origin feature/AmazingFeature)

Open a Pull Request

📄 License

Proprietary. All rights reserved.