# Asset Inventory Management System

## 📌 Project Overview
The Asset Inventory Management System is a full-stack web application designed to help organizations efficiently track, manage, and maintain their assets. It centralizes asset data, streamlines request handling, and improves decision-making through role-based access and real-time updates.

---

## 🎯 Problem Statement
Organizations often rely on spreadsheets and manual processes to manage assets, leading to inefficiencies, data inconsistency, and difficulty in prioritizing repairs or new asset requests.

---

## 💡 Solution
This system provides:
- Centralized asset tracking
- Role-based access control
- Request and approval workflows
- Real-time status updates

---

## 👥 User Roles
- **Admin**: Full system access
- **Procurement Manager**: Manages assets and approves requests
- **Employee**: Requests assets or repairs

---

## 🚀 Features

### 🔐 Authentication
- JWT-based authentication
- Role-based authorization
- Email verification (2FA)

### 📦 Asset Management
- Add, update, delete assets
- Upload images (Cloudinary)
- Assign assets to employees
- Unique barcode generation

### 📨 Requests
- Request new asset or repair
- Track request status (Pending, Approved, Rejected)
- Manager approval system

### 📊 Dashboard
- Employee: View personal requests
- Manager: View and manage all requests
- Admin: Full system overview

---

## 🛠️ Tech Stack

### Frontend
- React.js
- Redux Toolkit
- Tailwind CSS

### Backend
- Python Flask
- PostgreSQL
- Flask-JWT-Extended

### Tools & Services
- Cloudinary (Image Upload)
- SendGrid (Emails)
- GitHub Actions (CI/CD)

---

## ⚙️ Installation Guide

### 1. Clone Repository
```bash
git clone <repo-url>
cd project-folder
```

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt
python run.py
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm start
```

---

## 🔐 Environment Variables

Create a `.env` file:

```
JWT_SECRET_KEY=your_secret
DATABASE_URL=your_postgres_url
CLOUDINARY_URL=your_cloudinary_url
SENDGRID_API_KEY=your_sendgrid_key
```

---

## 📡 API Endpoints

### Auth
- POST /api/register
- POST /api/login

### Assets
- GET /api/assets
- POST /api/assets

### Requests
- POST /api/requests
- GET /api/requests

---

## 🧪 Testing
- Backend: Pytest
- Frontend: Jest
- Minimum coverage: 60%+

---

## 🔄 CI/CD
- Automated testing
- Continuous deployment using GitHub Actions

---

## 📁 Project Structure
```
backend/
frontend/
tests/
```

---

## 📅 Timeline
- Week 1: Setup & Design
- Week 2-3: Development
- Week 4: Testing & Presentation

---

## 📌 Best Practices
- Use Gitflow workflow
- Write descriptive commits
- Review all pull requests
- Maintain clean and modular code

---

## 🚀 Future Improvements
- Mobile app (PWA)
- Advanced analytics dashboard
- Barcode scanner integration

---

## 👨‍💻 Author
Samuel Esapar Emanman

---

## 📄 License
This project is for educational purposes.
