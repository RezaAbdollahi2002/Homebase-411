from fastapi import APIRouter, status, HTTPException, Query, Depends
import schemas,models
from database import Session, get_db

router = APIRouter(tags=["Checks"])


#  ---------------- EMPLOYEE ---------------------

@router.get("/checks/employee-signup-username-check", response_model=schemas.checkUserName, tags=['Employee'])
def check_username_availability(username: str = Query(..., min_length=8), db: Session = Depends(get_db)):
    # Query DB to find if username exists (case-insensitive example)
    employee = db.query(models.Employee).filter(models.Employee.username == username).first() is not None
    employer = db.query(models.Employer).filter(models.Employer.username == username).first() is not None
    user = employee or employer
    return {"exists": bool(user)}

@router.get("/checks/employee-signup-phonenumber-email-check", response_model=schemas.checkPhonenumberEmail, tags=['Employee'])
def check_username_availability(phone_number: str = Query(..., min_length=10), email: str = Query(...) , db: Session = Depends(get_db)):
    # Query DB to find if username exists (case-insensitive example)
    phone_exists = db.query(models.Employee).filter(models.Employee.phone_number == phone_number).first() is not None
    email_exists = db.query(models.Employee).filter(models.Employee.email == email).first() is not None

    return {
        "phone_exists" : phone_exists,
        "email_exists": email_exists
    }
    
@router.get("/checks/employee/signup/employerid", response_model=schemas.EmployeeEmployerIdCheck)
def check_employer_id(employer_id:int, db:Session = Depends(get_db)):
    employer = db.query(models.Employer).filter(models.Employer.id == employer_id).first()
    if not employer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="Employer Does not exits")
    return {"employer_id_check": True}

#  ---------------- EMPLOYER ---------------------
