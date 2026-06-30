# Thesis Project Setup and Run Guide

## Overview of CVD Care

CVD Care is a web-based application that helps users predict their cardiovascular disease risk and provides personalized lifestyle recommendations based on their risk factors, enabling them to monitor their cardiovascular health more easily at home. The system consists of three services: a React frontend, a Node.js/Express backend and a FastAPI machine learning service. User data and prediction history are stored in MongoDB Atlas.

**Main Technologies:**

- Node.js v24.11.1
- React v18 with TanStack Query v4, Tailwind CSS, DaisyUI
- Express.js
- Python v3.14.3
- FastAPI (ML microservice)
- MongoDB Atlas

## Prerequisites

Ensure the following software is installed before running the project:

1. Node.js v24.11.1 or compatible version - Download: https://nodejs.org
2. npm (included with Node.js)
3. Python 3.14.3 or compatible version - Download: https://www.python.org
4. pip (included with Python)
5. Git - Download: https://git-scm.com

### Project Structure

```
CVDCare/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── lib/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── server.js
│   ├── .env.example
│   ├── package.json
│   └── seedAdmin.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
│
├── ml_backend/
│   ├── app.py
│   ├── decision_tree_model.pkl
│   ├── clip_bounds.pkl
│   ├── requirements.txt
│   └── .env.example
│
├── .gitignore
└── README.md
```

## Cloning the Repository

Open a terminal and run:

```bash
git clone https://github.com/baochammm/CVDCare.git
cd CVDCare
```

Or open a terminal in the project root folder.

Example:

```
C:\Users\Bao Tram\OneDrive\Desktop\CVDCare
```

## Installation Steps

Each service must be installed separately.

**1. Frontend**

```bash
cd frontend
npm install
```

**2. Backend**

```bash
cd backend
npm install
```

**3. ML Backend**

```bash
cd ml_backend
pip install -r requirements.txt
```

## Environment Configuration

Each service requires its own `.env` file.

### 1. Backend (`.env`)

Navigate to the backend folder and copy the example file:

```bash
cp .env.example .env
```

Open `.env` and fill in the required values:

```env
PORT=5001
MONGO_URI=your_mongodb_atlas_connection_string
ML_BACKEND_URL=http://localhost:8000
JWT_SECRET_KEY=your_jwt_secret_key
NODE_ENV=development
GEOAPIFY_API_KEY=your_geoapify_api_key
```

**Notes:**

- `MONGO_URI`: Get this from your MongoDB Atlas cluster. Go to **Atlas > Connect > Drivers** and copy the connection string. Replace `<password>` with your database user password.
- `GEOAPIFY_API_KEY`: Used for the Recommended Hospitals feature. Get a free API key at https://www.geoapify.com
- `JWT_SECRET_KEY`: Any long random string, used to sign JWT tokens.

### 2. ML Backend (`.env`)

Navigate to the `ml_backend` folder and copy the example file:

```bash
cp .env.example .env
```

Open `.env` and fill in:

```env
FRONTEND_URL=http://localhost:5173
```

> **Note:** This must match the URL where the frontend is running to allow CORS requests.

## Database Setup (MongoDB Atlas)

1. Go to https://www.mongodb.com/atlas and log in or create an account.
2. Create a new cluster.
3. Under **Network Access**, add your current IP address.
4. Under **Database Access**, create a database user with read/write permissions.
5. Click **Connect > Drivers**, copy the connection string and paste it into `MONGO_URI` in the backend `.env` file.

## Seeding the Admin Account

Before running the application, an admin account must be created in the database. This is required to access the Admin Dashboard.

1. Make sure the backend `.env` file is configured with a valid `MONGO_URI`.
2. Navigate to the backend folder and run:

```bash
cd backend
node seedAdmin.js
```

Expected output:

```
MongoDB connected
Admin seeded successfully!
```

3. Default admin credentials:

| Field     | Value                  |
| --------- | ---------------------- |
| User Name | admincvdcare           |
| Email     | admincvdcare@gmail.com |
| Password  | 12345678               |

> **Note:** This script only runs once. If an admin account already exists in the database, the script will skip seeding and print `"Admin already exists"`.

## Running the Project

Open three separate terminal windows and run each service:

**Terminal 1 - ML Backend:**

```bash
cd ml_backend
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

Expected output:

```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

**Terminal 2 - Backend:**

```bash
cd backend
npm run dev
```

Expected output:

```
Server is running on port 5001
```

**Terminal 3 - Frontend:**

```bash
cd frontend
npm run dev
```

Expected output:

```
VITE v... ready in ... ms
Local: http://localhost:5173
```

Open the application in a browser:

```
http://localhost:5173
```

## Pretrained Model

The pretrained model files are included in the `ml_backend/` directory:

- `decision_tree_model.pkl` - Trained Decision Tree classifier
- `clip_bounds.pkl` - IQR clip bounds fitted on training data

No retraining is required to run the application.

## Model Training

If you wish to retrain the model from scratch, Google Colab notebooks are provided in the `experiments` folder.

**Steps:**

1. Open the notebook in Google Colab.
2. Upload the dataset from Kaggle: https://www.kaggle.com/datasets/sulianova/cardiovascular-disease-dataset
3. Run all cells in order. The `experiments` folder contains 5 notebooks for the experiment comparisons and 1 separate notebook dedicated to tuning and exporting the final Decision Tree model (`decision_tree_model.pkl` and `clip_bounds.pkl`).
4. Download the output files: `decision_tree_model.pkl` and `clip_bounds.pkl`
5. Replace the existing files in `ml_backend/` with the new ones.
