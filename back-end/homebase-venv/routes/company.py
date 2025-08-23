from fastapi import APIRouter, status, HTTPException, Depends, Query
from database import Session, get_db
import models 
import schemas
from typing import Optional
from datetime import date



router = APIRouter(tags=["Company"])


@router.get("/company-signup-zipcode-check", status_code=status.HTTP_200_OK, tags=["Company"], response_model=schemas.checkzipcode)
def check_company_compnayid(zipcode: int = Query(...), db: Session= Depends(get_db)):
    zipcode = db.query(models.Company).filter(models.Company.primary_location == zipcode).first() is not None;
    return {"zipcode_exists" : zipcode};




@router.get("/company-signup-check", 
            status_code=status.HTTP_200_OK, 
            tags=["Company"], 
            response_model=schemas.checkCompanyExists)
def check_company(
    primary_location: Optional[int] = Query(None),
    name: str = Query(...),
    kind: str = Query(...),
    open_date: date = Query(...),  # or datetime if you expect that # type: ignore
    db: Session = Depends(get_db)
):
    primary_location_exists = db.query(models.Company).filter(models.Company.primary_location == primary_location).first() is not None
    name_exists = db.query(models.Company).filter(models.Company.name == name).first() is not None
    kind_exists = db.query(models.Company).filter(models.Company.kind == kind).first() is not None
    open_date_exists = db.query(models.Company).filter(models.Company.open_date == open_date).first() is not None

    return {
        "primary_location_exists": primary_location_exists,
        "name_exists": name_exists,
        "kind_exists": kind_exists,
        "open_date_exists": open_date_exists,
    }


#  COMPANY SIGNUP
@router.post("/company-signup", status_code=status.HTTP_201_CREATED, tags=['Company'])
def signup(user: schemas.CompanyCreate, db: Session = Depends(get_db)):
    # Check if username, email, or phone_number already exists
    for field, value in [
        ("primary_location", user.primary_location), 
        
    ]:
        exists = db.query(models.Company).filter(getattr(models.Company, field) == value).first()
        if exists:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"{field} '{value}' is already registered."
            )

    # Create the Company instance
    company = models.Company(
        name = user.name,
        kind= user.kind,
        primary_location= user.primary_location,
        number_of_employees= user.number_of_employees,
        number_of_locations= user.number_of_locations,
        open_date = user.open_date,
        selected_services =user.selected_services,
    )

    # Save to DB
    db.add(company)
    db.commit()
    db.refresh(company)

    return {"message": "Company created successfully", "employer_id": company.id}