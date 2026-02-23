from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import random
import string
import smtplib
import os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

import crud, schemas
from dependencies import get_db

router = APIRouter(prefix="/verify", tags=["verify"])

# In-memory OTP store: { key: { "otp": "123456", "expires": datetime } }
_otp_store: dict = {}

OTP_EXPIRY_MINUTES = 10

# ── SMTP settings (read from env) ─────────────────────────────────────────────
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
FROM_EMAIL = os.getenv("FROM_EMAIL", SMTP_USER)
FROM_NAME = os.getenv("FROM_NAME", "AKR Womens Clothing")


def _generate_otp() -> str:
    return "".join(random.choices(string.digits, k=6))


def _save_otp(key: str, otp: str):
    _otp_store[key] = {
        "otp": otp,
        "expires": datetime.utcnow() + timedelta(minutes=OTP_EXPIRY_MINUTES),
    }


def _validate_otp(key: str, otp: str) -> bool:
    record = _otp_store.get(key)
    if not record:
        return False
    if datetime.utcnow() > record["expires"]:
        del _otp_store[key]
        return False
    return record["otp"] == otp


def _send_email(to_email: str, subject: str, html_body: str):
    """Send email via Gmail SMTP. Falls back to console print if not configured."""
    if not SMTP_USER or not SMTP_PASSWORD or SMTP_USER == "your_gmail@gmail.com":
        print(f"\n[SMTP not configured] OTP email to {to_email}:\n{subject}\n")
        return

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"{FROM_NAME} <{FROM_EMAIL}>"
    msg["To"] = to_email
    msg.attach(MIMEText(html_body, "html"))

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.ehlo()
        server.starttls()
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.sendmail(FROM_EMAIL, to_email, msg.as_string())


def _otp_email_html(otp: str) -> str:
    return f"""
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;background:#fff8f0;border-radius:16px;border:1px solid #f3d2c1;">
        <h1 style="color:#e11d48;font-size:24px;margin-bottom:4px;">AKR Womens Clothing</h1>
        <p style="color:#555;font-size:14px;margin-top:0;">Verify your email address</p>
        <hr style="border:none;border-top:1px solid #ffe0d0;margin:16px 0;">
        <p style="color:#333;font-size:15px;">Your one-time verification code is:</p>
        <div style="letter-spacing:10px;font-size:40px;font-weight:bold;color:#e11d48;text-align:center;padding:24px 0;background:#fff5f7;border-radius:12px;margin:16px 0;">
            {otp}
        </div>
        <p style="color:#888;font-size:12px;">This code expires in {OTP_EXPIRY_MINUTES} minutes. Do not share it with anyone.</p>
        <p style="color:#888;font-size:12px;">If you didn't request this, please ignore this email.</p>
    </div>
    """


# ── Request / Response schemas ────────────────────────────────────────────────

class SendEmailOtpRequest(BaseModel):
    email: EmailStr

class SendPhoneOtpRequest(BaseModel):
    phone: str

class VerifyAndSignupRequest(BaseModel):
    email: EmailStr
    phone: str
    password: str
    email_otp: str
    phone_otp: str


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/send-email-otp")
def send_email_otp(req: SendEmailOtpRequest, db: Session = Depends(get_db)):
    """Generate and send an OTP to the user's email."""
    existing = crud.get_user_by_email(db, req.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    otp = _generate_otp()
    _save_otp(f"email:{req.email}", otp)

    try:
        _send_email(
            to_email=req.email,
            subject="Your AKR Verification Code",
            html_body=_otp_email_html(otp),
        )
    except Exception as e:
        print(f"[Email error] {e}")
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")

    return {"message": "Email OTP sent successfully"}


@router.post("/send-phone-otp")
def send_phone_otp(req: SendPhoneOtpRequest, db: Session = Depends(get_db)):
    """Generate OTP for phone (printed to console — swap in Twilio for real SMS)."""
    existing = crud.get_user_by_phone(db, req.phone)
    if existing:
        raise HTTPException(status_code=400, detail="Phone number already registered")

    otp = _generate_otp()
    _save_otp(f"phone:{req.phone}", otp)

    # ── Replace below with Twilio/MSG91 for real SMS ─────────────────────────
    print(f"\n{'='*50}")
    print(f"  SMS OTP for {req.phone}: {otp}")
    print(f"  (expires in {OTP_EXPIRY_MINUTES} minutes)")
    print(f"{'='*50}\n")
    # ────────────────────────────────────────────────────────────────────────

    return {"message": "Phone OTP sent successfully"}


@router.post("/confirm", response_model=schemas.User)
def verify_and_signup(req: VerifyAndSignupRequest, db: Session = Depends(get_db)):
    """Verify both OTPs and create the user account."""
    if not _validate_otp(f"email:{req.email}", req.email_otp):
        raise HTTPException(status_code=400, detail="Invalid or expired email OTP")

    if not _validate_otp(f"phone:{req.phone}", req.phone_otp):
        raise HTTPException(status_code=400, detail="Invalid or expired phone OTP")

    # Clear used OTPs
    _otp_store.pop(f"email:{req.email}", None)
    _otp_store.pop(f"phone:{req.phone}", None)

    user_in = schemas.UserCreate(
        email=req.email,
        phone=req.phone,
        password=req.password,
    )
    try:
        user = crud.create_user(db, user_in)
    except Exception:
        raise HTTPException(status_code=400, detail="Could not create user — email or phone may already be registered")

    return user
