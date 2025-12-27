# 🚀 Resume Factory

> **A local-first, AI-powered resume workspace.**
> Build, tailor, and export ATS-friendly resumes with pixel-perfect PDF parity.

## 📖 Table of Contents

- [✨ Key Features](#-key-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [🚀 Getting Started](#-getting-started)
- [📖 Usage Guide](#-usage-guide)
- [📂 Project Structure](#-project-structure)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

## ✨ Key Features

### 🧠 AI Intelligence
* **Auto-Tailoring**: Paste a Job Description, and the AI rewrites your experience bullet points to match role keywords.
* **Smart Import**: Dump raw text from an old resume, and our parser reconstructs it into a structured JSON schema.

### 🎨 Visual Workspace
* **Real-Time WYSIWYG**: 1:1 preview of your PDF on an 8.5" x 11" digital canvas.
* **Theme Engine**: Switch instantly between styles:
    * **Modern**: Clean, sans-serif layout for tech/startup roles.
    * **Classic**: Serif-based, Ivy League style for traditional industries.
    * **Creative**: Two-column layout with a persistent sidebar.
* **Structure Control**: Toggle section ordering (e.g., *Education* above *Skills* or vice versa).

### 📂 Local File Management
* **Browser-Based Storage**: All data is saved to LocalStorage. No database required.
* **Versioning system**: Create "Master" resumes and duplicate them for specific job applications.
* **Auto-Save**: Never lose your edits.

### 🖨️ Pixel-Perfect Export
* **Puppeteer Engine**: We use a headless Chrome instance to "print" the exact React components you see on screen.
* **Advanced CSS**: Handles complex print logic like page breaks, orphans, widows, and background graphics.

## 🛠️ Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | Next.js 14 (App Router) | Server-side rendering & API Routes |
| **Language** | TypeScript | Type-safe data models for Resumes |
| **Styling** | Tailwind CSS | Utility-first styling for print & screen |
| **AI Model** | Google Gemini 1.5 Flash | Fast text processing & reasoning |
| **PDF Engine** | Puppeteer | High-fidelity HTML-to-PDF conversion |

## 🚀 Getting Started

### Prerequisites
* Node.js 18+
* A Google Gemini API Key ([Get it here](https://aistudio.google.com/app/apikey))

### Installation

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/yourusername/resume-factory.git](https://github.com/yourusername/resume-factory.git)
    cd resume-factory
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment**
    Create a `.env.local` file in the root directory:
    ```bash
    GEMINI_API_KEY=your_api_key_here
    ```

4.  **Run the application**
    ```bash
    npm run dev
    ```

5.  **Launch**
    Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Usage Guide

### 1. The Workflow
* **Import**: Click `Import Text` to paste your existing resume. The AI will structure it.
* **Edit**: Use the visual form editor to refine bullet points.
* **Tailor**: Paste a JD into the "AI Toolbox" on the left. Click `Auto-Tailor` to generate a targeted version.

### 2. Managing Files
* **Sidebar**: Access your history of saved resumes.
* **Duplicate**: Hover over a file and click the generic "Copy" icon to fork a version (useful for A/B testing resumes).

### 3. Exporting
* **Theme Selection**: Choose between *Modern*, *Classic*, or *Creative*.
* **Download**: Click the floating `Download PDF` button. The file is generated server-side for maximum quality.

## 📂 Project Structure

```text
/resume-builder
├── app/
│   ├── api/             # Next.js API Routes (PDF Gen, AI Ops)
│   ├── components/
│   │   ├── editor/      # Form logic (Experience, Skills, etc.)
│   │   └── templates/   # Resume Designs (Modern, Classic...)
│   └── services/        # LocalStorage persistence logic
├── types/               # TypeScript Interfaces
└── public/              # Static Assets
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

**Proprietary Software.**
All rights reserved. Unauthorized copying, modification, distribution, or use of this software is strictly prohibited.