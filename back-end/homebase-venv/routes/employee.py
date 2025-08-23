from datetime import datetime
import os
from fastapi import APIRouter, File, Query, Request, UploadFile, status, HTTPException, Depends, Form
from pydantic import ValidationError 
from auth import get_password_hash, get_current_employee
from database import Session, get_db
import models
import schemas
from typing import Optional
from sqlalchemy.orm import Session,joinedload



router = APIRouter(tags=["Employee"])


#  EMPLOYEES SIGNUP
@router.post("/employee-signup", status_code=status.HTTP_201_CREATED, tags=['Employee'])
def signup(user: schemas.EmployeeCreate, db: Session = Depends(get_db)):
    # Check if username, email, or phone_number already exists
    for field, value in [
        ("username", user.username), 
        ("email", user.email), 
        ("phone_number", user.phone_number)
    ]:
        exists = db.query(models.Employee).filter(getattr(models.Employee, field) == value).first()
        if exists:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"{field} '{value}' is already registered."
            )
    
    # Hash the password
    hashed_pw = get_password_hash(user.password)

    # Create the Employee instance
    employee = models.Employee(
        first_name=user.first_name,
        last_name=user.last_name,
        dob=user.dob,
        employer_id=user.employer_id,
        phone_number=user.phone_number,
        email=user.email,
        username=user.username,
        hashed_password=hashed_pw,
    )

    # Save to DB
    db.add(employee)
    db.commit()
    db.refresh(employee)

    return {"message": "User created successfully", "employee_id": employee.id}

@router.put('/employees/{employee_id}/settings/update')
async def update_employee_profile(
    employee_id: int,
    first_name: str = Form(...),
    last_name: str = Form(...),
    dob: Optional[str] = Form(None),
    email: str = Form(...),
    phone_number: str = Form(...),
    file: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    try:
        # Parse dob string to date or None
        dob_date = datetime.strptime(dob, "%Y-%m-%d").date() if dob else None

        # Validate form data
        profile_data = schemas.EmployeeProfileUpdate(
            first_name=first_name,
            last_name=last_name,
            dob=dob_date,
            email=email,
            phone_number=phone_number
        )
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=e.errors())
    except ValueError:
        raise HTTPException(status_code=422, detail=[{"loc": ["dob"], "msg": "Invalid date format", "type": "value_error"}])

    # Find employee in DB
    employee = db.query(models.Employee).filter(models.Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    # Update fields
    employee.first_name = profile_data.first_name
    employee.last_name = profile_data.last_name
    employee.dob = profile_data.dob
    employee.email = profile_data.email
    employee.phone_number = profile_data.phone_number

    # Handle file upload if exists
    if file:
        upload_dir = 'static/profile_pictures'
        os.makedirs(upload_dir, exist_ok=True)

        filename = f"{employee_id}_{file.filename}"
        file_location = os.path.join(upload_dir, filename)

        with open(file_location, "wb+") as file_object:
            file_object.write(await file.read())

        employee.profile_picture = f"/static/profile_pictures/{filename}"

    db.commit()
    db.refresh(employee)

    return {"profile_picture": employee.profile_picture}
@router.get("/api/employees/me/id", response_model=schemas.EmployeeIdSchema)
def get_employee_id(current_employee: models.Employee = Depends(get_current_employee)):
    return current_employee


@router.get("/employee-signup-username-check", response_model=schemas.checkUserName, tags=['Employee'])
def check_username_availability(username: str = Query(..., min_length=4), db: Session = Depends(get_db)):
    # Query DB to find if username exists (case-insensitive example)
    user = db.query(models.Employee).filter(models.Employee.username.ilike(username)).first()
    return {"exists": bool(user)}

@router.get("/employee-signup-phonenumber-email-check", response_model=schemas.checkPhonenumberEmail, tags=['Employee'])
def check_username_availability(phone_number: str = Query(..., min_length=10), email: str = Query(...) , db: Session = Depends(get_db)):
    # Query DB to find if username exists (case-insensitive example)
    phone_exists = db.query(models.Employee).filter(models.Employee.phone_number == phone_number).first() is not None
    email_exists = db.query(models.Employee).filter(models.Employee.email == email).first() is not None
    return {
        "phone_exists" : phone_exists,
        "email_exists": email_exists
    }
    
    
@router.put("/employees/{employee_id}/profile-picture", tags=["Employee"])
async def update_employee_profile_picture(
    employee_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Find employee
    employee = db.query(models.Employee).filter(models.Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    # Create upload directory if not exists
    upload_dir = "static/profile_pictures"
    os.makedirs(upload_dir, exist_ok=True)

    # Save file
    filename = f"{employee_id}_{file.filename}"
    file_location = os.path.join(upload_dir, filename)
    with open(file_location, "wb+") as f:
        f.write(await file.read())

    # Update DB record
    employee.profile_picture = f"/static/profile_pictures/{filename}"
    db.commit()
    db.refresh(employee)

    return {"profile_picture": employee.profile_picture}

@router.get('/employees/settings/{employee_id}/location', response_model=schemas.LocationResponse, tags=['Employee'])
def get_employee_location(employee_id: int, db: Session = Depends(get_db)):
    employee = (
        db.query(models.Employee)
        .options(
            joinedload(models.Employee.employer).joinedload(models.Employer.company)
        )
        .filter(models.Employee.id == employee_id)
        .first()
    )

    # Debug prints
    print(f"employee: {employee}")
    print(f"employee.employer: {getattr(employee, 'employer', None)}")
    print(f"employee.employer.company: {getattr(getattr(employee, 'employer', None), 'company', None)}")

    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    if not employee.employer:
        return {"location": "Employer not found"}

    if not employee.employer.company:
        return {"location": "Company not found"}

    location = employee.employer.company.primary_location
    if not location:
        return {"location": "Location not set"}

    return {"location": location}


from pydantic import BaseModel



@router.put('/employees/settings/{employee_id}', tags=["Employee"])
def change_employee_password(
    employee_id: int, 
    password_data: schemas.PasswordChangeRequest,
    db: Session = Depends(get_db)
):
    employee = db.query(models.Employee).filter(models.Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee does not exist.")

    hashed_password = get_password_hash(password_data.new_password)
    employee.hashed_password = hashed_password
    db.commit()
    db.refresh(employee)
    return {"response": "Password updated successfully"}

@router.get('/employees/settings/{employee_id}/employee-info', tags=["Employee"])
def get_employee_info_setting(employee_id:int, db:Session=Depends(get_db)):
    employee = db.query(models.Employee).filter(models.Employee.id == employee_id).first()
    
    if not employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Employee {employee_id} does not exist.")
    return {"first_name": employee.first_name, "last_name": employee.last_name, "dob" : employee.dob,
            "email" : employee.email, "phone_number": employee.phone_number, "profile_pic": employee.profile_picture
            }


@router.get("/employees/team")
def get_employees(request: Request, db: Session = Depends(get_db)):
    employees = db.query(models.Employee).all()
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
            "full_name": f"{emp.first_name} {emp.last_name}",
            "access_level": "employee" if emp.employer else None,
            "company_location": emp.employer.company.primary_location if emp.employer and emp.employer.company else None,
            "profile_picture": profile_url,
        })
    return result

