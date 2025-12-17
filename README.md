# Live Polling System | Intervue.io Assignment

A real-time interactive polling system built for teachers and students with live results, chat functionality, and student management.

## 🚀 Features

### Must-Have Features ✅
- **Teacher Dashboard**: Create polls with configurable time limits (30s, 60s, 90s, 2min)
- **Student Interface**: Join with unique names and submit answers
- **Real-time Results**: Live poll results with interactive charts
- **Timer System**: Countdown timer with automatic poll closure
- **Conditional Logic**: Teacher can only ask new questions when all students have answered or timer expires

### Good-to-Have Features ✅
- **Configurable Time Limits**: Teachers can set custom poll duration
- **Remove Students**: Teachers can kick out students from active sessions
- **Responsive Design**: Works on desktop, tablet, and mobile devices

### Bonus Features ✅
- **Chat System**: Real-time messaging between teachers and students
- **Poll History**: View past poll results and statistics
- **Student Management**: Live participant list with status indicators

## 🛠️ Tech Stack

### Frontend
- **React** with Vite
- **Redux Toolkit** for state management
- **React Router** for navigation
- **Socket.IO Client** for real-time communication
- **Recharts** for data visualization
- **Lucide React** for icons

### Backend
- **Node.js** with Express
- **Socket.IO** for WebSocket connections
- **ES Modules** for modern JavaScript

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/anand2026/INTERVUE_IO_Assignment.git
   cd INTERVUE_IO_Assignment
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Variables**
   
   Create `.env` in the `backend` directory:
   ```env
   PORT=5000
   FRONTEND_URL=http://localhost:5173
   ```
   
   Create `.env` in the `frontend` directory:
   ```env
   VITE_BACKEND_URL=http://localhost:5000
   ```

## 🚀 Running the Application

### Development Mode

1. **Start Backend Server**
   ```bash
   cd backend
   npm run dev
   ```
   Backend runs on: `http://localhost:5000`

2. **Start Frontend (in new terminal)**
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend runs on: `http://localhost:5173`

3. **Access the Application**
   - Open `http://localhost:5173` in your browser
   - Select your role (Teacher or Student)
   - Start polling!

## 📖 Usage Guide

### For Teachers
1. Navigate to `http://localhost:5173`
2. Select "I'm a Teacher"
3. Create a poll with your question and options
4. Select time limit (30s, 60s, 90s, or 2min)
5. Mark the correct answer (optional)
6. Click "Ask Question"
7. View live results as students answer
8. Use Chat and Participants tabs for interaction

### For Students
1. Navigate to `http://localhost:5173`
2. Select "I'm a Student"
3. Enter your unique name
4. Wait for teacher to create a poll
5. Select your answer
6. Click "Submit"
7. View results after submission

## 🏗️ Project Structure

```
INTERVUE_IO_Assignment/
├── backend/
│   ├── server.js           # Express server setup
│   ├── socketHandlers.js   # Socket.IO event handlers
│   ├── pollManager.js      # Poll business logic
│   ├── chatManager.js      # Chat functionality
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── store/          # Redux store
│   │   └── App.jsx
│   └── package.json
└── README.md
```

## 🎨 UI/UX Features

- Modern, clean interface matching Figma designs
- Smooth animations and transitions
- Real-time updates without page refresh
- Responsive layout for all screen sizes
- Accessibility-friendly components

## 🔧 Key Technical Decisions

- **Socket.IO**: Chosen for reliable real-time bidirectional communication
- **Redux Toolkit**: Simplified state management with less boilerplate
- **Recharts**: Lightweight and customizable chart library
- **ES Modules**: Modern JavaScript modules for better tree-shaking
- **Separation of Concerns**: Clean architecture with separate managers for polls and chat

## 📝 Assignment Compliance

This project fulfills all requirements for the Intervue.io SDE Intern Assignment:

- ✅ All must-have features implemented
- ✅ Good-to-have features included
- ✅ Bonus features (Chat & Poll History) working
- ✅ UI matches Figma designs exactly
- ✅ Clean, maintainable code architecture
- ✅ Ready for deployment

## 🚀 Deployment

Refer to `deployment_guide.md` for detailed deployment instructions for Render (backend) and Vercel (frontend).

## 👤 Author

**Anand Singh**
- GitHub: [@anand2026](https://github.com/anand2026)
- Assignment: Intervue.io SDE Intern - Round 1

## 📄 License

This project was created as part of the Intervue.io interview process.
