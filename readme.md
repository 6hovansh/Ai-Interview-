Interview AI
An AI-powered interview preparation platform that analyzes your resume and job description to generate personalized interview reports, practice questions, and an optimized resume tailored to the specific role.

Stack
Languages: JavaScript (Node.js backend, React frontend)
Framework / runtime: Express.js 5.2 (backend), React 19 + Vite (frontend)
Notable libraries: Google GenAI (Gemini 3 Flash for AI analysis), Mongoose (MongoDB), Puppeteer (PDF generation), Zod (schema validation), JWT + bcryptjs (authentication)
How it's organized
Code
Backend/
  src/
    app.js              Express app setup with CORS and routes
    server.js           Server entry point, connects to MongoDB
    config/
      database.js       MongoDB connection configuration
    controllers/
      auth.controller.js        User registration, login, logout, profile
      interview.controller.js   Interview report generation and retrieval
    models/
      user.model.js             User schema (username, email, password)
      interviewReport.model.js  Interview results with questions and advice
      blacklist.model.js        Token blacklist for logout
    routes/
      auth.routes.js    /api/auth endpoints
      interview.routes.js  /api/interview endpoints
    services/
      ai.service.js     Google GenAI integration for reports
    middlewares/
      auth.middleware.js  JWT verification and token blacklist check
      file.middleware.js  Multer for PDF file uploads

Frontend/
  src/
    app.routes.jsx      React Router configuration
    App.jsx             Root component
    main.jsx            Entry point
    features/
      auth/             Login, Register, Protected route wrapper
      interview/        Home page (list reports), Interview detail page
    style/              Global and component styles
How it fits together: User registers/logs in via the auth controller, which issues a JWT token stored in cookies. The frontend's Protected component verifies this token before rendering protected routes. On the home page, users submit a PDF resume, self-description, and job description. The interview controller receives the PDF via Multer, extracts text with pdf-parse, sends it to Google's Gemini AI (ai.service.js), and stores the structured report (technical questions, behavioral questions, skill gaps, prep plan) in MongoDB. Users can then view the report details and download an AI-generated, tailored resume as a PDF.