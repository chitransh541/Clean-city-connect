import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import complaintRoutes from './routes/complaints.js';

dotenv.config();

const app = express();

// Middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace(/\/$/, '') : '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'CleanCity API is running' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'CleanCity API is running' });
});

// Root Landing Page
app.get('/', (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>CleanCity Connect API</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
      <style>
        body {
          margin: 0;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          background-color: #f8fafc;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          text-align: center;
          color: #0f172a;
        }
        .logo {
          font-size: 5rem;
          margin-bottom: 1rem;
          animation: float 3s ease-in-out infinite;
        }
        h1 {
          font-size: 2.5rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
          color: #15803d;
        }
        p {
          font-size: 1.125rem;
          color: #475569;
          margin: 0 0 2rem 0;
          max-width: 500px;
          line-height: 1.6;
        }
        .btn {
          display: inline-block;
          background-color: #22c55e;
          color: white;
          padding: 0.875rem 2rem;
          border-radius: 9999px;
          text-decoration: none;
          font-weight: 600;
          font-size: 1.125rem;
          transition: all 0.2s ease;
          box-shadow: 0 4px 14px 0 rgba(34, 197, 94, 0.39);
        }
        .btn:hover {
          background-color: #16a34a;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px 0 rgba(34, 197, 94, 0.39);
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
      </style>
    </head>
    <body>
      <div class="logo">🌿</div>
      <h1>CleanCity Connect API</h1>
      <p>The backend service is running successfully. Head over to the frontend application to start making a difference.</p>
      <a href="${frontendUrl}" class="btn">Go to App</a>
    </body>
    </html>
  `);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
