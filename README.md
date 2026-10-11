# DevPath Academy | Web Technology E-Learning & Certification Platform

A professional, enterprise-grade, full-stack E-Learning platform designed specifically for modern web technology engineering. Built with vanilla HTML5, CSS3, and JavaScript on the frontend, powered by a lightweight, zero-dependency Node.js REST API backend with file-backed persistence.

Strictly adheres to corporate aesthetic standards: **Zero emojis**, clean SVG vector iconography, Google Fonts (`Inter` & `JetBrains Mono`), and an enterprise slate-and-sapphire palette.

---

## Key Modules & Capabilities

1. **Course & Syllabus Catalog**:
   - 4 in-depth Web Technology tracks:
     - `web-arch-301`: *Distributed Web Systems & Production Architecture* (Micro-frontends, Module Federation, SWR caching, SSE vs WebSockets)
     - `js-internals-401`: *Advanced JavaScript Engine Internals & Asynchronous Runtime* (V8 compilation pipeline, event loop microtask semantics, garbage collection)
     - `css-systems-201`: *Modern CSS Systems & Scalable UI Engineering* (Design token hierarchy, Container Queries, Cascade Layers `@layer`)
     - `web-sec-501`: *Web Application Security & Defense Engineering* (OAuth 2.1 & PKCE, HttpOnly cookies, CSP nonces, Subresource Integrity)
   - Real-time search and domain filter tabs.

2. **Interactive Lesson Player & Code Sandbox**:
   - Technical reading with syntax-styled code blocks and 1-click clipboard copy.
   - Built-in runtime sandbox allowing learners to execute and verify JavaScript snippets directly on the page.
   - Granular progress synchronization ("Mark Completed & Continue").

3. **Scenario-Based Examination Engine**:
   - Timed technical examinations (80% passing threshold).
   - Automated grading with in-depth technical explanations for every question and architectural trade-off.
   - Attempt history and mastery tracking.

4. **Cryptographic Certificate Generation & Public Verification**:
   - High-resolution vector certificates dynamically rendered via HTML5 Canvas (1200x850 retina resolution).
   - Unique Certificate ID (`DEV-CERT-2026-XXXX`), tamper-evident SHA-256 verification hash, instructor signature, and list of verified competencies.
   - Download as high-resolution PNG or print as PDF.
   - Dedicated Public Verification Portal (`/verify`) allowing third parties or employers to authenticate credentials in real time.

5. **Learner Analytics & Dashboard**:
   - Enrolled tracks, completed lesson counts, examination passing status, and credential registry table.

---

## Directory Structure

```
devpath-lms/
├── package.json          # Node.js project manifest
├── server.js             # Pure Node.js HTTP & REST API server (zero external dependency requirement)
├── data/
│   ├── courses.json      # Complete curriculum, lesson text, code snippets & quiz questions
│   ├── db.js             # Persistence and certificate generation service
│   └── storage.json      # Auto-generated runtime storage (user progress, attempts, certificates)
└── public/
    ├── index.html        # Enterprise application layout & view templates
    ├── css/
    │   └── style.css     # Bespoke enterprise CSS design system (zero emojis)
    └── js/
        ├── icons.js      # Clean SVG vector icon library
        ├── api.js        # REST client with automatic fallback for offline/static hosting
        └── app.js        # Client router, lesson player, code runner & Canvas certificate generator
```

---

## Quickstart Instructions

### Method 1: Node.js Server (Recommended)

1. Open PowerShell or Terminal in the project directory:
   ```powershell
   cd C:\Users\manip\.gemini\antigravity\scratch\devpath-lms
   ```
2. Start the server (runs immediately without needing `npm install` because `server.js` uses Node's built-in standard library):
   ```powershell
   node server.js
   ```
3. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

### Method 2: Direct Static File Preview

You can also directly open `public/index.html` in any modern web browser or serve it with any static web server (such as Python's `python -m http.server` or VS Code Live Server). The application includes an embedded data fallback and localStorage state synchronization.

---

## REST API Specification

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/courses` | `GET` | List all available tracks and curriculum metadata |
| `/api/courses/:id` | `GET` | Fetch specific track with modules, lessons, and quiz |
| `/api/user/state` | `GET` | Retrieve learner profile, progress, and issued credentials |
| `/api/progress/lesson` | `POST` | Mark lesson completed and recalculate course progress |
| `/api/quiz/submit` | `POST` | Grade examination and record score attempt |
| `/api/certificates/issue` | `POST` | Generate and sign official digital certificate |
| `/api/certificates/verify/:id` | `GET` | Public cryptographic verification audit endpoint |
| `/api/sandbox/execute` | `POST` | Execute JavaScript code in sandbox runtime |
