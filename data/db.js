const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const STORAGE_FILE = path.join(__dirname, 'storage.json');
const COURSES_FILE = path.join(__dirname, 'courses.json');

// Default initial state
const defaultState = {
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

function readCourses() {
  try {
    const raw = fs.readFileSync(COURSES_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading courses.json:', err);
    return [];
  }
}

function readStorage() {
  try {
    if (!fs.existsSync(STORAGE_FILE)) {
      writeStorage(defaultState);
      return defaultState;
    }
    const raw = fs.readFileSync(STORAGE_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Storage read failed, returning defaultState:', err);
    return defaultState;
  }
}

function writeStorage(data) {
  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Failed to write to storage.json:', err);
    return false;
  }
}

// Public DB API
const db = {
  getCourses: () => readCourses(),

  getCourseById: (id) => {
    const courses = readCourses();
    return courses.find(c => c.id === id);
  },

  getUserState: () => {
    return readStorage();
  },

  updateUserProfile: (profileData) => {
    const state = readStorage();
    state.user = { ...state.user, ...profileData };
    writeStorage(state);
    return state.user;
  },

  enrollCourse: (courseId) => {
    const state = readStorage();
    if (!state.user.enrolledCourses.includes(courseId)) {
      state.user.enrolledCourses.push(courseId);
    }
    if (!state.progress[courseId]) {
      state.progress[courseId] = {
        completedLessons: [],
        lastAccessed: new Date().toISOString(),
        quizAttempts: []
      };
    }
    writeStorage(state);
    return state;
  },

  completeLesson: (courseId, lessonId) => {
    const state = readStorage();
    if (!state.progress[courseId]) {
      state.progress[courseId] = {
        completedLessons: [],
        lastAccessed: new Date().toISOString(),
        quizAttempts: []
      };
    }
    if (!state.progress[courseId].completedLessons.includes(lessonId)) {
      state.progress[courseId].completedLessons.push(lessonId);
    }
    state.progress[courseId].lastAccessed = new Date().toISOString();
    writeStorage(state);
    return state.progress[courseId];
  },

  submitQuiz: (courseId, answers) => {
    const courses = readCourses();
    const course = courses.find(c => c.id === courseId);
    if (!course || !course.quiz) {
      throw new Error('Course or quiz not found');
    }

    const quiz = course.quiz;
    let scoreCount = 0;
    const totalQuestions = quiz.questions.length;
    const questionReview = [];

    quiz.questions.forEach((q, index) => {
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

    const percentage = Math.round((scoreCount / totalQuestions) * 100);
    const passed = percentage >= quiz.passingScore;

    const attempt = {
      attemptId: 'att-' + Date.now(),
      timestamp: new Date().toISOString(),
      score: percentage,
      scoreCount,
      totalQuestions,
      passed,
      questionReview
    };

    const state = readStorage();
    if (!state.progress[courseId]) {
      state.progress[courseId] = {
        completedLessons: [],
        lastAccessed: new Date().toISOString(),
        quizAttempts: []
      };
    }
    state.progress[courseId].quizAttempts.push(attempt);
    writeStorage(state);

    return attempt;
  },

  issueCertificate: (courseId, recipientName) => {
    const state = readStorage();
    const course = readCourses().find(c => c.id === courseId);
    if (!course) throw new Error('Course not found');

    // Check if certificate already issued
    const existing = state.certificates.find(c => c.courseId === courseId);
    if (existing) {
      return existing;
    }

    const issueDate = new Date().toISOString().split('T')[0];
    const uniqueRand = crypto.randomBytes(3).toString('hex').toUpperCase();
    const certId = `DEV-CERT-${new Date().getFullYear()}-${uniqueRand}`;
    
    // Generate tamper-evident SHA-256 hash
    const hashPayload = `${certId}|${courseId}|${recipientName}|${issueDate}|DevPathAcademy`;
    const verificationHash = crypto.createHash('sha256').update(hashPayload).digest('hex');

    const courseProgress = state.progress[courseId];
    const bestAttempt = courseProgress && courseProgress.quizAttempts && courseProgress.quizAttempts.length > 0
      ? Math.max(...courseProgress.quizAttempts.map(a => a.score))
      : 100;

    const newCert = {
      id: certId,
      courseId: course.id,
      courseTitle: course.title,
      recipientName: recipientName || state.user.name,
      recipientEmail: state.user.email,
      issueDate,
      instructorName: course.instructor.name,
      instructorRole: course.instructor.role,
      grade: `${bestAttempt}%`,
      verificationHash,
      skillsVerified: course.modules.map(m => m.title.replace(/^Module \d+:\s*/, ''))
    };

    state.certificates.push(newCert);
    writeStorage(state);
    return newCert;
  },

  verifyCertificate: (certId) => {
    const state = readStorage();
    const cert = state.certificates.find(c => c.id.toLowerCase() === certId.trim().toLowerCase());
    if (!cert) {
      return { valid: false, message: "Certificate ID not found in the official registry." };
    }
    return {
      valid: true,
      certificate: cert,
      verificationAuthority: "DevPath Academy Cryptographic Registry",
      verifiedAt: new Date().toISOString()
    };
  }
};

module.exports = db;
