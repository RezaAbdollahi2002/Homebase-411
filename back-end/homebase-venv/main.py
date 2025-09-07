from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from typing import List
import os
from dotenv import load_dotenv

from routes.employee import router as employee_router
from routes.employer import router as employer_router
from routes.company import router as company_router
from routes.announcements import router as announcements_router
from routes.availabilities import router as availabilities_router
from routes.signin import router as signin_router
from routes.chat import router as chat_router
# from availabilities import router as availabilities_router
from routers.email_router import router as email_router, start_cleanup_task
from routers.sms_router import router as sms_router
import models
from routes.shifts import router as shifts_router
from database import engine
from routes.check import router as check_router
from routes.team import router as team_router

# Load environment variables
load_dotenv()

app = FastAPI()

# CORS configuration
origins = ["http://localhost:5173", "http://localhost:5174"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables
models.Base.metadata.create_all(bind=engine)

# Static / Uploads
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")
app.mount("/static", StaticFiles(directory="static"), name="static")

# Include API routers
app.include_router(employee_router)
app.include_router(employer_router)
app.include_router(company_router)
app.include_router(signin_router)
app.include_router(chat_router)
app.include_router(email_router)
app.include_router(sms_router)
app.include_router(shifts_router)
app.include_router(check_router)
app.include_router(team_router)
app.include_router(availabilities_router)
app.include_router(announcements_router)

app.include_router(availabilities_router)  # Fixed typo

# WebSocket connections
connections: dict[int, List[WebSocket]] = {}

# Startup event
@app.on_event("startup")
async def startup_event():
    start_cleanup_task()
