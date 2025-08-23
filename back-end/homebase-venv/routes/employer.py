from fastapi import APIRouter, status, HTTPException, Depends, Query, Request, File, UploadFile, Form
from pydantic import ValidationError
from database import Session, get_db
import os
from auth import get_password_hash
import models 
import schemas
from typing import Optional




router = APIRouter(tags=["Employer"])

@router.get("/employer-signup-phonenumber-email-check",status_code=status.HTTP_200_OK, response_model=schemas.checkEmailandPhoneNumberEmployer, tags=['Employer'])
def check_employer_phonenumber_email(phone_number:str = Query(...,min_length=10), email:str = Query(...), db:Session = Depends(get_db) ):
    email  = db.query(models.Employer).filter(models.Employer.email == email).first() is not None;
    phone_number  = db.query(models.Employer).filter(models.Employer.phone_number == phone_number).first() is not None;
    return {
        "phone_exists" : phone_number,
        "email_exists"  : email
    }

@router.get('/employer-signup-username-check', status_code=status.HTTP_200_OK, response_model = schemas.checkusernameEmployer, tags=['Employer'])
def check_employer_username(username: str = Query(..., min_length= 8), db: Session = Depends(get_db)):
    username = db.query(models.Employer).filter(models.Employer.username == username).first() is not None;
    return {"exists" : username}
    
    
@router.get("/employer-signup-companyid-check", status_code=status.HTTP_200_OK, tags=["Employer"], response_model=schemas.checkCompanyid)
def check_employer_compnayid(company_id: str = Query(...), db: Session= Depends(get_db)):
    company_id = db.query(models.Employer).filter(models.Employer.company_id == company_id).first() is not None;
    return {"companyid_exists" : company_id};

#  EMPLOYERS SIGNUP
@router.post("/employer-signup", status_code=status.HTTP_201_CREATED, tags=['Employer'])
def signup(user: schemas.EmployerCreate, db: Session = Depends(get_db)):
    # Check if username, email, or phone_number already exists
    for field, value in [
        ("username", user.username), 
        ("email", user.email), 
        ("phone_number", user.phone_number)
    ]:
        exists = db.query(models.Employer).filter(getattr(models.Employer, field) == value).first()
        if exists:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"{field} '{value}' is already registered."
            )
    
    # Hash the password
    hashed_pw = get_password_hash(user.password)

    # Create the Employee instance
    employer = models.Employer(
        first_name=user.first_name,
        last_name=user.last_name,
        company_id=user.company_id,
        email=user.email,
        phone_number=user.phone_number,
        username=user.username,
        hashed_password=hashed_pw,
    )

    # Save to DB
    db.add(employer)
    db.commit()
    db.refresh(employer)

    return {"message": "User created successfully", "employer_id": employer.id}

@router.get('/employer/settings/{employer_id}/employer-info', tags=["Employer"])
def get_employee_info_setting(employer_id: int, request: Request, db: Session = Depends(get_db)):
    employer = db.query(models.Employer).filter(models.Employer.id == employer_id).first()
    if not employer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Employer {employer_id} does not exist.")
    
    # Full URL for profile picture
    profile_url = None
    
    if employer.profile_picture.startswith("static/"):
                # Use the static mount
                profile_url = str(request.base_url) + employer.profile_picture  # e.g. /static/profile_pictures/...
    else:
                # Use the uploads mount
                profile_url = str(request.base_url) + f"{employer.profile_picture.lstrip('/')}"
    
    return {
        "first_name": employer.first_name,
        "last_name": employer.last_name,
        "email": employer.email,
        "phone_number": employer.phone_number,
        "profile_pic": profile_url
    }
    
@router.put('/employers/{employer_id}/settings/update' ,tags=["Employer"])
async def update_employee_profile(
    employer_id: int,
    first_name: str = Form(...),
    last_name: str = Form(...),
    email: str = Form(...),
    phone_number: str = Form(...),
    file: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    try:
        
        # Validate form data
        profile_data = schemas.EmployerProfileUpdate(
            first_name=first_name,
            last_name=last_name,
            email=email,
            phone_number=phone_number
        )
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=e.errors())
    except ValueError:
        raise HTTPException(status_code=422, detail=[{"loc": ["dob"], "msg": "Invalid date format", "type": "value_error"}])

    # Find employee in DB
    employer = db.query(models.Employer).filter(models.Employer.id == employer_id).first()
    if not employer:
        raise HTTPException(status_code=404, detail="Employee not found")

    # Update fields
    employer.first_name = profile_data.first_name
    employer.last_name = profile_data.last_name
    employer.email = profile_data.email
    employer.phone_number = profile_data.phone_number

    # Handle file upload if exists
    if file:
        upload_dir = 'static/profile_pictures'
        os.makedirs(upload_dir, exist_ok=True)

        filename = f"{employer_id}_{file.filename}"
        file_location = os.path.join(upload_dir, filename)

        with open(file_location, "wb+") as file_object:
            file_object.write(await file.read())

        employer.profile_picture = f"/static/profile_pictures/{filename}"

    db.commit()
    db.refresh(employer)

    return {"profile_picture": employer.profile_picture}

@router.put('/employer/settings/{employer_id}', tags=["Employer"])
def change_employee_password(
    employer_id: int, 
    password_data: schemas.PasswordChangeRequest,
    db: Session = Depends(get_db)
):
    employer = db.query(models.Employer).filter(models.Employer.id == employer_id).first()
    if not employer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employer does not exist.")

    hashed_password = get_password_hash(password_data.new_password)
    employer.hashed_password = hashed_password
    db.commit()
    db.refresh(employer)
    return {"response": "Password updated successfully"}

@router.put("/employers/{employer_id}/profile-picture", tags=["Employer"])
async def update_employer_profile_picture(
    employer_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Find the employer
    employer = db.query(models.Employer).filter(models.Employer.id == employer_id).first()
    if not employer:
        raise HTTPException(status_code=404, detail="Employer not found")
    
    # Save the file
    upload_dir = "static/profile_pictures"
    os.makedirs(upload_dir, exist_ok=True)
    filename = f"{employer_id}_{file.filename}"
    file_path = os.path.join(upload_dir, filename)
    with open(file_path, "wb+") as f:
        f.write(await file.read())
    
    # Update employer record
    employer.profile_picture = f"/static/profile_pictures/{filename}"
    db.commit()
    db.refresh(employer)
    
    return {"profile_picture": employer.profile_picture}