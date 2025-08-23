from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from datetime import date, time, timedelta
from database import get_db
from models import EmployeeAvailability, AvailabilityStatus
from schemas import AvailabilityCreate, Availability
from datetime import datetime


router = APIRouter(prefix="/availabilities", tags=["Availabilities"])

@router.post("/create", response_model=Availability)
def create_availability(payload: AvailabilityCreate, db: Session = Depends(get_db)):

    # 1️⃣ Validate start_date is not in the past
    if payload.start_date < date.today():
        raise HTTPException(status_code=400, detail="Start date cannot be in the past.")

    # 2️⃣ Validate end_time is after start_time
    if payload.end_time <= payload.start_time:
        raise HTTPException(status_code=400, detail="End time must be after start time.")

    # 3️⃣ Determine dates to check for overlapping
    check_dates = [payload.start_date]
    if payload.day_of_week is not None:
        end_check_date = payload.end_date or (payload.start_date + timedelta(weeks=12))
        current_date = payload.start_date
        while current_date <= end_check_date:
            if current_date.weekday() == payload.day_of_week and current_date != payload.start_date:
                check_dates.append(current_date)
            current_date += timedelta(days=1)

    # 4️⃣ Validate no overlapping availability
    for d in check_dates:
        overlapping = db.query(EmployeeAvailability).filter(
            EmployeeAvailability.employee_id == payload.employee_id,
            EmployeeAvailability.start_date == d,
            EmployeeAvailability.status != AvailabilityStatus.rejected,
            EmployeeAvailability.start_time < payload.end_time,
            EmployeeAvailability.end_time > payload.start_time
        ).first()
        if overlapping:
            raise HTTPException(
                status_code=400,
                detail=f"Availability on {d} overlaps with an existing one."
            )

    # 5️⃣ Create availability entry
    new_availability = EmployeeAvailability(
        name=payload.name,
        description=payload.description,
        employee_id=payload.employee_id,
        start_date=payload.start_date,
        end_date=payload.end_date,
        day_of_week=payload.day_of_week,
        start_time=payload.start_time,
        end_time=payload.end_time,
        status=AvailabilityStatus.pending
    )
    db.add(new_availability)
    db.commit()
    db.refresh(new_availability)
    return new_availability




# List all availabilities (for employee or employer)
@router.get("/", response_model=List[Availability])
def list_availabilities(employee_id: int | None = None, db: Session = Depends(get_db)):
    query = db.query(EmployeeAvailability)
    if employee_id:
        query = query.filter(EmployeeAvailability.employee_id == employee_id)
    return query.all()


# Update availability status (employer approves/rejects)
@router.patch("/{availability_id}/status", response_model=Availability)
def update_availability_status(
    availability_id: int,
    status: AvailabilityStatus,
    db: Session = Depends(get_db)
):
    availability = db.query(EmployeeAvailability).filter(EmployeeAvailability.id == availability_id).first()
    if not availability:
        raise HTTPException(status_code=404, detail="Availability not found")
    
    availability.status = status
    db.commit()
    db.refresh(availability)
    return availability

# Get approved availabilities, optional date range filter
@router.get("/approved", response_model=List[Availability])
def get_approved_availabilities(
    start_date: date | None = Query(None, description="Filter availabilities from this date"),
    end_date: date | None = Query(None, description="Filter availabilities up to this date"),
    employee_id: int | None = Query(None, description="Filter by specific employee"),
    db: Session = Depends(get_db)
):
    query = db.query(EmployeeAvailability).filter(
        EmployeeAvailability.status == AvailabilityStatus.approved
    )

    if employee_id is not None:
        query = query.filter(EmployeeAvailability.employee_id == employee_id)

    if start_date is not None:
        query = query.filter(EmployeeAvailability.start_date >= start_date)

    if end_date is not None:
        query = query.filter(EmployeeAvailability.start_date <= end_date)

    return query.all()

@router.get("/approved/expanded", response_model=List[Availability])
def get_expanded_approved_availabilities(
    start_date: date | None = Query(None, description="Start of filter range"),
    end_date: date | None = Query(None, description="End of filter range"),
    employee_id: int | None = Query(None, description="Filter by employee"),
    db: Session = Depends(get_db)
):
    query = db.query(EmployeeAvailability).filter(
        EmployeeAvailability.status == AvailabilityStatus.approved
    )

    if employee_id is not None:
        query = query.filter(EmployeeAvailability.employee_id == employee_id)

    availabilities = query.all()
    expanded = []

    for avail in availabilities:
        # Determine the range to expand
        range_start = start_date or avail.start_date
        range_end = end_date or (avail.end_date or avail.start_date)

        current_date = avail.start_date
        while current_date <= range_end:
            if avail.day_of_week is None:
                # Single-day availability
                if range_start <= avail.start_date <= range_end:
                    expanded.append(avail)
                break
            else:
                # Weekly repeating availability
                if current_date.weekday() == avail.day_of_week and current_date >= range_start:
                    # Create a copy with the expanded date
                    expanded_avail = Availability.from_orm(avail)
                    expanded_avail.start_date = current_date
                    expanded.append(expanded_avail)
                current_date += timedelta(days=1)

    return expanded