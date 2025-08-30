from typing import Optional
from fastapi import APIRouter, HTTPException, Request, status, Query, Depends
import models
from database import get_db, Session

router = APIRouter(tags=["Team"])

@router.get("/team")
def get_employees(
    request: Request,
    db: Session = Depends(get_db),
    employee_id: Optional[int] = Query(None),
    employer_id: Optional[int] = Query(None)
):
    if (employee_id and employer_id) or (not employee_id and not employer_id):
        raise HTTPException(
            status_code=400,
            detail="You must provide either employee_id or employer_id, but not both."
        )
    # Determine employer_id
    if employee_id:
        employee = db.query(models.Employee).filter(models.Employee.id == employee_id).first()
        if not employee:
            raise HTTPException(status_code=404, detail="Employee not found")
        employer_id = employee.employer_id
    elif not employer_id:
        raise HTTPException(status_code=400, detail="Either employee_id or employer_id must be provided")

    # Get all employees for the employer
    employees = db.query(models.Employee).filter(models.Employee.employer_id == employer_id).all()

    result = []
    for emp in employees:
        profile_url = None
        if emp.profile_picture:
            if emp.profile_picture.startswith("static/"):
                profile_url = str(request.base_url) + emp.profile_picture
            else:
                profile_url = str(request.base_url) + f"{emp.profile_picture.lstrip('/')}"
        result.append({
            "id": emp.id,
            "full_name": f"{emp.first_name} {emp.last_name}",
            "access_level": "employee" if emp.employer else None,
            "company_location": emp.employer.company.primary_location if emp.employer and emp.employer.company else None,
            "profile_picture": profile_url,
        })
    return result

@router.delete("/team/delete/{employee_id}")
def delete_employee(employee_id: int, db: Session = Depends(get_db)):
    employee = db.query(models.Employee).filter(models.Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    db.delete(employee)
    db.commit()
    return {"detail": "Employee deleted successfully"}