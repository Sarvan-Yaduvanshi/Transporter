# 🚚 Transporter

[![React Version](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=white&style=flat-square)](https://react.dev/)
[![Node Version](https://img.shields.io/badge/Node.js-18.x+-339933?logo=node.js&logoColor=white&style=flat-square)](https://nodejs.org/)
[![MongoDB Mongoose](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white&style=flat-square)](https://mongoosejs.com/)
[![Firebase Admin](https://img.shields.io/badge/Firebase-Admin_SDK-FFCA28?logo=firebase&logoColor=white&style=flat-square)](https://firebase.google.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

**Transporter** is an enterprise-grade full-stack logistics and fleet management application designed to bridge the gap between drivers, dispatcher desks, and terminal operators. Built on the modern **MERN stack**, Transporter features multi-provider secure authentication, real-time-capable truck state transitions, permit-based cargo load tracking, and highly responsive user interfaces.

---

## 📖 Table of Contents

- [Core Features](#-core-features)
- [Tech Stack](#-tech-stack)
- [Architecture & Folder Structure](#-architecture--folder-structure)
- [Database Models](#%EF%B8%8F-database-models)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation & Set Up](#installation--set-up)
  - [Running the Project](#running-the-project)
- [API Reference](#-api-reference)
  - [Authentication Endpoint](#authentication-endpoint)
  - [Truck Fleet Endpoint](#truck-fleet-endpoint)
  - [Loads Endpoint](#loads-endpoint)
- [Security & Best Practices](#-security--best-practices)
- [License](#-license)

---

## ⚡ Core Features

### 🛡️ Secure Multi-Provider Authentication
- **Local Credentials**: Traditional sign-up and login with cryptographically hashed passwords (using bcrypt) and structured validation regex.
- **Firebase OAuth**: Seamless, secure sign-in via **Google** and **Facebook** powered by Firebase SDKs and verified using Firebase ID tokens on the Node.js backend.
- **SMS / Phone OTP System**: Temporary one-time passcode generation (6-digit PIN) with an expiration window for quick driver login, with custom development environments console outputs.
- **Custom Profiles**: Flexible nickname support, along with customizable profile avatars and header banners.

### 🚛 Truck Fleet & Operator Management
- **Full Fleet CRUD**: Live truck logging (truck number, owner, driver, status).
- **Status State-Machine**: Track active statuses such as `Available`, `Out of Service`, or `In Transit`.
- **Availability Windows**: Specify scheduling availability blocks to automate load dispatch planning.

### 📦 Load & Permit Tracking
- **Lifecycle Pipeline**: Assign loads to active permits and designated transport vehicles.
- **Dynamic Stages**: Manage shipment progression stages and trigger alerts (flag status) for delay issues.
- **Full History**: Retrieve completed cargo pipelines for analytics or driver settlement history.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React.js (Scaffolded using Vite for optimal build times)
- **Styling**: Tailwind CSS & Vanilla CSS (Dynamic layouts, responsive sidebars, custom modals)
- **State & Routing**: React Router DOM, Custom Context Hooks (`useAuth` provider)
- **API Client**: Axios with interceptor capabilities
- **Third-party integrations**: Firebase Client Web SDK

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB via Mongoose ODM
- **Authentication Services**: Firebase Admin SDK
- **Security**: CORS, helmet protection, bcrypt

---

## 📂 Architecture & Folder Structure

```text
Transporter/
├── backend/
│   ├── src/
│   │   ├── config/             # Firebase Admin init & DB configuration
│   │   ├── controllers/        # Express Route Handlers (Auth, Trucks, Loads)
│   │   ├── middleware/         # Auth guards, async error handlers, standard loggers
│   │   ├── models/             # Mongoose Schemas (User, Truck, Load, Otp)
│   │   └── routes/             # REST APIs routing endpoints
│   ├── .env.example            # Backend environmental configuration template
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/         # Shared UI components (LoadFormModal, TruckFormModal)
│   │   ├── config/             # Firebase Client credentials and setup
│   │   ├── hooks/              # Custom context hooks (useAuth.jsx)
│   │   ├── pages/              # Primary views (LoginPage, SignupPage, Dashboard)
│   │   ├── services/           # Axios API services mapping
│   │   └── transporter/        # Responsive Driver/Transporter specialized menus
│   ├── .env.example            # Frontend environmental configuration template
│   └── package.json
│
├── start.bat                   # Automation batch script to spin up frontend and backend
└── README.md
```

---

## 🗄️ Database Models

### User Schema (`User.js`)
- `name` / `email` / `password` (hashed)
- `phone` / `nickname`
- `role`: (`Driver` | `Dispatcher` | `Admin`)
- `avatar` / `banner`
- `provider`: (`local` | `google` | `facebook` | `phone`)
- `firebaseUid` / `facebookId`

### Truck Schema (`Truck.js`)
- `truckNumber` (unique primary identifier)
- `owner` / `driver`
- `status`: (`Available` | `In Transit` | `Out of Service` | `Under Maintenance`)
- `availabilityWindow` (timeframes)

### Load Schema (`Load.js`)
- `loadId` (unique primary identifier)
- `permitNumber`
- `truckNumber` (reference identifier)
- `currentStage` (numerical tracking status)
- `hasFlag` (boolean for issues)

---

## 🚀 Getting Started

### Prerequisites
Make sure you have the following installed on your machine:
- **Node.js** (v18.x or later)
- **npm** (v9.x or later)
- **MongoDB** (local server running on `mongodb://127.0.0.1:27017` or a MongoDB Atlas URI)

### Installation & Set Up

#### 1. Clone the repository
```bash
git clone https://github.com/Sarvan-Yaduvanshi/Transporter.git
cd Transporter
```

#### 2. Configure the Backend
Navigate to the `/backend` directory:
```bash
cd backend
npm install
```
Create a `.env` file based on `.env.example`:
```ini
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/transporter_ops
NODE_ENV=development
```
**Firebase Admin Setup**: 
To support Google Sign-In, place your Firebase service account credential JSON file inside `backend/src/config/` and name it `serviceAccountKey.json`. Ensure the service account has appropriate Firebase Auth permissions.

#### 3. Configure the Frontend
Navigate to the `/frontend` directory:
```bash
cd ../frontend
npm install
```
Create a `.env` file based on `.env.example`:
```ini
VITE_API_URL=http://localhost:5001/api
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id
VITE_FACEBOOK_APP_ID=your-facebook-app-id
```

---

### Running the Project

#### Windows Users (One-Click Launch)
You can run the interactive batch script located in the root directory to spin up both servers in parallel:
```bash
./start.bat
```

#### Manual Run (Command Line)
To spin up both services individually:

1. **Start MongoDB** (if local, ensure the service is running).
2. **Start Backend Server**:
   ```bash
   cd backend
   npm run dev
   ```
   *(Running on [http://localhost:5001](http://localhost:5001))*
3. **Start Frontend Client**:
   ```bash
   cd frontend
   npm run dev
   ```
   *(Running on [http://localhost:5173](http://localhost:5173))*

---

## 🔌 API Reference

### Authentication Endpoint

| Endpoint | Method | Description | Access |
| :--- | :--- | :--- | :--- |
| `/api/auth/signup` | `POST` | Registers a new driver profile | Public |
| `/api/auth/login` | `POST` | Standard local credentials validation | Public |
| `/api/auth/google` | `POST` | Verify Firebase ID Token & signs in user | Public |
| `/api/auth/facebook` | `POST` | Create or authorize profile via Facebook | Public |
| `/api/auth/send-otp` | `POST` | Generates a 6-digit phone OTP token | Public |
| `/api/auth/verify-otp`| `POST` | Verifies phone OTP and returns credentials| Public |
| `/api/auth/me` | `GET` | Retrieve logged-in session context | Private |
| `/api/auth/profile` | `PUT` | Updates nickname, avatar, or banner files | Private |

### Truck Fleet Endpoint

| Endpoint | Method | Description | Access |
| :--- | :--- | :--- | :--- |
| `/api/trucks` | `GET` | Fetches list of all fleet trucks | Private |
| `/api/trucks/approved` | `GET` | Fetches available active fleet trucks | Private |
| `/api/trucks/:truckNumber`| `GET` | Returns details of a specific truck | Private |
| `/api/trucks` | `POST` | Creates a new vehicle record | Private |
| `/api/trucks/:truckNumber`| `PUT` | Updates driver, owner, or status | Private |
| `/api/trucks/:truckNumber`| `DELETE` | Removes vehicle from active registry | Private |

### Loads Endpoint

| Endpoint | Method | Description | Access |
| :--- | :--- | :--- | :--- |
| `/api/loads` | `GET` | Fetches lists of active shipment loads | Private |
| `/api/loads/:loadId` | `GET` | Fetches single load trace record | Private |
| `/api/loads` | `POST` | Generates new permit loading record | Private |
| `/api/loads/:loadId` | `PUT` | Updates permit loading stage and flag alerts| Private |
| `/api/loads/:loadId` | `DELETE` | Deletes permit loading record from log | Private |

---

## 🔒 Security & Best Practices
- **Credential Segregation**: All backend configurations, database connection strings, and Google/Facebook developer secrets are managed strictly through `.env` configurations.
- **Firebase Private Keys Protected**: The highly sensitive file `serviceAccountKey.json` is explicitly protected and excluded from source control index.
- **Input Validation**: Custom validation layers protect database creation routes, shielding the server from malformed injection strings.

---

## 📄 License
This project is licensed under the [MIT License](LICENSE) - see the LICENSE file for details.

---
*Created by [Sarvan Yaduvanshi](https://github.com/Sarvan-Yaduvanshi) - Built for seamless, high-performance fleet operations.*