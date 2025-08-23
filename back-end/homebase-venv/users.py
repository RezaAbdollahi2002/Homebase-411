import asyncio
from urllib import request
import auth
from asyncio.windows_events import NULL
from enum import CONFORM
from logging import config
from click import confirm
from fastapi import APIRouter,Request, Depends, Form, HTTPException, Query, status, UploadFile, File
from fastapi.responses import JSONResponse
from pydantic import ValidationError
from sqlalchemy.orm import Session,joinedload
from uvicorn import Config
from auth import get_password_hash
import models, schemas
from auth import authenticate_user, create_access_token
from database import get_db
from auth import send_otp
from auth import verify_otp, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES,get_current_employee
from datetime import  date, datetime, timedelta
from typing import Optional
import os
from fastapi import FastAPI, Depends, BackgroundTasks
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from pydantic import BaseModel, EmailStr
from dotenv import load_dotenv
import random
# routers/email_router.py
import random
import asyncio
from datetime import datetime, timedelta
from fastapi import APIRouter, BackgroundTasks, HTTPException
from pydantic import BaseModel
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig

router = APIRouter()


    







