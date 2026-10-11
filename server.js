const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const db = require('./data/db');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 1e6) { // 1MB limit
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        const parsed = body ? JSON.parse(body) : {};
        resolve(parsed);
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function serveStatic(req, res, pathname) {
  let relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\//, '');
  let filePath = path.join(PUBLIC_DIR, relativePath);

  // Security check: prevent directory traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    return res.end('Access Denied');
  }

  // If path doesn't have an extension, try adding .html or serve index.html
  if (!path.extname(filePath)) {
    if (fs.existsSync(filePath + '.html')) {
      filePath += '.html';
    } else if (fs.existsSync(path.join(filePath, 'index.html'))) {
      filePath = path.join(filePath, 'index.html');
    } else {
      filePath = path.join(PUBLIC_DIR, 'index.html');
    }
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback for SPA routing to index.html
      const fallbackPath = path.join(PUBLIC_DIR, 'index.html');
      fs.readFile(fallbackPath, (fallbackErr, data) => {
        if (fallbackErr) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          return res.end('404 Not Found');
        }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(data);
      });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache'
    });
    fs.createReadStream(filePath).pipe(res);
  });
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  // --- REST API ROUTES ---
  if (pathname.startsWith('/api/')) {
    try {
      // 1. GET /api/courses
      if (pathname === '/api/courses' && method === 'GET') {
        const courses = db.getCourses();
        return sendJson(res, 200, { success: true, courses });
      }

      // 2. GET /api/courses/:id
      const courseMatch = pathname.match(/^\/api\/courses\/([a-zA-Z0-9_-]+)$/);
      if (courseMatch && method === 'GET') {
        const courseId = courseMatch[1];
        const course = db.getCourseById(courseId);
        if (!course) {
          return sendJson(res, 404, { success: false, error: 'Course not found' });
        }
        return sendJson(res, 200, { success: true, course });
      }

      // 3. GET /api/user/state
      if (pathname === '/api/user/state' && method === 'GET') {
        const state = db.getUserState();
        return sendJson(res, 200, { success: true, state });
      }

      // 4. POST /api/user/profile
      if (pathname === '/api/user/profile' && method === 'POST') {
        const body = await parseJsonBody(req);
        const updated = db.updateUserProfile(body);
        return sendJson(res, 200, { success: true, user: updated });
      }

      // 5. POST /api/courses/:id/enroll
      const enrollMatch = pathname.match(/^\/api\/courses\/([a-zA-Z0-9_-]+)\/enroll$/);
      if (enrollMatch && method === 'POST') {
        const courseId = enrollMatch[1];
        const state = db.enrollCourse(courseId);
        return sendJson(res, 200, { success: true, state });
      }

      // 6. POST /api/progress/lesson
      if (pathname === '/api/progress/lesson' && method === 'POST') {
        const body = await parseJsonBody(req);
        if (!body.courseId || !body.lessonId) {
          return sendJson(res, 400, { success: false, error: 'Missing courseId or lessonId' });
        }
        const progress = db.completeLesson(body.courseId, body.lessonId);
        return sendJson(res, 200, { success: true, progress });
      }

      // 7. POST /api/quiz/submit
      if (pathname === '/api/quiz/submit' && method === 'POST') {
        const body = await parseJsonBody(req);
        if (!body.courseId || !body.answers) {
          return sendJson(res, 400, { success: false, error: 'Missing courseId or answers' });
        }
        const attempt = db.submitQuiz(body.courseId, body.answers);
        return sendJson(res, 200, { success: true, attempt });
      }

      // 8. POST /api/certificates/issue
      if (pathname === '/api/certificates/issue' && method === 'POST') {
        const body = await parseJsonBody(req);
        if (!body.courseId) {
          return sendJson(res, 400, { success: false, error: 'Missing courseId' });
        }
        const certificate = db.issueCertificate(body.courseId, body.recipientName);
        return sendJson(res, 200, { success: true, certificate });
      }

      // 9. GET /api/certificates/verify/:id
      const verifyMatch = pathname.match(/^\/api\/certificates\/verify\/([a-zA-Z0-9_-]+)$/);
      if (verifyMatch && method === 'GET') {
        const certId = verifyMatch[1];
        const result = db.verifyCertificate(certId);
        return sendJson(res, result.valid ? 200 : 404, result);
      }

      // 10. POST /api/sandbox/execute
      if (pathname === '/api/sandbox/execute' && method === 'POST') {
        const body = await parseJsonBody(req);
        const code = body.code || '';
        
        // Safe evaluation simulation
        const logs = [];
        try {
          const fakeConsole = {
            log: (...args) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
            error: (...args) => logs.push('[ERROR] ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
            warn: (...args) => logs.push('[WARN] ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '))
          };

          const runFn = new Function('console', code);
          runFn(fakeConsole);

          return sendJson(res, 200, {
            success: true,
            output: logs.length > 0 ? logs.join('\n') : '(Code executed successfully with no output)'
          });
        } catch (execErr) {
          return sendJson(res, 200, {
            success: false,
            output: `Execution error: ${execErr.message}`
          });
        }
      }

      // Unmatched API endpoint
      return sendJson(res, 404, { success: false, error: 'API route not found' });
    } catch (apiErr) {
      console.error('API Error:', apiErr);
      return sendJson(res, 500, { success: false, error: apiErr.message });
    }
  }

  // --- STATIC FILES SERVING ---
  serveStatic(req, res, pathname);
});

server.listen(PORT, () => {
  console.log(`[DevPath LMS] Production server online at http://localhost:${PORT}`);
});
