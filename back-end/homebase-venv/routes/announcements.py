from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional, List
import models

from database import get_db
from models import Announcement
import schemas

router = APIRouter(prefix="/announcements", tags=["Announcements"])


# ---------------------- CREATE ----------------------
@router.post("/create", response_model=schemas.AnnouncementOut)
def create_announcement(
    employer_id: int = Form(...),
    title: str = Form(...),
    message: str = Form(...),
    expires_at: Optional[str] = Form(None),
    attachment: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    # Parse expires_at
    expires_at_dt = None
    if expires_at and expires_at.strip():
        try:
            expires_at_dt = datetime.fromisoformat(expires_at)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail="expires_at must be a valid ISO datetime (e.g., 2025-09-10T15:30:00)",
            )

    # Handle file upload
    attachment_url = None
    if attachment:
        file_location = f"uploads/{attachment.filename}"
        with open(file_location, "wb") as f:
            f.write(attachment.file.read())
        attachment_url = file_location

    # Save
    new_announcement = Announcement(
        employer_id=employer_id,
        title=title,
        message=message,
        attachment_url=attachment_url,
        expires_at=expires_at_dt,
    )
    db.add(new_announcement)
    db.commit()
    db.refresh(new_announcement)

    return new_announcement


# ---------------------- GET ALL ----------------------
@router.get("/get-announcements", response_model=List[schemas.AnnouncementOut])
def get_announcements(employer_id: int, db: Session = Depends(get_db)):
    return db.query(Announcement).filter(Announcement.employer_id == employer_id).order_by(Announcement.created_at.desc()).all()

    return announcement


@router.get("/employee/get-announcements/", response_model=List[schemas.AnnouncementOut])
def get_employee_announcements(employee_id: int, db: Session = Depends(get_db)):
    # Get the employee
    employee = db.query(models.Employee).filter(models.Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    # Get announcements for that employee's employer
    announcements = (
        db.query(models.Announcement)
        .filter(models.Announcement.employer_id == employee.employer_id)
        .order_by(models.Announcement.created_at.desc())
        .all()
    )

    return announcements



# ---------------------- UPDATE ----------------------
@router.put("/edit/{announcement_id}", response_model=schemas.AnnouncementOut)
def update_announcement(
    announcement_id: int,
    title: Optional[str] = Form(None),
    message: Optional[str] = Form(None),
    expires_at: Optional[str] = Form(None),
    attachment: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    announcement = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")

    # Update fields if provided
    if title is not None:
        announcement.title = title
    if message is not None:
        announcement.message = message

    if expires_at and expires_at.strip():
        try:
            announcement.expires_at = datetime.fromisoformat(expires_at)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid expires_at format")

    # Handle file upload
    if attachment:
        file_location = f"uploads/{attachment.filename}"
        with open(file_location, "wb") as f:
            f.write(attachment.file.read())
        announcement.attachment_url = file_location

    db.commit()
    db.refresh(announcement)
    return announcement


# ---------------------- DELETE ----------------------
@router.delete("/delete/{announcement_id}")
def delete_announcement(announcement_id: int, db: Session = Depends(get_db)):
    announcement = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")

    db.delete(announcement)
    db.commit()
    return {"message": f"Announcement {announcement_id} deleted successfully"}
