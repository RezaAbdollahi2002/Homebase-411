# routes/auth_routes.py
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import timedelta

from auth import send_otp, verify_otp, create_access_token
from database import get_db
import models

router = APIRouter()

ACCESS_TOKEN_EXPIRE_MINUTES = 30

class PhoneRequest(BaseModel):
    phone_number: str

class OTPLoginRequest(BaseModel):
    phone_number: str
    otp: str

@router.post("/send-otp")
def send_otp_route(request: PhoneRequest):
    try:
        send_otp(request.phone_number)
        return {"message": "OTP sent successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to send OTP")

@router.post("/signin-phone")
def signin_with_otp(request: OTPLoginRequest, db: Session = Depends(get_db)):
    if not verify_otp(request.phone_number, request.otp):
        raise HTTPException(status_code=401, detail="Invalid or expired OTP")

    # Look up user by phone number in Employee and Employer
    user = db.query(models.Employee).filter(models.Employee.phone_number == request.phone_number).first()
    if not user:
        user = db.query(models.Employer).filter(models.Employer.phone_number == request.phone_number).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

    access_token = create_access_token(
        data={"sub": user.username},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer"}
