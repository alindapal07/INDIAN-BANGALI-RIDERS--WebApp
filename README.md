
# 🏍️ Indian Bangali Riders (IBR) - Official Platform

Welcome to the heart of the **Indian Bangali Riders (IBR)** community! This is a dedicated platform built for riders who share a passion for exploration, brotherhood, and the open road. 

This repository contains the full-stack application that powers our community, including ride bookings, member dashboards, real-time chats, and AI-powered journey planning.

---

## 🌟 Key Features

### 👤 For Riders
- **Smart Authentication**: Secure login via Password or 6-digit MPIN.
- **Member Dashboard**: Track your personal activities, ride history, and membership status.
- **Live Feed & Stories**: Share your journey moments with the pack through posts and temporary stories.
- **Ride Bookings**: Join upcoming expeditions and manage your reservations effortlessly.
- **Real-time Connectivity**: Chat with fellow riders and receive instant notifications.
- **Multilingual Support**: Available in English, Hindi, Bengali, Marathi, and Kannada.

### 🛡️ For Admins
- **Membership Management**: Review and approve/reject new registration requests.
- **Content Moderation**: Manage posts, stories, and community guidelines.
- **Unified Analytics**: Get a birds-eye view of community growth and activity.
- **Secure 2FA Login**: Enhanced security for administrative actions.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React.js](https://reactjs.org/) (with [Vite](https://vitejs.dev/))
- **Styling**: Vanilla CSS & [Framer Motion](https://www.framer.com/motion/) for premium animations.
- **State Management**: React Context API.
- **Icons**: [Lucide React](https://lucide.dev/).
- **Internationalization**: [i18next](https://www.i18next.com/).

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/).
- **Database**: [MongoDB](https://www.mongodb.com/) (with Mongoose).
- **Security**: JWT Authentication, Bcrypt encryption, Helmet, and Rate Limiting.
- **Real-time**: [Socket.io](https://socket.io/).
- **AI Integration**: [Google Gemini AI](https://ai.google.dev/) for intelligent journey suggestions.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+ recommended)
- [MongoDB](https://www.mongodb.com/try/download/community) (Local or Atlas)
- A Google Gemini API Key (for AI features)

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd indian-bangali-riders
   ```

2. **Setup Backend**:
   ```bash
   cd backend
   npm install
   # Create a .env file based on the environment variables section below
   npm start
   ```

3. **Setup Frontend**:
   ```bash
   cd ../frontend
   npm install
   # Create a .env file (VITE_API_URL=http://localhost:5000/api)
   npm run dev
   ```

### 🔑 Environment Variables

Create a `.env` file in the `/backend` directory:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
GEMINI_API_KEY=your_google_gemini_api_key
PORT=5000
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
ADMIN_KEY=your_secure_admin_creation_code
```

---

## 🔒 Security Note
This project is configured with a strict `.gitignore` to ensure that sensitive files like `.env`, `node_modules`, and build artifacts are never pushed to public repositories. **Always use environment variables for keys and secrets.**

---

## 🤝 Community & Support
Ride safe, ride together. If you encounter any bugs or want to suggest features, please reach out to the IBR Dev Team.

**Developed with ❤️ for the Indian Bangali Riders Community.**
 06ee0a8 (feat: develop Indian Bangali Riders platform with modern UI, user interaction, and scalable architecture)
