# auth.py
from datetime import datetime, timedelta
from typing import Optional
from twilio.rest import Client
import random

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

import models, schemas
from database import get_db

# Security configuration
SECRET_KEY = "your-secret-key"  # Change this in production!
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Twilio credentials (replace with environment variables in production)
TWILIO_ACCOUNT_SID = "your_account_sid"
TWILIO_AUTH_TOKEN = "your_auth_token"
TWILIO_PHONE_NUMBER = "+1234567890"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="signin")

# In-memory store for OTPs (use Redis in production)
otp_store = {}

def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str):
    return pwd_context.hash(password)

def authenticate_user(db: Session, username: str, password: str):
    user = db.query(models.Employer).filter(models.Employer.username == username).first()
    if not user:
        user = db.query(models.Employee).filter(models.Employee.username == username).first()
        if not user:
            return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_active_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(models.EmployeeAccount).filter(models.EmployeeAccount.username == username).first()
    if not user:
        user = db.query(models.EmployerAccount).filter(models.EmployerAccount.username == username).first()
        if not user:
            raise credentials_exception
    return user

# Send OTP
def send_otp(phone_number: str):
    otp = str(random.randint(100000, 999999))
    otp_store[phone_number] = {
        "otp": otp,
        "expires": datetime.utcnow() + timedelta(minutes=5)
    }

    client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
    client.messages.create(
        body=f"Your verification code is: {otp}",
        from_=TWILIO_PHONE_NUMBER,
        to=phone_number
    )
    return True

# Verify OTP
def verify_otp(phone_number: str, otp_input: str):
    record = otp_store.get(phone_number)
    if not record or record["otp"] != otp_input:
        return False
    if datetime.utcnow() > record["expires"]:
        del otp_store[phone_number]
        return False
    del otp_store[phone_number]  # One-time use
    return True
def get_current_employee(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> models.Employee:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    employee = db.query(models.Employee).filter(models.Employee.username == username).first()
    if employee is None:
        raise credentials_exception
    return employee