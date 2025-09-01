from typing import List
from fastapi import APIRouter, Depends, Query, Request, status, HTTPException
from sqlalchemy.orm import Session,joinedload
from datetime import datetime,timedelta
from database import get_db
from models import (
    Shift, ShiftStatus, ShiftCoverRequest, ShiftTradeRequest, Conversation, Participant, Message,Employee, Employer
)
import schemas

router = APIRouter(tags=["Shifts"])

# -------------------- Shift CRUD -------------------- #

@router.post("/shifts", response_model=schemas.ShiftCreate)
def create_shift(
    shift: schemas.ShiftCreate,
    db: Session = Depends(get_db)
):
    # Check if a shift overlaps with an existing one for the same employee
    overlapping_shift = db.query(Shift).filter(
        Shift.employee_id == shift.employee_id,
        Shift.start_time < shift.end_time,   # Existing shift starts before new shift ends
        Shift.end_time > shift.start_time    # Existing shift ends after new shift starts
    ).first()

    if overlapping_shift:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Employee already has a shift that overlaps with this time."
        )

    # Create new shift
    new_shift = Shift(**shift.dict())
    db.add(new_shift)
    db.commit()
    db.refresh(new_shift)
    return new_shift


@router.put("/shifts/{shift_id}/edit")
def edit_shift(
    shift_id: int,
    employee_id: int = Query(..., description="ID of the employee"),  # required
    title: str | None = None,
    start_time: datetime | None = None,
    end_time: datetime | None = None,
    db: Session = Depends(get_db)
):
    shift = db.query(Shift).filter(Shift.id == shift_id).first()
    if not shift:
        raise HTTPException(status_code=404, detail="Shift not found")
    
    if title is not None:
        shift.title = title
    if start_time is not None:
        shift.start_time = start_time
    if end_time is not None:
        shift.end_time = end_time
    if employee_id is not None:
        shift.employee_id = employee_id

    db.commit()
    db.refresh(shift)
    return shift




@router.get("/shifts/employer")
def get_shifts(employer_id:int, published: bool, db: Session = Depends(get_db)):
    if published:
        shifts = db.query(Shift).options(
            joinedload(Shift.employee) 
        ).filter(Shift.employer_id == employer_id, Shift.publish_status == "published").order_by(Shift.start_time).all()
    else:
         shifts = db.query(Shift).options(
            joinedload(Shift.employee) 
        ).filter(Shift.employer_id == employer_id, Shift.publish_status == "unpublished").order_by(Shift.start_time).all()

    # Convert to dicts
    result = []
    for shift in shifts:
        result.append({
            "id": shift.id,
            "employee_id": shift.employee_id,
            "employer_id": shift.employer_id,
            "role": shift.role,
            "location": shift.location,
            "title": shift.title,
            "description": shift.description,
            "start_time": shift.start_time,
            "end_time": shift.end_time,
            "status": shift.status.value,
            "publish_status": shift.publish_status.value,
            "employee": {
                "id": shift.employee.id if shift.employee else None,
                "first_name": shift.employee.first_name if shift.employee else "",
                "last_name": shift.employee.last_name if shift.employee else "",
                "profile_picture": shift.employee.profile_picture if shift.employee else None
            } if shift.employee else None
        })
    return result


@router.get("/shifts/employee")
def get_shifts(employee_id:int, db: Session = Depends(get_db)):
    employer_id = db.query(Employee).filter(Employee.id == employee_id ).first().employer_id
    shifts = db.query(Shift).options(
        joinedload(Shift.employee)  # <-- load employee relationship
    ).filter(Shift.employer_id == employer_id, Shift.publish_status == 'published').order_by(Shift.start_time).all()

    # Convert to dicts
    result = []
    for shift in shifts:
        result.append({
            "id": shift.id,
            "employee_id": shift.employee_id,
            "employer_id": shift.employer_id,
            "role": shift.role,
            "location": shift.location,
            "title": shift.title,
            "description": shift.description,
            "start_time": shift.start_time,
            "end_time": shift.end_time,
            "status": shift.status.value,
            "publish_status": shift.publish_status.value,
            "employee": {
                "id": shift.employee.id if shift.employee else None,
                "first_name": shift.employee.first_name if shift.employee else "",
                "last_name": shift.employee.last_name if shift.employee else "",
                "profile_picture": shift.employee.profile_picture if shift.employee else None
            } if shift.employee else None
        })
    return result


