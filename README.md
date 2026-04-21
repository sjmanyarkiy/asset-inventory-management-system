# Asset Inventory Management System

A full-stack web application for managing organizational assets, departments, users, and maintenance/repair requests. The system supports role-based access control for administrators, managers, and staff.

---

## Features

* User authentication (Login/Register)
* Role-based access control (Admin, Manager, Staff)
* Asset management (create, update, delete, track assets)
* Department management
* Asset assignment to users or departments
* Repair and maintenance request system
* Approval workflow for managers/admins
* Search and filtering for assets and requests
* Responsive frontend dashboard

---

## Tech Stack

### Frontend

* React (Vite or Create React App)
* Axios for API requests
* React Router
* CSS / Tailwind (if used)

### Backend

* Python Flask
* Flask-JWT-Extended (Authentication)
* SQLAlchemy ORM
* PostgreSQL / SQLite (depending on environment)
* Flask-CORS

### Deployment

* Frontend: Vercel
* Backend: Render

---

## Project Structure

```
asset-inventory/
│
├── backend/
│   ├── app/
│   ├── models/
│   ├── routes/
│   ├── config/
│   ├── factory.py
│   ├── wsgi.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── package.json
│
└── README.md
```

---

## Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-username/asset-inventory.git
cd asset-inventory
```

---

### 2. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

pip install -r requirements.txt
```

### Set environment variables

Create a `.env` file:

```
FLASK_APP=app
FLASK_ENV=development
DATABASE_URL=your_database_url
JWT_SECRET_KEY=your_secret_key
```

### Run backend

```bash
flask run
```

or (production)

```bash
gunicorn wsgi:app
```

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## API Endpoints (Examples)

### Authentication

* POST `/api/auth/register`
* POST `/api/auth/login`

### Assets

* GET `/api/assets`
* POST `/api/assets`
* PUT `/api/assets/<id>`
* DELETE `/api/assets/<id>`

### Departments

* GET `/api/departments`
* POST `/api/departments`

### Requests

* GET `/api/requests`
* POST `/api/requests`
* PUT `/api/requests/<id>/approve`
* PUT `/api/requests/<id>/reject`

---

## Common Issues

### CORS Errors

Ensure backend CORS is configured properly:

```python
from flask_cors import CORS
CORS(app, origins=["http://localhost:5173", "https://your-frontend-url"])
```

---

### 500 Internal Server Errors

Check:

* Database connection
* Missing migrations
* Environment variables
* Logs on Render/terminal

---

## Deployment

### Backend (Render)

* Build Command: `pip install -r requirements.txt`
* Start Command: `gunicorn wsgi:app`

### Frontend (Vercel)

* Build Command: `npm run build`
* Output Directory: `dist`

---

## Future Improvements

* Advanced analytics dashboard
* Email notifications for approvals
* QR code tagging for assets
* Audit logs for all system actions
* Mobile application version

---

## License

This project is licensed under the MIT License.

---

## Live Links

* Frontend (Live App): [https://asset-inventory-management-system.vercel.app](https://asset-inventory-management-system.vercel.app)
* Backend (API Base URL): [https://assetflow-asset-inventory-management.onrender.com](https://assetflow-asset-inventory-management.onrender.com)

## Author

Developed by Group 4
