from fastapi import APIRouter, status, HTTPException, Depends
import models
import schemas
from database import Session, get_db
import auth

router = APIRouter(prefix="/signin",tags=["Signin"])

@router.post("/", response_model=schemas.TokenResponse, tags=['General'])
def signin(credentials: schemas.LoginRequest, db: Session = Depends(get_db)):
    # Try employee first
    employee = db.query(models.Employee).filter(models.Employee.username == credentials.username).first()
    if employee and auth.verify_password(credentials.password, employee.hashed_password):
        access_token = auth.create_access_token(data={"sub": employee.username, "role": "employee"})
        return {
            "access_token": access_token,
            "employee_id": employee.id,
            "role": "employee",
            "token_type": "bearer",
            "employer_id": None
        }
    
    # Try employer
    employer = db.query(models.Employer).filter(models.Employer.username == credentials.username).first()
    if employer and auth.verify_password(credentials.password, employer.hashed_password):
        access_token = auth.create_access_token(data={"sub": employer.username, "role": "employer"})
        return {
            "access_token": access_token,
            "employer_id": employer.id,
            "role": "employer",
            "token_type": "bearer",
            "employee_id": None
        }
    
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")



