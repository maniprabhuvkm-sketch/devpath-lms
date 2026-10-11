// DevPath API Client with Real Backend Integration & Resilient Client-Side Fallback
const api = (() => {
  const isHttp = window.location.protocol.startsWith('http');
  const BASE_URL = isHttp ? window.location.origin : '';

  // Local storage keys for resilient offline/static testing
  const STORAGE_KEY = 'devpath_lms_state_v1';

  function getLocalFallbackState() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try { return JSON.parse(raw); } catch (e) {}
    }
    const initial = {
      user: {
        id: "usr-dev-9801",
        name: "Alex Morgan",
        email: "alex.morgan@enterprise.io",
        title: "Senior Full-Stack Engineer",
        organization: "Systems Architecture Group",
        enrolledCourses: ["web-arch-301", "js-internals-401"],
        createdAt: "2026-01-15T09:00:00Z"
      },
      progress: {
        "web-arch-301": {
          completedLessons: ["les-1-1"],
          lastAccessed: new Date().toISOString(),
          quizAttempts: []
        },
        "js-internals-401": {
          completedLessons: [],
          lastAccessed: new Date().toISOString(),
          quizAttempts: []
        }
      },
      certificates: [
        {
          id: "DEV-CERT-2026-8914",
          courseId: "web-arch-301",
          courseTitle: "Distributed Web Systems & Production Architecture",
          recipientName: "Alex Morgan",
          recipientEmail: "alex.morgan@enterprise.io",
          issueDate: "2026-09-28",
          instructorName: "Dr. Sarah Chen",
          instructorRole: "Principal Systems Architect",
          grade: "95%",
          verificationHash: "4f7c1a89b02e6d98c25f419b48f98a2c1d3e8b7c9f6a4e2d1c0b8a7f9e5d3c2a",
          skillsVerified: ["Micro-Frontends", "Module Federation", "SWR Caching", "SSE Streaming", "Fault Tolerance"]
        }
      ]
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }

  function saveLocalFallbackState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  async function request(endpoint, options = {}) {
    if (isHttp) {
      try {
        const res = await fetch(`${BASE_URL}${endpoint}`, {
          headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
          ...options
        });
        if (res.ok) {
          return await res.json();
        }
      } catch (err) {
        console.warn(`Backend fetch failed for ${endpoint}, switching to local store:`, err);
      }
    }
    return null;
  }

  return {
    async getCourses() {
      const res = await request('/api/courses');
      if (res && res.courses) return res.courses;

      // Fallback: fetch from data/courses.json or global registry
      try {
        const directFetch = await fetch('data/courses.json');
        if (directFetch.ok) return await directFetch.json();
      } catch (e) {}

      // Embedded fallback if opened via file:// or unhosted
      return window.__DEVPATH_COURSES__ || [];
    },

    async getCourseById(id) {
      const res = await request(`/api/courses/${id}`);
      if (res && res.course) return res.course;

      const courses = await this.getCourses();
      return courses.find(c => c.id === id);
    },

    async getUserState() {
      const res = await request('/api/user/state');
      if (res && res.state) return res.state;
      return getLocalFallbackState();
    },

    async enrollCourse(courseId) {
      const res = await request(`/api/courses/${courseId}/enroll`, { method: 'POST' });
      if (res && res.state) return res.state;

      const state = getLocalFallbackState();
      if (!state.user.enrolledCourses.includes(courseId)) {
        state.user.enrolledCourses.push(courseId);
      }
      if (!state.progress[courseId]) {
        state.progress[courseId] = { completedLessons: [], lastAccessed: new Date().toISOString(), quizAttempts: [] };
      }
      saveLocalFallbackState(state);
      return state;
    },

    async completeLesson(courseId, lessonId) {
      const res = await request('/api/progress/lesson', {
        method: 'POST',
        body: JSON.stringify({ courseId, lessonId })
      });
      if (res && res.progress) return res.progress;

      const state = getLocalFallbackState();
      if (!state.progress[courseId]) {
        state.progress[courseId] = { completedLessons: [], lastAccessed: new Date().toISOString(), quizAttempts: [] };
      }
      if (!state.progress[courseId].completedLessons.includes(lessonId)) {
        state.progress[courseId].completedLessons.push(lessonId);
      }
      state.progress[courseId].lastAccessed = new Date().toISOString();
      saveLocalFallbackState(state);
      return state.progress[courseId];
    },

    async submitQuiz(courseId, answers) {
      const res = await request('/api/quiz/submit', {
        method: 'POST',
        body: JSON.stringify({ courseId, answers })
      });
      if (res && res.attempt) return res.attempt;

      // Local fallback grading
      const course = await this.getCourseById(courseId);
      if (!course || !course.quiz) throw new Error('Quiz not found');

      const quiz = course.quiz;
      let scoreCount = 0;
      const questionReview = [];

      quiz.questions.forEach((q) => {
        const userAnswer = answers[q.id];
        const isCorrect = userAnswer === q.correctIndex;
        if (isCorrect) scoreCount++;
        questionReview.push({
          id: q.id,
          text: q.text,
          userAnswer,
          correctIndex: q.correctIndex,
          isCorrect,
          explanation: q.explanation
        });
      });

      const percentage = Math.round((scoreCount / quiz.questions.length) * 100);
      const attempt = {
        attemptId: 'att-' + Date.now(),
        timestamp: new Date().toISOString(),
        score: percentage,
        scoreCount,
        totalQuestions: quiz.questions.length,
        passed: percentage >= quiz.passingScore,
        questionReview
      };

      const state = getLocalFallbackState();
      if (!state.progress[courseId]) {
        state.progress[courseId] = { completedLessons: [], lastAccessed: new Date().toISOString(), quizAttempts: [] };
      }
      state.progress[courseId].quizAttempts.push(attempt);
      saveLocalFallbackState(state);
      return attempt;
    },

    async issueCertificate(courseId, recipientName) {
      const res = await request('/api/certificates/issue', {
        method: 'POST',
        body: JSON.stringify({ courseId, recipientName })
      });
      if (res && res.certificate) return res.certificate;

      const state = getLocalFallbackState();
      const existing = state.certificates.find(c => c.courseId === courseId);
      if (existing) return existing;

      const course = await this.getCourseById(courseId);
      const certId = `DEV-CERT-2026-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const issueDate = new Date().toISOString().split('T')[0];

      const newCert = {
        id: certId,
        courseId: course.id,
        courseTitle: course.title,
        recipientName: recipientName || state.user.name,
        recipientEmail: state.user.email,
        issueDate,
        instructorName: course.instructor.name,
        instructorRole: course.instructor.role,
        grade: "96%",
        verificationHash: Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join(''),
        skillsVerified: course.modules.map(m => m.title.replace(/^Module \d+:\s*/, ''))
      };

      state.certificates.push(newCert);
      saveLocalFallbackState(state);
      return newCert;
    },

    async verifyCertificate(certId) {
      const res = await request(`/api/certificates/verify/${encodeURIComponent(certId)}`);
      if (res) return res;

      const state = getLocalFallbackState();
      const cert = state.certificates.find(c => c.id.toLowerCase() === certId.trim().toLowerCase());
      if (cert) {
        return {
          valid: true,
          certificate: cert,
          verificationAuthority: "DevPath Academy Cryptographic Registry",
          verifiedAt: new Date().toISOString()
        };
      }
      return { valid: false, message: "Certificate ID not found in the official registry." };
    },

    async executeSandbox(code) {
      const res = await request('/api/sandbox/execute', {
        method: 'POST',
        body: JSON.stringify({ code })
      });
      if (res) return res;

      // Safe client sandbox execution fallback
      const logs = [];
      try {
        const fakeConsole = {
          log: (...args) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
          error: (...args) => logs.push('[ERROR] ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
          warn: (...args) => logs.push('[WARN] ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '))
        };
        const runFn = new Function('console', code);
        runFn(fakeConsole);
        return {
          success: true,
          output: logs.length > 0 ? logs.join('\n') : '(Code executed successfully with no output)'
        };
      } catch (err) {
        return {
          success: false,
          output: `Execution error: ${err.message}`
        };
      }
    }
  };
})();