@router.get("/employee/shifts-dashboard", response_model=List[schemas.ShiftEmployeeDashboard])
def get_employee_shift_dashboard(employee_id:int, db: Session = Depends(get_db)):
    employee_shifts = db.query(Shift).filter(Shift.employee_id == employee_id).all()
    if not employee_shifts:
        raise HTTPException(status_code=404, detail="No shifts available")
    print("Query result:", employee_shifts)
    return employee_shifts

@router.get("/employees/employee-name")
def get_employee_name(employee_id: int, db: Session = Depends(get_db)):
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="The employee does not exist"
        )
    return {"first_name": employee.first_name}

@router.get("/employees/{employee_id}/weekly-schedule")
def get_weekly_schedule(employee_id: int, week_start: str, db: Session = Depends(get_db)):
    """
    week_start: date string (YYYY-MM-DD) representing the Monday of the week
    """
    try:
        start_date = datetime.strptime(week_start, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")

    end_date = start_date + timedelta(days=6)

    shifts = (
        db.query(Shift)
        .filter(
            Shift.employee_id == employee_id,
            Shift.start_time >= start_date,
            Shift.end_time <= end_date
        )
        .all()
    )

    total_hours = 0.0
    for shift in shifts:
        duration = (shift.end_time - shift.start_time).total_seconds() / 3600
        total_hours += duration

    return {
        "employee_id": employee_id,
        "week_start": str(start_date),
        "week_end": str(end_date),
        "scheduled_hours": round(total_hours, 2),
        "shifts": shifts
    }


@router.delete("/shifts/{shift_id}")
def delete_shift(shift_id: int, db: Session = Depends(get_db)):
    shift = db.query(Shift).filter(Shift.id == shift_id).first()
    if not shift:
        return {"error": "Shift not found"}
    db.delete(shift)
    db.commit()
    return {"success": f"Shift {shift_id} deleted."}


@router.get("/shifts/coworkers", response_model=List[schemas.ShiftOut])
def get_coworker_shifts(employee_id: int, db: Session = Depends(get_db)):
    employer_id = db.query(Employee).filter(Employee.id == employee_id).first().employer_id
    shifts = db.query(Shift).filter(Shift.employer_id == employer_id).all()
    return shifts

@router.get("/shifts/{user_id}")
def get_user_shifts(user_id: int, db: Session = Depends(get_db)):
    shift = db.query(Shift).filter(Shift.id == user_id).first()
    if not shift:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"This {user_id} shift does not exist.")
    return shift



@router.get("/shifts/employees/team/{employer_id}")
def get_employees(employer_id : int,request: Request, db: Session = Depends(get_db)):
    employees = db.query(Employee).filter(Employee.employer_id == employer_id).all()
    result = []
    for emp in employees:
        profile_url = None
        if emp.profile_picture:
            if emp.profile_picture.startswith("static/"):
                # Use the static mount
                profile_url = str(request.base_url) + emp.profile_picture  # e.g. /static/profile_pictures/...
            else:
                # Use the uploads mount
                profile_url = str(request.base_url) + f"{emp.profile_picture.lstrip('/')}"
        result.append({
            "id": emp.id,
            "first_name": emp.first_name,
            "last_name" : emp.last_name,
            "access_level": "employee" if emp.employer else None,
            "profile_picture": profile_url,
        })
    return result



# -------------------- Shift Status -------------------- #

@router.put("/shifts/{shift_id}/status")
def update_shift_status(shift_id: int, status: ShiftStatus, db: Session = Depends(get_db)):
    shift = db.query(Shift).filter(Shift.id == shift_id).first()
    if not shift:
        return {"error": "Shift not found"}
    shift.status = status
    db.commit()
    db.refresh(shift)
    return shift

# -------------------- Shift with Chat -------------------- #

# def send_shift_message(db: Session, shift: Shift, sender_id: int, text: str):
#     employee_user = db.query(ChatUser).filter(ChatUser.employee_id == shift.employee_id).first()
#     employer_user = db.query(ChatUser).filter(ChatUser.employer_id == shift.employer_id).first()

