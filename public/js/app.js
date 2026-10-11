// DevPath Academy - Core Enterprise Application Controller
// Zero Emojis. Full Web Technology Architecture.

(function () {
  'use strict';

  // Embed offline courses dataset fallback for direct static viewing
  window.__DEVPATH_COURSES__ = [
    {
      "id": "web-arch-301",
      "title": "Distributed Web Systems & Production Architecture",
      "slug": "distributed-web-systems-architecture",
      "category": "Architecture & Systems",
      "level": "Advanced",
      "duration": "14 hours",
      "rating": 4.9,
      "enrollmentCount": 3840,
      "instructor": {
        "name": "Dr. Sarah Chen",
        "role": "Principal Systems Architect",
        "organization": "DevPath Engineering"
      },
      "description": "Design resilient, scalable web applications capable of handling millions of requests per second. Covers micro-frontends, edge caching, real-time message streaming, and horizontal fault tolerance.",
      "prerequisites": ["Proficiency in Modern JavaScript (ES2022+)", "Foundational HTTP/2 & Networking knowledge", "Basic Distributed Systems concepts"],
      "modules": [
        {
          "id": "mod-1",
          "title": "Module 1: Micro-Frontend Architecture & Module Federation",
          "duration": "4.5 hours",
          "lessons": [
            {
              "id": "les-1-1",
              "title": "Decomposing Monoliths: Module Federation Internals",
              "readTime": "25 min",
              "content": "### Decomposing Monoliths: Module Federation Internals\n\nModern large-scale web applications often outgrow single monolithic repositories. While monolithic frontends simplify initial development, cross-team coupling frequently degrades build times and slows deployment cadences.\n\n#### Architectural Trade-offs\n- **Independent Deployment**: Teams release features autonomously without coordinating global builds.\n- **Shared Dependencies**: Run-time deduplication prevents users from downloading redundant copies of core libraries.\n- **Contract Boundaries**: Strict TypeScript interfaces govern communication between host and remote containers.\n\n```javascript\n// Module Federation Configuration in Webpack / Vite\nexport default {\n  name: 'dashboard_host',\n  remotes: {\n    analyticsApp: 'analytics@https://cdn.devpath.io/remotes/analytics/remoteEntry.js',\n    billingApp: 'billing@https://cdn.devpath.io/remotes/billing/remoteEntry.js'\n  },\n  shared: {\n    react: { singleton: true, requiredVersion: '^18.2.0' },\n    'react-dom': { singleton: true, requiredVersion: '^18.2.0' }\n  }\n};\n```\n\n#### Fault Tolerance and Fallback Handling\nWhen consuming remote modules over high-latency or unpredictable networks, client-side boundaries must implement robust fallback lifecycles.\n\n```javascript\nasync function loadRemoteMicrofrontend(scope, module) {\n  try {\n    await window[scope].init(__webpack_share_scopes__.default);\n    const factory = await window[scope].get(module);\n    return factory();\n  } catch (error) {\n    console.error(`Failed to resolve remote module: ${scope}/${module}`, error);\n    return () => import('./components/GracefulFallbackView.js');\n  }\n}\n```\n\n#### Key Engineering Principles\n1. Ensure shared libraries specify exact semantic version constraints.\n2. Isolate runtime errors within micro-frontend boundaries to avoid crashing host shells.\n3. Implement localized state management and avoid global window mutations.",
              "codeExercise": {
                "language": "javascript",
                "initialCode": "async function resolveRemote(serviceName, endpoint) {\n  return new Promise((resolve, reject) => {\n    setTimeout(() => {\n      if (endpoint.includes('devpath.io')) {\n        resolve({ status: 'ONLINE', module: serviceName + '_v2.1' });\n      } else {\n        reject(new Error('Invalid CDN endpoint'));\n      }\n    }, 200);\n  });\n}\n\nresolveRemote('TelemetryService', 'https://cdn.devpath.io/assets')\n  .then(res => console.log('Loaded:', JSON.stringify(res)))\n  .catch(err => console.error('Error:', err.message));",
                "expectedOutput": "Loaded: {\"status\":\"ONLINE\",\"module\":\"TelemetryService_v2.1\"}"
              }
            },
            {
              "id": "les-1-2",
              "title": "Cross-Boundary State Synchronization",
              "readTime": "30 min",
              "content": "### Cross-Boundary State Synchronization\n\nWhen micro-frontends share a page, coordinating authentication tokens, tenant contexts, and user profiles without tight coupling requires event-driven communication patterns.\n\n#### Communication Topologies\n1. **Custom Event Bus**: Leverages the native browser `CustomEvent` API with strongly typed payloads.\n2. **BroadcastChannel API**: Facilitates cross-tab or cross-frame messaging across isolated contexts.\n3. **Decoupled State Broker**: A pub/sub broker instantiated at the shell level that exposes scoped subscriptions.\n\n```javascript\n// Enterprise Event Broker for Micro-Frontends\nclass CrossAppMessageBroker {\n  constructor() {\n    this.handlers = new Map();\n  }\n\n  subscribe(topic, callback) {\n    if (!this.handlers.has(topic)) {\n      this.handlers.set(topic, new Set());\n    }\n    this.handlers.get(topic).add(callback);\n    return () => this.handlers.get(topic).delete(callback);\n  }\n\n  publish(topic, payload) {\n    if (this.handlers.has(topic)) {\n      const immutablePayload = Object.freeze({ ...payload, timestamp: Date.now() });\n      this.handlers.get(topic).forEach(handler => {\n        try {\n          handler(immutablePayload);\n        } catch (err) {\n          console.error(`Broker error on topic [${topic}]:`, err);\n        }\n      });\n    }\n  }\n}\n```",
              "codeExercise": {
                "language": "javascript",
                "initialCode": "const bus = new EventTarget();\nbus.addEventListener('USER_SESSION_UPDATE', (e) => {\n  console.log('Session synchronized for user:', e.detail.userId);\n});\n\nbus.dispatchEvent(new CustomEvent('USER_SESSION_UPDATE', {\n  detail: { userId: 'USR-8921', role: 'Staff_Engineer' }\n}));",
                "expectedOutput": "Session synchronized for user: USR-8921"
              }
            }
          ]
        },
        {
          "id": "mod-2",
          "title": "Module 2: Edge Computing & Intelligent Caching Strategies",
          "duration": "5.0 hours",
          "lessons": [
            {
              "id": "les-2-1",
              "title": "HTTP Cache-Control & Stale-While-Revalidate Mechanisms",
              "readTime": "35 min",
              "content": "### HTTP Cache-Control & Stale-While-Revalidate Mechanisms\n\nOptimizing web delivery latency requires deep mastery of modern caching directives. The `stale-while-revalidate` (SWR) directive bridges instantaneous client rendering with asynchronous cache warming.\n\n#### Cache Directive Hierarchy\n- `public, max-age=60, stale-while-revalidate=86400`: Deliver from edge cache instantly for 60 seconds; serve stale cached content for up to 24 hours while revalidating against origin in the background.\n- `immutable`: Informs user agents that responses with content-hashed assets will never mutate.\n- `no-cache`: Forces cache validation with `ETag` or `If-Modified-Since` headers prior to reuse.",
              "codeExercise": {
                "language": "javascript",
                "initialCode": "function evaluateCachePolicy(headers) {\n  const cacheControl = headers['Cache-Control'] || '';\n  const isImmutable = cacheControl.includes('immutable');\n  const hasSWR = cacheControl.includes('stale-while-revalidate');\n  return {\n    cached: true,\n    isImmutable,\n    backgroundRevalidation: hasSWR\n  };\n}\n\nconst testHeaders = {\n  'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600'\n};\nconsole.log(JSON.stringify(evaluateCachePolicy(testHeaders)));",
                "expectedOutput": "{\"cached\":true,\"isImmutable\":false,\"backgroundRevalidation\":true}"
              }
            }
          ]
        },
        {
          "id": "mod-3",
          "title": "Module 3: Real-Time Data Streaming with WebSockets & Server-Sent Events",
          "duration": "4.5 hours",
          "lessons": [
            {
              "id": "les-3-1",
              "title": "Transport Selection: WebSockets vs SSE vs HTTP/3 WebTransport",
              "readTime": "30 min",
              "content": "### Transport Selection: WebSockets vs SSE vs HTTP/3 WebTransport\n\nChoosing the correct protocol for live data updates directly impacts memory utilization, battery consumption, and proxy pass-through rates.\n\n| Feature | WebSockets | Server-Sent Events (SSE) | WebTransport |\n| :--- | :--- | :--- | :--- |\n| **Directionality** | Full-Duplex (Bidirectional) | Simplex (Server-to-Client) | Full-Duplex Multiplexed |\n| **Transport** | TCP (Upgrade handshake) | HTTP/1.1 or HTTP/2 | UDP (QUIC) |\n| **Auto Reconnect** | Manual implementation | Native browser handling | Protocol-level recovery |\n| **Firewall Traversal** | Blocked by some enterprise proxies | Standard HTTP streaming | Native QUIC handling |",
              "codeExercise": {
                "language": "javascript",
                "initialCode": "class HeartbeatMonitor {\n  constructor(intervalMs) {\n    this.intervalMs = intervalMs;\n    this.lastPing = Date.now();\n  }\n  recordPing() {\n    this.lastPing = Date.now();\n  }\n  isAlive() {\n    return (Date.now() - this.lastPing) <= (this.intervalMs * 1.5);\n  }\n}\n\nconst monitor = new HeartbeatMonitor(1000);\nconsole.log('Heartbeat status:', monitor.isAlive());",
                "expectedOutput": "Heartbeat status: true"
              }
            }
          ]
        }
      ],
      "quiz": {
        "id": "quiz-arch-301",
        "title": "Certification Examination: Distributed Web Systems Architecture",
        "passingScore": 80,
        "timeLimitMinutes": 20,
        "questions": [
          {
            "id": "q1",
            "text": "In a Webpack Module Federation setup, what is the consequence of configuring a shared library with 'singleton: true' when two remotes require conflicting major versions?",
            "options": [
              "The host fails to boot and produces a fatal Webpack compilation error.",
              "A runtime warning is emitted, and the highest compatible or host-loaded version is used across all remotes.",
              "Each remote automatically clones and injects its own version into a separate JavaScript realm.",
              "The browser initiates a synchronous fetch to re-bundle the dependency tree at runtime."
            ],
            "correctIndex": 1,
            "explanation": "When singleton: true is defined, Module Federation permits only one instance of the library in the shared scope. If versions are incompatible according to semantic version constraints, a runtime warning is logged and the highest loaded instance is reused."
          },
          {
            "id": "q2",
            "text": "Under what engineering circumstance is Server-Sent Events (SSE) objectively preferable over WebSockets?",
            "options": [
              "When high-frequency binary data packets (such as audio streams) must be transmitted in full duplex.",
              "When communication is unidirectional from server to client, requiring native auto-reconnection and seamless HTTP/2 multiplexing through corporate firewalls.",
              "When peer-to-peer UDP packet transmission is mandated by strict real-time gaming latencies.",
              "When the client needs to initiate frequent RPC requests across the same underlying persistent socket."
            ],
            "correctIndex": 1,
            "explanation": "SSE operates over standard HTTP, natively benefits from HTTP/2 multiplexing, traverses corporate firewalls without special TCP socket upgrades, and includes built-in browser automatic reconnection with message ID tracking."
          },
          {
            "id": "q3",
            "text": "What does the 'stale-while-revalidate' directive instruct an edge CDN or browser cache to perform?",
            "options": [
              "Immediately purge stale items from memory and force the browser to display a loading skeleton.",
              "Return cached assets immediately while asynchronously dispatching a revalidation request to update the cache for subsequent requests.",
              "Permanently cache the response on disk until the user manually triggers a hard browser reload.",
              "Compress all outgoing payloads with Brotli encoding before evaluating the ETag header."
            ],
            "correctIndex": 1,
            "explanation": "Stale-While-Revalidate allows the cache to respond immediately with stale content within a defined window, while initiating an asynchronous revalidation request to refresh the cache in the background."
          },
          {
            "id": "q4",
            "text": "When decoupling micro-frontends on a single page, which architectural approach provides the cleanest isolation and boundary defense?",
            "options": [
              "Binding state directly to 'window.globalState' and letting all remotes mutate properties directly.",
              "Employing a strongly typed Event Broker or CustomEvent bus with immutable payloads and localized error boundaries.",
              "Importing the host application root component directly into every individual remote bundle.",
              "Executing each remote inside an invisible iframe with postMessage serialization for every DOM event."
            ],
            "correctIndex": 1,
            "explanation": "A strongly typed event broker or CustomEvent bus provides loose coupling, decouples deployment dependencies, enforces immutable message payloads, and preserves native DOM rendering performance."
          }
        ]
      }
    },
    {
      "id": "js-internals-401",
      "title": "Advanced JavaScript Engine Internals & Asynchronous Runtime",
      "slug": "javascript-engine-internals-runtime",
      "category": "Core Engineering",
      "level": "Advanced",
      "duration": "12 hours",
      "rating": 4.95,
      "enrollmentCount": 5120,
      "instructor": {
        "name": "Marcus Vance",
        "role": "V8 Runtime Specialist",
        "organization": "DevPath Core Lab"
      },
      "description": "Master the internal architecture of modern JavaScript engines. Understand the V8 compilation pipeline, hidden classes (shapes), inline caching, event loop microtask queues, and low-level memory profiling.",
      "prerequisites": ["Deep understanding of JavaScript closures, prototypes, and ES6+", "Basic knowledge of compiler concepts (AST, Bytecode)"],
      "modules": [
        {
          "id": "mod-js-1",
          "title": "Module 1: The V8 Compilation Pipeline & Shape Transitions",
          "duration": "4.0 hours",
          "lessons": [
            {
              "id": "les-js-1-1",
              "title": "Ignition, TurboFan, and Inline Caches (IC)",
              "readTime": "30 min",
              "content": "### Ignition, TurboFan, and Inline Caches (IC)\n\nThe V8 JavaScript engine utilizes a multi-tier compilation pipeline to balance fast startup latency with peak execution speed.\n\n#### Engine Pipeline Phases\n1. **Parser**: Converts source code into an Abstract Syntax Tree (AST).\n2. **Ignition Interpreter**: Generates memory-efficient bytecode from the AST for immediate execution.\n3. **Profiler**: Identifies hot functions and collects type feedback vectors.\n4. **TurboFan Optimizing Compiler**: Compiles hot bytecode into highly optimized machine code based on recorded type assumptions.",
              "codeExercise": {
                "language": "javascript",
                "initialCode": "class BenchmarkEntity {\n  constructor(id, tag) {\n    this.id = id;\n    this.tag = tag;\n  }\n}\n\nconst collection = [];\nfor (let i = 0; i < 1000; i++) {\n  collection.push(new BenchmarkEntity(i, 'system_metric'));\n}\nconsole.log('Collection initialized with shape integrity:', collection.length);",
                "expectedOutput": "Collection initialized with shape integrity: 1000"
              }
            }
          ]
        },
        {
          "id": "mod-js-2",
          "title": "Module 2: Microtasks, Macrotasks & Event Loop Scheduling",
          "duration": "4.5 hours",
          "lessons": [
            {
              "id": "les-js-2-1",
              "title": "Event Loop Turn: Microtask Checkpoint Semantics",
              "readTime": "35 min",
              "content": "### Event Loop Turn: Microtask Checkpoint Semantics\n\nThe HTML Event Loop specification governs the precise execution order between synchronous call stacks, microtask checkpoints, animation frame callbacks, and macrotask queues.",
              "codeExercise": {
                "language": "javascript",
                "initialCode": "const executionOrder = [];\nexecutionOrder.push('sync');\nqueueMicrotask(() => {\n  executionOrder.push('microtask');\n  console.log('Trace:', executionOrder.join(' -> '));\n});",
                "expectedOutput": "Trace: sync -> microtask"
              }
            }
          ]
        }
      ],
      "quiz": {
        "id": "quiz-js-401",
        "title": "Certification Examination: JavaScript Engine Internals",
        "passingScore": 80,
        "timeLimitMinutes": 20,
        "questions": [
          {
            "id": "q-js-1",
            "text": "What happens when microtasks continuously enqueue additional microtasks during a single event loop turn?",
            "options": [
              "The browser forcibly pauses the microtask queue after 16 milliseconds.",
              "The event loop drains all newly enqueued microtasks consecutively, blocking UI rendering and starving macrotasks.",
              "Microtasks are converted automatically into macrotasks scheduled on the next iteration.",
              "A RangeError is thrown immediately."
            ],
            "correctIndex": 1,
            "explanation": "According to the HTML specification, the microtask checkpoint does not exit until the microtask queue is completely empty. If microtasks perpetually enqueue more microtasks, the event loop starves UI rendering and macrotasks."
          },
          {
            "id": "q-js-2",
            "text": "Which memory heap space in V8 is responsible for holding ephemeral short-lived objects using a fast copying collector?",
            "options": [
              "Old Pointer Space",
              "Large Object Space",
              "New Space (Young Generation)",
              "Code Space (Executable JIT memory)"
            ],
            "correctIndex": 2,
            "explanation": "New Space (or Young Generation) is divided into two semi-spaces managed by the Scavenger collector. It allocates ephemeral objects rapidly."
          }
        ]
      }
    },
    {
      "id": "css-systems-201",
      "title": "Modern CSS Systems & Scalable UI Engineering",
      "slug": "modern-css-systems-scalable-ui",
      "category": "Frontend Engineering",
      "level": "Intermediate to Advanced",
      "duration": "10 hours",
      "rating": 4.88,
      "enrollmentCount": 4290,
      "instructor": {
        "name": "Elena Rostova",
        "role": "Staff Design Systems Engineer",
        "organization": "DevPath UI Guild"
      },
      "description": "Architect robust, scalable web user interfaces without third-party utility bloat. Master CSS Custom Properties token design, Container Queries, Cascade Layers (@layer), subgrid layouts, and GPU hardware compositing.",
      "prerequisites": ["Intermediate CSS experience", "Understanding of the Document Object Model (DOM)", "Experience with responsive layout patterns"],
      "modules": [
        {
          "id": "mod-css-1",
          "title": "Module 1: Design Tokens & Semantic Variable Hierarchies",
          "duration": "3.5 hours",
          "lessons": [
            {
              "id": "les-css-1-1",
              "title": "Three-Tier Token Architecture for Enterprise Design Systems",
              "readTime": "25 min",
              "content": "### Three-Tier Token Architecture for Enterprise Design Systems\n\nScalable CSS architecture decouples raw values from component consumption using a three-tier token hierarchy:\n\n1. Global (Primitive) Tokens\n2. Semantic (Alias) Tokens\n3. Component Tokens",
              "codeExercise": {
                "language": "javascript",
                "initialCode": "const tokenMap = { '--color-brand-primary': '#2563eb' };\nconsole.log('Brand Primary:', tokenMap['--color-brand-primary']);",
                "expectedOutput": "Brand Primary: #2563eb"
              }
            }
          ]
        }
      ],
      "quiz": {
        "id": "quiz-css-201",
        "title": "Certification Examination: Modern CSS Systems",
        "passingScore": 80,
        "timeLimitMinutes": 15,
        "questions": [
          {
            "id": "q-css-1",
            "text": "How do CSS Cascade Layers (@layer) resolve conflicting rules between two different layers when selector specificity differs?",
            "options": [
              "The rule with the highest individual selector specificity wins regardless of layer ordering.",
              "The layer defined later in the layer declaration sequence always takes precedence for normal declarations, regardless of selector specificity.",
              "The browser concatenates styles and applies CSS animation keyframes.",
              "Layers with ID selectors override all other layers unconditionally."
            ],
            "correctIndex": 1,
            "explanation": "In CSS Cascade Layers, layer order takes precedence over selector specificity for normal declarations."
          }
        ]
      }
    },
    {
      "id": "web-sec-501",
      "title": "Web Application Security & Defense Engineering",
      "slug": "web-app-security-defense-engineering",
      "category": "Security & Reliability",
      "level": "Advanced",
      "duration": "14 hours",
      "rating": 4.97,
      "enrollmentCount": 3410,
      "instructor": {
        "name": "Alexandre Dupont",
        "role": "Principal Security Researcher",
        "organization": "DevPath Defense Institute"
      },
      "description": "Engineered for web architects and senior developers. Rigorous defense against modern web vulnerabilities: OAuth 2.1 & PKCE, strict Content Security Policy, CSRF tokens, Subresource Integrity, and secure cookie headers.",
      "prerequisites": ["Deep understanding of HTTP headers and Cookies", "Familiarity with Client-Server Auth flows"],
      "modules": [
        {
          "id": "mod-sec-1",
          "title": "Module 1: Authentication Architecture & Token Security",
          "duration": "4.5 hours",
          "lessons": [
            {
              "id": "les-sec-1-1",
              "title": "OAuth 2.1, Proof Key for Code Exchange (PKCE) & Token Storage",
              "readTime": "35 min",
              "content": "### OAuth 2.1, Proof Key for Code Exchange (PKCE) & Token Storage\n\nStoring authentication tokens in `localStorage` exposes single-page applications to instantaneous credential exfiltration whenever a Cross-Site Scripting (XSS) vulnerability exists.",
              "codeExercise": {
                "language": "javascript",
                "initialCode": "const flags = 'Path=/; Secure; HttpOnly; SameSite=Strict';\nconsole.log('HttpOnly protected:', flags.includes('HttpOnly'));",
                "expectedOutput": "HttpOnly protected: true"
              }
            }
          ]
        }
      ],
      "quiz": {
        "id": "quiz-sec-501",
        "title": "Certification Examination: Web Application Security Engineering",
        "passingScore": 80,
        "timeLimitMinutes": 20,
        "questions": [
          {
            "id": "q-sec-1",
            "text": "Why is storing sensitive session JWTs inside window.localStorage considered a severe security vulnerability?",
            "options": [
              "LocalStorage data is automatically flushed when the user closes their browser tab.",
              "Any injected Cross-Site Scripting (XSS) payload can access and exfiltrate window.localStorage without restriction.",
              "LocalStorage requests bypass SSL/TLS encryption across the local network.",
              "LocalStorage values can be read by any external domain on the public internet."
            ],
            "correctIndex": 1,
            "explanation": "LocalStorage is accessible to any script executing on the origin. HttpOnly cookies prevent JavaScript DOM access entirely."
          }
        ]
      }
    }
  ];

  // Application State
  const state = {
    courses: [],
    userState: null,
    currentCourseId: null,
    currentLessonId: null,
    activeCategoryFilter: 'all',
    searchQuery: '',
    quizTimerInterval: null,
    quizSecondsRemaining: 1200
  };

  // Toast System
  function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span class="icon-slot">${getIcon(type === 'success' ? 'checkCircle' : 'alertCircle')}</span>
      <span>${escapeHtml(message)}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 250);
    }, 3500);
  }

  // HTML escaping utility
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Convert technical markdown to formatted HTML
  function renderMarkdown(md) {
    if (!md) return '';

    let html = md;

    // Code blocks with syntax copy button
    html = html.replace(/```([a-z0-9_-]*)\n([\s\S]*?)```/g, (match, lang, code) => {
      const escapedCode = escapeHtml(code.trim());
      return `
        <div class="code-block-wrapper">
          <div class="code-header-bar">
            <span>${lang ? lang.toUpperCase() : 'CODE'}</span>
            <button class="code-copy-btn" onclick="navigator.clipboard.writeText(\`${escapedCode.replace(/`/g, '\\`').replace(/\\/g, '\\\\')}\`); DevPathApp.notifyCopy();">
              ${getIcon('copy')} Copy
            </button>
          </div>
          <pre><code>${escapedCode}</code></pre>
        </div>
      `;
    });

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');

    // Bold & inline code
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/`([^`]+)`/g, '<code style="background: rgba(255,255,255,0.08); padding: 0.15rem 0.35rem; border-radius: 4px; font-family: var(--font-mono); font-size: 0.85em;">$1</code>');

    // Tables
    html = html.replace(/\|(.+)\|/g, (match) => {
      // Basic table row detection
      return match;
    });

    // Paragraphs
    html = html.split('\n\n').map(p => {
      p = p.trim();
      if (!p) return '';
      if (p.startsWith('<h') || p.startsWith('<div') || p.startsWith('<pre') || p.startsWith('<ul>') || p.startsWith('<table')) {
        return p;
      }
      if (p.startsWith('- ')) {
        const items = p.split('\n- ').map(i => `<li>${i.replace(/^- /, '')}</li>`).join('');
        return `<ul>${items}</ul>`;
      }
      return `<p>${p.replace(/\n/g, '<br>')}</p>`;
    }).join('\n');

    return html;
  }

  // Inject Icons into [data-icon] and .icon-slot slots
  function hydrateIcons() {
    document.querySelectorAll('[data-icon]').forEach(el => {
      const name = el.getAttribute('data-icon');
      if (ICONS[name]) {
        el.innerHTML = ICONS[name];
      }
    });

    const brandIcon = document.getElementById('brandIconSlot');
    if (brandIcon) brandIcon.innerHTML = ICONS.logo;
  }

  // View Switcher
  function switchView(viewName, params = {}) {
    clearInterval(state.quizTimerInterval);

    document.querySelectorAll('.page-view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    const navBtn = document.querySelector(`.nav-item[data-view="${viewName}"]`);
    if (navBtn) navBtn.classList.add('active');

    const viewEl = document.getElementById(
      viewName === 'catalog' ? 'viewCatalog' :
      viewName === 'detail' ? 'viewCourseDetail' :
      viewName === 'lesson' ? 'viewLesson' :
      viewName === 'quiz' ? 'viewQuiz' :
      viewName === 'certificate' ? 'viewCertificate' :
      viewName === 'verification' ? 'viewVerification' :
      viewName === 'dashboard' ? 'viewDashboard' : 'viewCatalog'
    );

    if (viewEl) {
      viewEl.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (viewName === 'catalog') renderCatalog();
    if (viewName === 'dashboard') renderDashboard();
    if (viewName === 'detail' && params.courseId) loadCourseDetail(params.courseId);
    if (viewName === 'lesson' && params.courseId && params.lessonId) loadLesson(params.courseId, params.lessonId);
    if (viewName === 'quiz' && params.courseId) loadQuiz(params.courseId);
    if (viewName === 'certificate' && params.courseId) renderCertificate(params.courseId);
    if (viewName === 'verification') {
      if (params.certId) {
        document.getElementById('verifyCertIdInput').value = params.certId;
        executeVerification(params.certId);
      }
    }

    hydrateIcons();
  }

  // Render Catalog
  function renderCatalog() {
    const container = document.getElementById('coursesGridContainer');
    if (!container) return;

    let filtered = state.courses;
    if (state.activeCategoryFilter !== 'all') {
      filtered = filtered.filter(c => c.category === state.activeCategoryFilter);
    }
    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.title.toLowerCase().includes(q) || 
        c.description.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
      );
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; background: var(--bg-card); border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
          <div style="color: var(--text-muted); margin-bottom: 0.75rem;">No courses matched your current filter criteria.</div>
          <button class="btn btn-secondary btn-sm" onclick="DevPathApp.resetFilters()">Clear Filters</button>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(course => {
      const isEnrolled = state.userState && state.userState.user.enrolledCourses.includes(course.id);
      const progress = (state.userState && state.userState.progress[course.id]) || { completedLessons: [] };
      const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
      const completedCount = progress.completedLessons.length;
      const pct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

      const cert = state.userState && state.userState.certificates.find(c => c.courseId === course.id);

      return `
        <div class="course-card">
          <div class="card-top-meta">
            <span class="category-tag">${escapeHtml(course.category)}</span>
            <span class="level-badge">${escapeHtml(course.level)}</span>
          </div>

          <h3 class="course-card-title">${escapeHtml(course.title)}</h3>
          <p class="course-card-desc">${escapeHtml(course.description)}</p>

          <div class="course-specs-bar">
            <span class="spec-item">${getIcon('clock')} ${escapeHtml(course.duration)}</span>
            <span class="spec-item">${getIcon('book')} ${course.modules.length} Modules</span>
            <span class="spec-rating">${getIcon('star')} ${course.rating}</span>
          </div>

          ${isEnrolled ? `
            <div class="course-progress-container">
              <div class="progress-label-row">
                <span>Progress: ${completedCount}/${totalLessons} Completed</span>
                <span>${pct}%</span>
              </div>
              <div class="progress-track">
                <div class="progress-fill" style="width: ${pct}%;"></div>
              </div>
            </div>
          ` : ''}

          <div class="card-actions">
            <button class="btn ${isEnrolled ? 'btn-primary' : 'btn-outline-primary'} btn-full" onclick="DevPathApp.openCourse('${course.id}')">
              ${isEnrolled ? (cert ? 'Review Syllabus & Credential' : 'Continue Course') : 'Explore Syllabus & Enroll'}
              ${getIcon('chevronRight')}
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Telemetry updates
    const countEl = document.getElementById('telemetryCoursesCount');
    if (countEl) countEl.textContent = state.courses.length;
    const certCountEl = document.getElementById('telemetryCertsCount');
    if (certCountEl && state.userState) {
      certCountEl.textContent = state.userState.certificates.length;
    }

    hydrateIcons();
  }

  // Load Course Detail
  function loadCourseDetail(courseId) {
    state.currentCourseId = courseId;
    const course = state.courses.find(c => c.id === courseId);
    if (!course) return;

    const isEnrolled = state.userState && state.userState.user.enrolledCourses.includes(course.id);
    const progress = (state.userState && state.userState.progress[course.id]) || { completedLessons: [], quizAttempts: [] };
    const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
    const completedCount = progress.completedLessons.length;
    const pct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
    const hasPassedQuiz = progress.quizAttempts.some(a => a.passed);
    const cert = state.userState && state.userState.certificates.find(c => c.courseId === course.id);

    // Header Card
    const headerEl = document.getElementById('detailHeaderCard');
    headerEl.innerHTML = `
      <div class="detail-main-info">
        <div style="display: flex; gap: 0.5rem; margin-bottom: 0.75rem;">
          <span class="category-tag">${escapeHtml(course.category)}</span>
          <span class="level-badge">${escapeHtml(course.level)}</span>
        </div>
        <h2 class="detail-title">${escapeHtml(course.title)}</h2>
        <p class="detail-desc">${escapeHtml(course.description)}</p>

        <div class="instructor-panel">
          <div class="instructor-avatar">${getIcon('user')}</div>
          <div>
            <div class="instructor-name">${escapeHtml(course.instructor.name)}</div>
            <div class="instructor-role">${escapeHtml(course.instructor.role)} • ${escapeHtml(course.instructor.organization)}</div>
          </div>
        </div>
      </div>

      <div class="detail-side-card">
        <div>
          <h4 style="font-size: 0.9375rem; font-weight: 700; margin-bottom: 0.5rem; color: #ffffff;">Course Specifications</h4>
          <div style="font-size: 0.8125rem; color: var(--text-secondary); display: flex; flex-direction: column; gap: 0.375rem; margin-bottom: 1rem;">
            <div>Duration: <strong>${escapeHtml(course.duration)}</strong></div>
            <div>Evaluation Standard: <strong>>= 80% passing grade</strong></div>
            <div>Credential: <strong>Verifiable Digital Certificate</strong></div>
          </div>

          <h4 style="font-size: 0.875rem; font-weight: 700; color: #ffffff;">Prerequisites:</h4>
          <ul class="prerequisites-list">
            ${course.prerequisites.map(p => `<li>${getIcon('check')} ${escapeHtml(p)}</li>`).join('')}
          </ul>
        </div>

        <div style="margin-top: 1.5rem;">
          ${!isEnrolled ? `
            <button class="btn btn-primary btn-full" onclick="DevPathApp.enrollInCurrentCourse()">
              ${getIcon('book')} Enroll in Track (Free Enterprise Access)
            </button>
          ` : `
            <div style="margin-bottom: 0.75rem;">
              <div class="progress-label-row">
                <span>Progress: ${completedCount}/${totalLessons} Lessons</span>
                <span>${pct}%</span>
              </div>
              <div class="progress-track">
                <div class="progress-fill" style="width: ${pct}%;"></div>
              </div>
            </div>
            ${firstIncompleteLesson(course, progress) ? `
              <button class="btn btn-primary btn-full" onclick="DevPathApp.openLesson('${course.id}', '${firstIncompleteLesson(course, progress)}')">
                ${getIcon('play')} Resume Current Lesson
              </button>
            ` : `
              <button class="btn btn-success btn-full" onclick="DevPathApp.openQuiz('${course.id}')">
                ${getIcon('award')} Take Final Certification Exam
              </button>
            `}
          `}
        </div>
      </div>
    `;

    // Modules Accordion
    const modulesEl = document.getElementById('detailModulesContainer');
    modulesEl.innerHTML = course.modules.map(mod => {
      return `
        <div class="module-box">
          <div class="module-header">
            <span class="module-header-title">${escapeHtml(mod.title)}</span>
            <span class="module-header-meta">${escapeHtml(mod.duration)} • ${mod.lessons.length} Lessons</span>
          </div>
          <ul class="lesson-list">
            ${mod.lessons.map(les => {
              const isDone = progress.completedLessons.includes(les.id);
              return `
                <li class="lesson-row-item" onclick="DevPathApp.openLesson('${course.id}', '${les.id}')">
                  <div class="lesson-left-col">
                    <div class="lesson-status-icon ${isDone ? 'completed' : ''}">
                      ${getIcon(isDone ? 'check' : 'code')}
                    </div>
                    <span class="lesson-title-text">${escapeHtml(les.title)}</span>
                  </div>
                  <span class="lesson-time-pill">${escapeHtml(les.readTime)}</span>
                </li>
              `;
            }).join('')}
          </ul>
        </div>
      `;
    }).join('');

    // Exam Card
    const examCard = document.getElementById('detailExamCard');
    examCard.innerHTML = `
      <div class="exam-info">
        <h4>${escapeHtml(course.quiz.title)}</h4>
        <p>Comprehensive scenario assessment: ${course.quiz.questions.length} questions • ${course.quiz.timeLimitMinutes} minutes • 80% passing threshold required for verified certificate.</p>
      </div>
      <div>
        ${cert ? `
          <button class="btn btn-success" onclick="DevPathApp.openCertificate('${course.id}')">
            ${getIcon('award')} View Official Credential
          </button>
        ` : (hasPassedQuiz ? `
          <button class="btn btn-success" onclick="DevPathApp.claimCertificate('${course.id}')">
            ${getIcon('award')} Claim Issued Certificate
          </button>
        ` : `
          <button class="btn btn-primary" onclick="DevPathApp.openQuiz('${course.id}')">
            ${getIcon('shield')} Launch Examination
          </button>
        `)}
      </div>
    `;

    hydrateIcons();
  }

  function firstIncompleteLesson(course, progress) {
    for (const mod of course.modules) {
      for (const les of mod.lessons) {
        if (!progress.completedLessons.includes(les.id)) {
          return les.id;
        }
      }
    }
    return course.modules[0].lessons[0].id;
  }

  // Load Lesson
  function loadLesson(courseId, lessonId) {
    state.currentCourseId = courseId;
    state.currentLessonId = lessonId;

    const course = state.courses.find(c => c.id === courseId);
    if (!course) return;

    let targetLesson = null;
    let targetModule = null;

    course.modules.forEach(m => {
      m.lessons.forEach(l => {
        if (l.id === lessonId) {
          targetLesson = l;
          targetModule = m;
        }
      });
    });

    if (!targetLesson) return;

    const progress = (state.userState && state.userState.progress[course.id]) || { completedLessons: [] };

    // Update Sidebar
    document.getElementById('lessonSidebarCourseTitle').textContent = course.title;
    document.getElementById('lessonBackCourseTitle').textContent = `Back to ${course.title}`;

    const sidebarList = document.getElementById('lessonSidebarModulesList');
    sidebarList.innerHTML = course.modules.map(m => `
      <div class="sidebar-module-title">${escapeHtml(m.title)}</div>
      ${m.lessons.map(l => {
        const isCompleted = progress.completedLessons.includes(l.id);
        const isActive = l.id === lessonId;
        return `
          <div class="sidebar-lesson-item ${isActive ? 'active' : ''}" onclick="DevPathApp.openLesson('${course.id}', '${l.id}')">
            <span class="icon-slot" style="color: ${isCompleted ? 'var(--accent-success-light)' : 'inherit'};">
              ${getIcon(isCompleted ? 'checkCircle' : 'code')}
            </span>
            <span style="flex-grow: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(l.title)}</span>
          </div>
        `;
      }).join('')}
    `).join('');

    // Lesson Header & Body
    document.getElementById('lessonBreadcrumbs').textContent = `${targetModule.title} / ${targetLesson.title}`;
    document.getElementById('lessonReadTime').textContent = targetLesson.readTime;
    document.getElementById('lessonArticleBody').innerHTML = renderMarkdown(targetLesson.content);

    // Sandbox
    const editor = document.getElementById('sandboxEditorInput');
    const terminal = document.getElementById('sandboxTerminalOutput');
    if (targetLesson.codeExercise) {
      editor.value = targetLesson.codeExercise.initialCode;
      terminal.textContent = "// Press 'Execute in Runtime' to test output\n// Expected: " + (targetLesson.codeExercise.expectedOutput || 'Success');
      document.getElementById('lessonSandboxPanel').style.display = 'block';
    } else {
      document.getElementById('lessonSandboxPanel').style.display = 'none';
    }

    // Previous / Next Buttons
    const flatLessons = [];
    course.modules.forEach(m => m.lessons.forEach(l => flatLessons.push(l.id)));
    const currIndex = flatLessons.indexOf(lessonId);

    const prevBtn = document.getElementById('lessonPrevBtn');
    const nextBtn = document.getElementById('lessonNextBtn');

    prevBtn.disabled = currIndex <= 0;
    prevBtn.onclick = () => {
      if (currIndex > 0) loadLesson(courseId, flatLessons[currIndex - 1]);
    };

    nextBtn.onclick = () => {
      if (currIndex < flatLessons.length - 1) {
        loadLesson(courseId, flatLessons[currIndex + 1]);
      } else {
        switchView('quiz', { courseId });
      }
    };
    nextBtn.textContent = (currIndex === flatLessons.length - 1) ? 'Proceed to Examination' : 'Next Lesson';

    // Mark completed button state
    const markBtn = document.getElementById('lessonMarkCompletedBtn');
    const alreadyDone = progress.completedLessons.includes(lessonId);
    markBtn.innerHTML = `${getIcon('check')} ${alreadyDone ? 'Completed (Update)' : 'Mark Completed & Continue'}`;
    markBtn.onclick = async () => {
      await api.completeLesson(courseId, lessonId);
      state.userState = await api.getUserState();
      showToast('Progress synchronized. Lesson marked as completed.', 'success');
      if (currIndex < flatLessons.length - 1) {
        loadLesson(courseId, flatLessons[currIndex + 1]);
      } else {
        switchView('detail', { courseId });
      }
    };

    hydrateIcons();
  }

  // Load Quiz
  function loadQuiz(courseId) {
    state.currentCourseId = courseId;
    const course = state.courses.find(c => c.id === courseId);
    if (!course || !course.quiz) return;

    const quiz = course.quiz;
    document.getElementById('quizTitle').textContent = quiz.title;
    document.getElementById('quizMetaSubtext').textContent = `Passing Score: ${quiz.passingScore}% • ${quiz.questions.length} Scenario Questions • ${quiz.timeLimitMinutes} min limit`;
    document.getElementById('quizScoreResultBanner').style.display = 'none';
    document.getElementById('quizActionRow').style.display = 'block';

    // Setup timer
    state.quizSecondsRemaining = quiz.timeLimitMinutes * 60;
    updateTimerDisplay();
    clearInterval(state.quizTimerInterval);
    state.quizTimerInterval = setInterval(() => {
      state.quizSecondsRemaining--;
      updateTimerDisplay();
      if (state.quizSecondsRemaining <= 0) {
        clearInterval(state.quizTimerInterval);
        showToast('Time expired! Automatically submitting assessment...', 'warning');
        submitQuizAnswers();
      }
    }, 1000);

    const questionsContainer = document.getElementById('quizQuestionsContainer');
    questionsContainer.innerHTML = quiz.questions.map((q, index) => {
      return `
        <div class="question-card" id="qCard_${q.id}">
          <div class="question-number-badge">Scenario Question 0${index + 1}</div>
          <div class="question-text">${escapeHtml(q.text)}</div>
          <div class="options-group">
            ${q.options.map((opt, optIndex) => `
              <label class="option-item" id="optLabel_${q.id}_${optIndex}">
                <input type="radio" name="question_${q.id}" value="${optIndex}" class="option-radio" onchange="DevPathApp.selectOption('${q.id}', ${optIndex})">
                <span class="option-label">${escapeHtml(opt)}</span>
              </label>
            `).join('')}
          </div>
          <div class="explanation-box" id="explanation_${q.id}" style="display: none;"></div>
        </div>
      `;
    }).join('');

    const submitBtn = document.getElementById('quizSubmitBtn');
    submitBtn.onclick = submitQuizAnswers;

    hydrateIcons();
  }

  function updateTimerDisplay() {
    const mins = Math.floor(state.quizSecondsRemaining / 60);
    const secs = state.quizSecondsRemaining % 60;
    const display = document.getElementById('quizTimeRemaining');
    if (display) {
      display.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
  }

  async function submitQuizAnswers() {
    clearInterval(state.quizTimerInterval);
    const course = state.courses.find(c => c.id === state.currentCourseId);
    if (!course || !course.quiz) return;

    const answers = {};
    course.quiz.questions.forEach(q => {
      const selected = document.querySelector(`input[name="question_${q.id}"]:checked`);
      answers[q.id] = selected ? parseInt(selected.value, 10) : -1;
    });

    const attempt = await api.submitQuiz(course.id, answers);
    state.userState = await api.getUserState();

    // Render results
    const banner = document.getElementById('quizScoreResultBanner');
    banner.style.display = 'block';
    banner.className = 'quiz-score-banner';

    banner.innerHTML = `
      <div class="score-big-number">${attempt.score}%</div>
      <div class="score-status-text" style="color: ${attempt.passed ? 'var(--accent-success-light)' : 'var(--accent-danger)'};">
        ${attempt.passed ? 'Official Certification Examination Passed' : 'Assessment Threshold Not Met'}
      </div>
      <p style="font-size: 0.875rem; color: var(--text-secondary); max-width: 600px; margin: 0 auto 1.5rem auto;">
        ${attempt.passed 
          ? `You have demonstrated mastery of the production standards for ${course.title} with a score of ${attempt.score}%. Your verifiable digital credential is now unlocked.`
          : `A minimum passing score of ${course.quiz.passingScore}% is required for certification issuance. Review the technical explanations below and re-attempt when ready.`}
      </p>
      <div>
        ${attempt.passed ? `
          <button class="btn btn-success" onclick="DevPathApp.claimCertificate('${course.id}')">
            ${getIcon('award')} Issue & Inspect Official Certificate
          </button>
        ` : `
          <button class="btn btn-secondary" onclick="DevPathApp.openQuiz('${course.id}')">
            ${getIcon('refresh')} Retake Examination
          </button>
        `}
      </div>
    `;

    // Highlight explanations per question
    attempt.questionReview.forEach(r => {
      const expBox = document.getElementById(`explanation_${r.id}`);
      if (expBox) {
        expBox.style.display = 'block';
        expBox.className = `explanation-box ${r.isCorrect ? 'correct' : 'incorrect'}`;
        expBox.innerHTML = `
          <strong>${r.isCorrect ? 'Correct Decision:' : 'Incorrect Decision (Engineering Analysis):'}</strong>
          <br>${escapeHtml(r.explanation)}
        `;
      }
    });

    // Hide submit button
    document.getElementById('quizActionRow').style.display = 'none';

    showToast(attempt.passed ? 'Examination Passed! Certificate Unlocked.' : 'Examination evaluated.', attempt.passed ? 'success' : 'warning');
    hydrateIcons();
  }

  // Certificate Vector Canvas Engine
  async function renderCertificate(courseId) {
    const cert = state.userState && state.userState.certificates.find(c => c.courseId === courseId);
    if (!cert) {
      showToast('Certificate not yet issued for this course.', 'warning');
      return;
    }

    const canvas = document.getElementById('certCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const width = 1200;
    const height = 850;
    canvas.width = width;
    canvas.height = height;

    // Background Gradient (Enterprise Deep Navy & Slate)
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#0a0f1d');
    bgGrad.addColorStop(1, '#0e172a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Guilloche / Geometric Border
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 14;
    ctx.strokeRect(20, 20, width - 40, height - 40);

    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.strokeRect(36, 36, width - 72, height - 72);

    // Corner decorative accents
    ctx.fillStyle = '#3b82f6';
    const corners = [
      [36, 36], [width - 36, 36],
      [36, height - 36], [width - 36, height - 36]
    ];
    corners.forEach(([cx, cy]) => {
      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.fill();
    });

    // Header Authority
    ctx.textAlign = 'center';
    ctx.fillStyle = '#60a5fa';
    ctx.font = '700 14px "Inter", sans-serif';
    ctx.letterSpacing = '4px';
    ctx.fillText('DEVPATH ACADEMY OF WEB TECHNOLOGY ENGINEERING', width / 2, 95);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 12px "Inter", sans-serif';
    ctx.fillText('OFFICIAL CRYPTOGRAPHIC REGISTRY OF COMPETENCE', width / 2, 120);

    // Decorative line
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 200, 140);
    ctx.lineTo(width / 2 + 200, 140);
    ctx.stroke();

    // Main Certificate Title
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 38px "Inter", sans-serif';
    ctx.fillText('CERTIFICATE OF ENGINEERING EXCELLENCE', width / 2, 210);

    // Subtext
    ctx.fillStyle = '#94a3b8';
    ctx.font = '400 16px "Inter", sans-serif';
    ctx.fillText('This document certifies that', width / 2, 260);

    // Recipient Name
    ctx.fillStyle = '#38bdf8';
    ctx.font = '700 42px "Inter", sans-serif';
    ctx.fillText(cert.recipientName.toUpperCase(), width / 2, 325);

    // Body
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '400 17px "Inter", sans-serif';
    ctx.fillText('has fulfilled all production syllabus standards and demonstrated advanced architecture mastery in', width / 2, 380);

    // Course Title
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 28px "Inter", sans-serif';
    ctx.fillText(cert.courseTitle, width / 2, 435);

    // Verified Skills Box
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    const boxW = 860;
    const boxH = 90;
    const boxX = (width - boxW) / 2;
    const boxY = 480;
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 11px "Inter", sans-serif';
    ctx.fillText('VERIFIED TECHNICAL COMPETENCIES', width / 2, boxY + 28);

    ctx.fillStyle = '#60a5fa';
    ctx.font = '600 13px "JetBrains Mono", monospace';
    const skillsStr = (cert.skillsVerified || []).join('   •   ');
    ctx.fillText(skillsStr, width / 2, boxY + 58);

    // Lower Footer: Signatures, ID, Seal
    // Instructor Signature Block (Left)
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = '600 16px "Inter", sans-serif';
    ctx.fillText(cert.instructorName, 120, 680);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '400 13px "Inter", sans-serif';
    ctx.fillText(cert.instructorRole, 120, 702);

    ctx.strokeStyle = '#475569';
    ctx.beginPath();
    ctx.moveTo(120, 655);
    ctx.lineTo(340, 655);
    ctx.stroke();

    // Verification ID & Hash (Right)
    ctx.textAlign = 'right';
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 14px "JetBrains Mono", monospace';
    ctx.fillText(`ID: ${cert.id}`, width - 120, 660);

    ctx.fillStyle = '#10b981';
    ctx.font = '600 13px "Inter", sans-serif';
    ctx.fillText(`Evaluation Grade: ${cert.grade} (Passed)`, width - 120, 684);

    ctx.fillStyle = '#64748b';
    ctx.font = '400 12px "JetBrains Mono", monospace';
    ctx.fillText(`Issued: ${cert.issueDate}`, width - 120, 706);

    ctx.fillText(`SHA-256: ${cert.verificationHash.substring(0, 24)}...`, width - 120, 726);

    // Gold/Emerald Digital Seal (Center)
    ctx.save();
    ctx.translate(width / 2, 690);
    ctx.beginPath();
    ctx.arc(0, 0, 48, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#10b981';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, 40, 0, Math.PI * 2);
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#34d399';
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#34d399';
    ctx.font = '800 10px "Inter", sans-serif';
    ctx.fillText('VERIFIED', 0, -6);
    ctx.fillText('REGISTRY', 0, 10);
    ctx.font = '500 8px "Inter", sans-serif';
    ctx.fillText('2026', 0, 24);
    ctx.restore();

    // Hook up action buttons
    document.getElementById('certDownloadPngBtn').onclick = () => {
      const link = document.createElement('a');
      link.download = `${cert.id}_DevPath_Certificate.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      showToast('High-resolution certificate downloaded.', 'success');
    };

    document.getElementById('certPrintBtn').onclick = () => {
      window.print();
    };

    document.getElementById('certVerifyLinkBtn').onclick = () => {
      switchView('verification', { certId: cert.id });
    };

    hydrateIcons();
  }

  // Public Verification Portal
  async function executeVerification(certIdToQuery) {
    const input = document.getElementById('verifyCertIdInput');
    const query = certIdToQuery || (input ? input.value.trim() : '');
    if (!query) return;

    const resultContainer = document.getElementById('verificationResultContainer');
    resultContainer.style.display = 'block';

    const result = await api.verifyCertificate(query);

    if (result && result.valid) {
      const c = result.certificate;
      resultContainer.innerHTML = `
        <div class="verified-stamp-badge valid">
          ${getIcon('checkCircle')} Cryptographically Authenticated & Valid
        </div>

        <div class="cert-audit-grid">
          <div>
            <div class="audit-field-label">Certificate ID</div>
            <div class="audit-field-value" style="font-family: var(--font-mono); color: #38bdf8;">${escapeHtml(c.id)}</div>
          </div>
          <div>
            <div class="audit-field-label">Issuance Date</div>
            <div class="audit-field-value">${escapeHtml(c.issueDate)}</div>
          </div>
          <div>
            <div class="audit-field-label">Recipient Name</div>
            <div class="audit-field-value">${escapeHtml(c.recipientName)}</div>
          </div>
          <div>
            <div class="audit-field-label">Course Program</div>
            <div class="audit-field-value">${escapeHtml(c.courseTitle)}</div>
          </div>
          <div>
            <div class="audit-field-label">Passing Grade</div>
            <div class="audit-field-value" style="color: var(--accent-success-light);">${escapeHtml(c.grade)}</div>
          </div>
          <div>
            <div class="audit-field-label">Issuing Authority</div>
            <div class="audit-field-value">${escapeHtml(result.verificationAuthority)}</div>
          </div>
          <div style="grid-column: 1 / -1;">
            <div class="audit-field-label">Tamper-Evident SHA-256 Hash</div>
            <div class="audit-field-value" style="font-family: var(--font-mono); font-size: 0.75rem; color: #94a3b8;">${escapeHtml(c.verificationHash)}</div>
          </div>
        </div>

        <div style="margin-top: 1.5rem; text-align: right;">
          <button class="btn btn-outline-primary btn-sm" onclick="DevPathApp.openCertificate('${c.courseId}')">
            ${getIcon('award')} Inspect Vector Certificate
          </button>
        </div>
      `;
    } else {
      resultContainer.innerHTML = `
        <div class="verified-stamp-badge invalid">
          ${getIcon('alertCircle')} Invalid or Unregistered Credential
        </div>
        <p style="font-size: 0.875rem; color: var(--text-secondary);">
          The certificate ID <strong>${escapeHtml(query)}</strong> could not be authenticated against the DevPath Academy cryptographic registry.
        </p>
      `;
    }

    hydrateIcons();
  }

  // Dashboard View
  function renderDashboard() {
    if (!state.userState) return;

    const { user, progress, certificates } = state.userState;

    document.getElementById('dashEnrolledCount').textContent = user.enrolledCourses.length;
    
    let totalCompleted = 0;
    Object.values(progress).forEach(p => {
      totalCompleted += (p.completedLessons || []).length;
    });
    document.getElementById('dashLessonsCount').textContent = totalCompleted;

    const passedAttempts = [];
    Object.values(progress).forEach(p => {
      (p.quizAttempts || []).forEach(a => {
        if (a.passed) passedAttempts.push(a);
      });
    });
    document.getElementById('dashExamsPassedCount').textContent = passedAttempts.length;
    document.getElementById('dashCertsCount').textContent = certificates.length;

    // Enrolled Courses List
    const enrolledContainer = document.getElementById('dashboardEnrolledList');
    if (user.enrolledCourses.length === 0) {
      enrolledContainer.innerHTML = `<div style="color: var(--text-muted);">No courses currently enrolled.</div>`;
    } else {
      enrolledContainer.innerHTML = user.enrolledCourses.map(cId => {
        const course = state.courses.find(c => c.id === cId);
        if (!course) return '';
        const p = progress[cId] || { completedLessons: [] };
        const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
        const done = p.completedLessons.length;
        const pct = totalLessons > 0 ? Math.round((done / totalLessons) * 100) : 0;
        const cert = certificates.find(c => c.courseId === cId);

        return `
          <div class="enrolled-course-item">
            <div>
              <div class="enrolled-title">${escapeHtml(course.title)}</div>
              <div class="enrolled-meta">${course.modules.length} Modules • ${escapeHtml(course.level)} • ${escapeHtml(course.instructor.name)}</div>
            </div>
            <div>
              <div class="progress-label-row">
                <span>Completed ${done}/${totalLessons}</span>
                <span>${pct}%</span>
              </div>
              <div class="progress-track">
                <div class="progress-fill" style="width: ${pct}%;"></div>
              </div>
            </div>
            <div style="text-align: right;">
              ${cert ? `
                <button class="btn btn-success btn-sm" onclick="DevPathApp.openCertificate('${course.id}')">
                  ${getIcon('award')} View Certificate
                </button>
              ` : `
                <button class="btn btn-primary btn-sm" onclick="DevPathApp.openCourse('${course.id}')">
                  ${getIcon('play')} Resume Course
                </button>
              `}
            </div>
          </div>
        `;
      }).join('');
    }

    // Credentials Table
    const certsTable = document.getElementById('dashboardCertsTableBody');
    if (certificates.length === 0) {
      certsTable.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 2rem;">No certificates issued yet. Pass a final examination to earn an official credential.</td></tr>`;
    } else {
      certsTable.innerHTML = certificates.map(c => `
        <tr>
          <td style="font-family: var(--font-mono); color: #38bdf8; font-weight: 600;">${escapeHtml(c.id)}</td>
          <td style="font-weight: 600; color: #ffffff;">${escapeHtml(c.courseTitle)}</td>
          <td>${escapeHtml(c.issueDate)}</td>
          <td><span style="color: var(--accent-success-light); font-weight: 700;">${escapeHtml(c.grade)}</span></td>
          <td style="font-family: var(--font-mono); font-size: 0.75rem; color: #64748b;">${escapeHtml(c.verificationHash.substring(0, 16))}...</td>
          <td>
            <button class="btn btn-secondary btn-sm" onclick="DevPathApp.openCertificate('${c.courseId}')">
              ${getIcon('award')} Open
            </button>
          </td>
        </tr>
      `).join('');
    }

    hydrateIcons();
  }

  // Setup Event Handlers
  function bindEvents() {
    // Nav items
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.getAttribute('data-view');
        switchView(view);
      });
    });

    document.getElementById('brandHomeBtn').addEventListener('click', () => switchView('catalog'));
    document.getElementById('detailBackBtn').addEventListener('click', () => switchView('catalog'));
    document.getElementById('lessonBackToCourseBtn').addEventListener('click', () => {
      switchView('detail', { courseId: state.currentCourseId });
    });
    document.getElementById('quizBackBtn').addEventListener('click', () => {
      switchView('detail', { courseId: state.currentCourseId });
    });
    document.getElementById('certBackBtn').addEventListener('click', () => switchView('dashboard'));

    // Category Tabs
    document.querySelectorAll('#catalogFilterTabs .tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#catalogFilterTabs .tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.activeCategoryFilter = btn.getAttribute('data-filter');
        renderCatalog();
      });
    });

    // Search Input
    const searchInput = document.getElementById('courseSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value.trim();
        renderCatalog();
      });
    }

    // Sandbox execution
    const runBtn = document.getElementById('sandboxExecuteBtn');
    if (runBtn) {
      runBtn.addEventListener('click', async () => {
        const editor = document.getElementById('sandboxEditorInput');
        const terminal = document.getElementById('sandboxTerminalOutput');
        terminal.textContent = 'Running in sandbox runtime...';

        const result = await api.executeSandbox(editor.value);
        terminal.textContent = result.output;
        showToast(result.success ? 'Execution completed.' : 'Execution encountered errors.', result.success ? 'success' : 'warning');
      });
    }

    // Public verifier execute button
    const verifyBtn = document.getElementById('verifyExecuteBtn');
    if (verifyBtn) {
      verifyBtn.addEventListener('click', () => {
        const input = document.getElementById('verifyCertIdInput');
        executeVerification(input.value.trim());
      });
    }
  }

  // Public Interface for DevPathApp
  window.DevPathApp = {
    async init() {
      state.courses = await api.getCourses();
      state.userState = await api.getUserState();

      // Hydrate user badge in header
      if (state.userState && state.userState.user) {
        document.getElementById('userDisplayName').textContent = state.userState.user.name;
        document.getElementById('userDisplayRole').textContent = state.userState.user.title;
        const initials = state.userState.user.name.split(' ').map(n => n[0]).join('').substring(0, 2);
        document.getElementById('userAvatar').textContent = initials;
      }

      bindEvents();
      renderCatalog();
      hydrateIcons();
    },

    openCourse(courseId) {
      switchView('detail', { courseId });
    },

    openLesson(courseId, lessonId) {
      switchView('lesson', { courseId, lessonId });
    },

    openQuiz(courseId) {
      switchView('quiz', { courseId });
    },

    openCertificate(courseId) {
      switchView('certificate', { courseId });
    },

    async enrollInCurrentCourse() {
      if (!state.currentCourseId) return;
      await api.enrollCourse(state.currentCourseId);
      state.userState = await api.getUserState();
      showToast('Enrolled successfully! Track activated in your curriculum.', 'success');
      loadCourseDetail(state.currentCourseId);
    },

    async claimCertificate(courseId) {
      const recipientName = (state.userState && state.userState.user.name) || 'Alex Morgan';
      const cert = await api.issueCertificate(courseId, recipientName);
      state.userState = await api.getUserState();
      showToast(`Official Certificate ${cert.id} issued!`, 'success');
      switchView('certificate', { courseId });
    },

    selectOption(questionId, optIndex) {
      document.querySelectorAll(`[id^="optLabel_${questionId}_"]`).forEach(l => l.classList.remove('selected'));
      const activeLabel = document.getElementById(`optLabel_${questionId}_${optIndex}`);
      if (activeLabel) activeLabel.classList.add('selected');
    },

    resetFilters() {
      state.activeCategoryFilter = 'all';
      state.searchQuery = '';
      const search = document.getElementById('courseSearchInput');
      if (search) search.value = '';
      document.querySelectorAll('#catalogFilterTabs .tab-btn').forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-filter') === 'all');
      });
      renderCatalog();
    },

    notifyCopy() {
      showToast('Code block copied to clipboard.', 'success');
    }
  };

  // Bootstrap on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.DevPathApp.init());
  } else {
    window.DevPathApp.init();
  }

})();
