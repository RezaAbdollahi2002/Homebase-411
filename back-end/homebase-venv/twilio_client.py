import os
from twilio.rest import Client
from dotenv import load_dotenv

load_dotenv()  # Load .env

account_sid = os.getenv("TWILIO_ACCOUNT_SID")
auth_token = os.getenv("TWILIO_AUTH_TOKEN")
verify_sid = os.getenv("TWILIO_VERIFY_SERVICE_SID")

client = Client(account_sid, auth_token)

def send_otp(phone_number: str):
    verification = client.verify.v2.services(verify_sid) \
        .verifications \
        .create(to=phone_number, channel='sms')
    return verification.status

def verify_otp(phone_number: str, code: str):
    verification_check = client.verify.v2.services(verify_sid) \
        .verification_checks \
        .create(to=phone_number, code=code)
    return verification_check.status