#     conversation = (
#         db.query(Conversation)
#         .filter(Conversation.type == "direct")
#         .join(Participant)
#         .filter(Participant.user_id.in_([employee_user.id, employer_user.id]))
#         .first()
#     )
#     if not conversation:
#         conversation = Conversation(type="direct", created_at=datetime.utcnow())
#         db.add(conversation)
#         db.commit()
#         db.refresh(conversation)
#         db.add_all([
#             Participant(user_id=employee_user.id, conversation_id=conversation.id),
#             Participant(user_id=employer_user.id, conversation_id=conversation.id)
#         ])
#         db.commit()

#     message = Message(
#         conversation_id=conversation.id,
#         sender_id=sender_id,
#         text=text
#     )
#     db.add(message)
#     db.commit()

@router.post("/shifts/with-chat")
def create_shift_chat(employee_id: int, employer_id: int, title: str, start_time: datetime, end_time: datetime, db: Session = Depends(get_db)):
    shift = Shift(
        employee_id=employee_id,
        employer_id=employer_id,
        title=title,
        start_time=start_time,
        end_time=end_time
    )
    db.add(shift)
    db.commit()
    db.refresh(shift)

    send_shift_message(
        db, shift, sender_id=employer_id,
        text=f"📅 New shift assigned: {title} from {start_time} to {end_time}"
    )
    return shift

@router.put("/shifts/{shift_id}/status-with-chat")
def update_shift_chat(shift_id: int, status: ShiftStatus, updater_id: int, db: Session = Depends(get_db)):
    shift = db.query(Shift).filter(Shift.id == shift_id).first()
    if not shift:
        return {"error": "Shift not found"}
    shift.status = status
    db.commit()
    db.refresh(shift)

    send_shift_message(
        db, shift, sender_id=updater_id,
        text=f"🔔 Shift '{shift.title}' status updated to: {status.value}"
    )
    return shift

# -------------------- Cover Requests -------------------- #

@router.post("/shifts/{shift_id}/cover-request")
def request_shift_cover(shift_id: int, requester_id: int, db: Session = Depends(get_db)):
    shift = db.query(Shift).filter(Shift.id == shift_id).first()
    if not shift:
        return {"error": "Shift not found"}

    cover_request = ShiftCoverRequest(
        shift_id=shift.id,
        requester_id=requester_id,
        status="pending"
    )
    db.add(cover_request)
    db.commit()
    db.refresh(cover_request)
    return cover_request

@router.put("/shifts/cover-request/{request_id}/respond")
def respond_cover_request(request_id: int, responder_id: int, accept: bool, db: Session = Depends(get_db)):
    request = db.query(ShiftCoverRequest).filter(ShiftCoverRequest.id == request_id).first()
    if not request:
        return {"error": "Request not found"}
    request.status = "accepted" if accept else "rejected"
    db.commit()
    db.refresh(request)

    if accept:
        shift = db.query(Shift).filter(Shift.id == request.shift_id).first()
        shift.employee_id = responder_id
        db.commit()
        db.refresh(shift)

    return request

# -------------------- Trade Requests -------------------- #

@router.post("/shifts/{shift_id}/trade-request")
def request_shift_trade(shift_id: int, proposer_id: int, target_employee_id: int, db: Session = Depends(get_db)):
    trade_request = ShiftTradeRequest(
        shift_id=shift_id,
        proposer_id=proposer_id,
        target_employee_id=target_employee_id,
        status="pending"
    )
    db.add(trade_request)
    db.commit()
    db.refresh(trade_request)
    return trade_request

@router.put("/shifts/trade-request/{request_id}/respond")
def respond_trade_request(request_id: int, accept: bool, db: Session = Depends(get_db)):
    trade_request = db.query(ShiftTradeRequest).filter(ShiftTradeRequest.id == request_id).first()
    if not trade_request:
        return {"error": "Trade request not found"}
    trade_request.status = "accepted" if accept else "rejected"
    db.commit()
    db.refresh(trade_request)

    if accept:
        shift = db.query(Shift).filter(Shift.id == trade_request.shift_id).first()
        shift.employee_id = trade_request.target_employee_id
        db.commit()
        db.refresh(shift)

    return trade_request
