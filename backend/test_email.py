"""
test_email.py — Run this to check if your email setup is working.
Usage: python test_email.py
"""
import smtplib, os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
TO_EMAIL = input("Enter the email address to send a test OTP to: ").strip()

print(f"\nSMTP_USER loaded: {SMTP_USER}")
print(f"SMTP_PASSWORD loaded: {'*' * len(SMTP_PASSWORD) if SMTP_PASSWORD else '(empty)'}")

if not SMTP_USER or SMTP_USER == "your_gmail@gmail.com":
    print("\nERROR: SMTP_USER not set in .env file!")
    print("Please open backend/.env and fill in your Gmail address and App Password.\n")
    exit(1)

if not SMTP_PASSWORD or SMTP_PASSWORD == "your_16_char_app_password":
    print("\nERROR: SMTP_PASSWORD not set in .env file!")
    print("Generate an App Password at: https://myaccount.google.com/apppasswords\n")
    exit(1)

print(f"\nAttempting to send test email to {TO_EMAIL} ...")

try:
    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Test OTP: 123456"
    msg["From"] = SMTP_USER
    msg["To"] = TO_EMAIL
    msg.attach(MIMEText("<h2>Test OTP: <b>123456</b></h2><p>If you see this, email sending works!</p>", "html"))

    with smtplib.SMTP("smtp.gmail.com", 587) as server:
        server.set_debuglevel(1)   # show SMTP conversation
        server.ehlo()
        server.starttls()
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.sendmail(SMTP_USER, TO_EMAIL, msg.as_string())
        print("\nSUCCESS! Test email sent. Check your inbox.")

except smtplib.SMTPAuthenticationError:
    print("\nERROR: Authentication failed!")
    print("Make sure you are using a Gmail APP PASSWORD (not your regular password).")
    print("Generate one at: https://myaccount.google.com/apppasswords")

except smtplib.SMTPException as e:
    print(f"\nSMTP Error: {e}")

except Exception as e:
    print(f"\nUnexpected error: {e}")
