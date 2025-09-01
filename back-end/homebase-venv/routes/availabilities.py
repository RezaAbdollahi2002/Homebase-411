
from typing import Optional, List, Set
from datetime import datetime
import schemas
from fastapi.responses import JSONResponse

from fastapi import (
    APIRouter, Depends, UploadFile, File, Form, WebSocket,
    WebSocketDisconnect, HTTPException, Query, Request
)
from database import Session
import schemas
from database import get_db
import models

router = APIRouter(prefix="/availabilities", tags=["Availabilities"])

# -------------- Create Availabilities ----------------
@router.post("/create-availabilities")
def create_availabilities(request: schemas.AvailabilityCreate, db: Session = Depends(get_db)):
    new_availability = models.EmployeeAvailability(
        employee_id=request.employee_id,
        type=models.AvailabilityType(request.type),
        name=request.name,
        start_date=request.start_date,
        end_date=request.end_date,
        day_of_week=request.day_of_week,
        start_time=request.start_time,
        end_time=request.end_time,
        description=request.description
    )
    db.add(new_availability)
    db.commit()
    db.refresh(new_availability)
    return {"message": "Availability created successfully", "availability": new_availability}

@router.get('/get-employee-availabilities', response_model=List[schemas.AvailabilityResponse])
def get_availabilities(employee_id: int, db: Session = Depends(get_db)):
    availabilities = db.query(models.EmployeeAvailability).filter(
        models.EmployeeAvailability.employee_id == employee_id
    ).all()
    return availabilities
