import random
import asyncio
from datetime import datetime, timedelta
from fastapi import APIRouter, BackgroundTasks, HTTPException
from fastapi_mail import FastMail, MessageSchema
from pydantic import BaseModel
from email_config import conf

router = APIRouter()

# OTP storage
otp_store = {}
OTP_EXPIRATION_MINUTES = 5

# Schemas
class EmailSchema(BaseModel):
    email: str

class VerifySchema(BaseModel):
    email: str
    otp: str

# Send OTP
@router.post("/send-otp/", tags=["Email"])
async def send_otp(data: EmailSchema, background_tasks: BackgroundTasks):
    otp = str(random.randint(100000, 999999))
    expires_at = datetime.utcnow() + timedelta(minutes=OTP_EXPIRATION_MINUTES)
    otp_store[data.email] = {"otp": otp, "expires_at": expires_at}

    message = MessageSchema(
        subject="Your OTP Code",
        recipients=[data.email],
        body=f"Your OTP code is: {otp} (valid for {OTP_EXPIRATION_MINUTES} minutes)",
        subtype="plain"
    )

    fm = FastMail(conf)
    background_tasks.add_task(fm.send_message, message)

    print(f"OTP for {data.email}: {otp} (expires at {expires_at})")  # Debug
    return {"message": f"OTP sent to {data.email}"}

# Verify OTP (returns True/False)
@router.post("/verify-otp/", tags=["Email"])
async def verify_otp(data: VerifySchema):
    record = otp_store.get(data.email)
    if not record:
        return {"success": False, "message": "No OTP found for this email"}

    if datetime.utcnow() > record["expires_at"]:
        del otp_store[data.email]
        return {"success": False, "message": "OTP has expired"}

    if record["otp"] != data.otp:
        return {"success": False, "message": "Invalid OTP"}

    del otp_store[data.email]
    return {"success": True, "message": "OTP verified successfully"}
# Cleanup expired OTPs
async def cleanup_otps():
    while True:
        now = datetime.utcnow()
        expired_keys = [email for email, rec in otp_store.items() if rec["expires_at"] < now]
        for key in expired_keys:
            del otp_store[key]
        await asyncio.sleep(60)

def start_cleanup_task():
    asyncio.create_task(cleanup_otps())
