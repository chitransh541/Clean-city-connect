# CleanCity Connect 🌱

CleanCity Connect is a comprehensive platform designed to bridge the gap between citizens and municipal authorities. It empowers users to seamlessly report waste and cleanliness issues in their community, automatically analyzes these reports using cutting-edge Vision AI, and incentivizes civic engagement through a gamified rewards system.

## 🚀 Key Features

*   **Multi-Media Issue Reporting**: Users can upload or directly capture photos and 30-second videos of civic issues.
*   **Vision AI Analysis**: Integrates Hugging Face's Inference API (`Qwen/Qwen2.5-VL-7B-Instruct`) to automatically analyze uploaded images, describe the scene, and suggest waste categories.
*   **Interactive Mapping**: Built with `react-leaflet`. Users can select precise locations on an interactive map or use their device's GPS. Address resolution is powered by OpenStreetMap's Nominatim API.
*   **Community Map View**: A dedicated public map view allowing users to see pending, resolved, and rejected requests across their city with dynamic filtering.
*   **Role-Based Dashboards**: 
    *   **Citizen Dashboard**: Track personal requests, view earned rewards, and raise new complaints.
    *   **Officer Dashboard**: Admin interface for municipal workers to review, resolve, or reject civic complaints with optional notes.
*   **Gamified Rewards**: Citizens are awarded 50 points whenever a reported issue is successfully resolved by an officer, fostering continuous community participation.
*   **Secure Authentication**: JWT-based secure login and signup with protected routing.
*   **Modern Aesthetics**: Built with vanilla CSS emphasizing smooth animations, responsive glassmorphism designs, and intuitive UX.

---

## 🛠 Tech Stack

**Frontend:**
*   React (via Vite)
*   React Router
*   React Leaflet & Leaflet.js
*   Zustand (State Management)
*   Vanilla CSS (BEM Architecture)

**Backend:**
*   Node.js & Express.js
*   PostgreSQL (`pg` pool)
*   JWT Auth (`jsonwebtoken`, `bcryptjs`)
*   Multer & Cloudinary (`multer-storage-cloudinary`)

**External Services:**
*   Cloudinary (Media Hosting)
*   Hugging Face Inference API (AI Image Analysis)
*   Twilio (SMS/OTP Services - built-in ready)
*   OpenStreetMap Nominatim (Reverse Geocoding)

---

## ⚙️ Local Setup & Installation

### Prerequisites
*   Node.js (v18+ recommended)
*   PostgreSQL installed and running
*   Cloudinary Account
*   Hugging Face Account (for Access Token)

### 1. Database Setup
Ensure PostgreSQL is running. Create a new database:
```sql
CREATE DATABASE cleancity;
```

Run the initialization script from the `server` directory to build the schema:
```bash
cd server
node init-db.js
```
*Note: This automatically creates a default officer account. (Phone: `1234567890`, Password: `officer123`)*

### 2. Backend Setup
1. Navigate to the `server` directory and install dependencies:
    ```bash
    cd server
    npm install
    ```
2. Create a `.env` file in the `server` directory using the following template:
    ```env
    # Database
    PGUSER=postgres
    PGPASSWORD=your_db_password
    PGHOST=localhost
    PGPORT=5432
    PGDATABASE=cleancity

    # Authentication
    JWT_SECRET=your_super_secret_jwt_key

    # Cloudinary
    CLOUDINARY_CLOUD_NAME=your_cloud_name
    CLOUDINARY_API_KEY=your_api_key
    CLOUDINARY_API_SECRET=your_api_secret

    # Hugging Face (Vision AI)
    HF_API_KEY=your_huggingface_access_token

    # Server Port
    PORT=5000
    ```
3. Start the backend development server:
    ```bash
    npm run dev
    ```

### 3. Frontend Setup
1. Navigate to the `client` directory and install dependencies:
    ```bash
    cd client
    npm install
    ```
2. Create a `.env` file in the `client` directory:
    ```env
    VITE_API_URL=http://localhost:5000/api
    ```
3. Start the Vite development server:
    ```bash
    npm run dev
    ```

### 4. Access the Application
*   **Client App**: `http://localhost:3000`
*   **Backend API**: `http://localhost:5000/api`

---

## 🔒 Default Accounts

To test the application out of the box, you can use the default admin/officer account initialized in the database script:
*   **Role**: Officer
*   **Phone**: `1234567890` *(Note: `+91` is automatically prefixed in the UI)*
*   **Password**: `officer123`

To test the citizen flow, simply use the "Sign Up" page on the frontend to create a new standard account.

---

## 📁 Project Structure

```text
cleancity-connect/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI elements (Modals, Cards, Maps)
│   │   ├── pages/          # Full page views (Home, Dashboards)
│   │   ├── store/          # Zustand auth store
│   │   ├── styles/         # Vanilla CSS modular stylesheets
│   │   └── utils/
│   └── .env                # Frontend environment variables
│
└── server/                 # Express Backend
    ├── src/
    │   ├── config/         # DB & Cloudinary configs
    │   ├── controllers/    # Route logic (Auth, Complaints)
    │   ├── middlewares/    # JWT & Role Guards
    │   ├── routes/         # Express routers
    │   └── services/       # External API integrations (HF Vision, Twilio)
    ├── .env                # Backend environment variables
    └── init-db.js          # Database migration & schema script
```
