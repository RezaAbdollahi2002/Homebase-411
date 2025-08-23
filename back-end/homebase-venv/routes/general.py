from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from twilio_client import send_otp, verify_otp

router = APIRouter(tags=["General"])

class PhoneRequest(BaseModel):
    phone: str

class OTPVerifyRequest(BaseModel):
    phone: str
    code: str

@router.post("/phone-signin")
def phone_signin(payload: PhoneRequest):
    status = send_otp(payload.phone)
    if status != "pending":
        raise HTTPException(status_code=400, detail="Failed to send OTP")
    return {"message": "OTP sent successfully"}

@router.post("/verify-otp")
def verify_code(payload: OTPVerifyRequest):
    status = verify_otp(payload.phone, payload.code)
    if status != "approved":
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    return {"message": "Phone number verified"}
