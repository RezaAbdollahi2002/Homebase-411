from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from twilio.rest import Client
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

# Twilio client
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
VERIFY_SERVICE_SID = os.getenv("TWILIO_VERIFY_SERVICE_SID")

client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

# Schemas
class PhoneSchema(BaseModel):
    phone_number: str  # in E.164 format, e.g. +14155552671

class VerifySMS(BaseModel):
    phone_number: str
    code: str

# Send SMS OTP
@router.post("/send-sms-otp/", tags=["SMS"])
async def send_sms_otp(data: PhoneSchema):
    try:
        verification = client.verify.services(VERIFY_SERVICE_SID).verifications.create(
            to=data.phone_number,
            channel="sms"
        )
        return {"message": f"OTP sent to {data.phone_number}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Verify SMS OTP
@router.post("/verify-sms-otp/", tags=["SMS"])
async def verify_sms_otp(data: VerifySMS):
    try:
        verification_check = client.verify.services(VERIFY_SERVICE_SID).verification_checks.create(
            to=data.phone_number,
            code=data.code
        )
        if verification_check.status == "approved":
            return {"message": "Phone number verified successfully"}
        return {"message": "Invalid OTP"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
