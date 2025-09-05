from pydantic import BaseModel, Field
from enum import Enum
from pydantic import BaseModel, EmailStr, constr, ConfigDict
from typing import Optional, List
from datetime import date, datetime
from datetime import time
import models


#           Employee
class EmployeeCreate(BaseModel):
    first_name: str
    last_name: str
    dob: Optional[date]
    employer_id: Optional[int]
    phone_number: str
    email: EmailStr
    username: str
    password: str  # plain text here, will hash in backend

    model_config = ConfigDict(from_attributes=True)
    
class EmployeeUpdate(BaseModel):
    first_name: Optional[str]
    last_name: Optional[str]
    dob: Optional[date]
    phone_number: Optional[str]
    email: Optional[EmailStr]
    profile_picture: Optional[str]  # new optional field for picture URL/path

    model_config = ConfigDict(from_attributes=True)
    
class EmployeeEmployerIdCheck(BaseModel):
    employer_id_check : bool

class EmployeeIdSchema(BaseModel):
    id: int
    model_config = ConfigDict(from_attributes=True)

class EmployeeProfileResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    dob: Optional[date]
    phone_number: Optional[str]
    email: Optional[str]
    username: str
    profile_picture: Optional[str]  # URL or path to profile picture

    model_config = ConfigDict(from_attributes=True)

class EmployeeProfileUpdate(BaseModel):
    first_name: constr(strip_whitespace=True, min_length=1) # type: ignore
    last_name: constr(strip_whitespace=True, min_length=1) # type: ignore
    dob: Optional[date] = None
    email: EmailStr
    phone_number: constr(min_length=10, max_length=15) # pyright: ignore[reportInvalidTypeForm]
    model_config = ConfigDict(from_attributes=True)

    

#            Employer
class EmployerCreate(BaseModel):
    first_name: str
    last_name: str
    company_id: int
    email: EmailStr
    phone_number: str  
    username: str
    password: str
    
    

    model_config = ConfigDict(from_attributes=True)

class EmployerProfileUpdate(BaseModel):
    first_name: constr(strip_whitespace=True, min_length=1) # type: ignore
    last_name: constr(strip_whitespace=True, min_length=1) # type: ignore
    email: EmailStr
    phone_number: constr(min_length=10, max_length=15) # pyright: ignore[reportInvalidTypeForm]
    model_config = ConfigDict(from_attributes=True)
    
    
#            Company
class CompanyCreate(BaseModel):
    name: str
    kind: str
    primary_location: str
    number_of_employees: str
    number_of_locations: str
    open_date: date
    selected_services: str

    model_config = ConfigDict(from_attributes=True)
    

# ---------------- Signup Check ----------------
class checkUserName(BaseModel):
    exists: bool

class checkusernameEmployer(BaseModel):
    exists: bool
    
class checkPhonenumberEmail(BaseModel):
    phone_exists: bool
    email_exists: bool
    
class checkEmailandPhoneNumberEmployer(BaseModel):
    phone_exists: bool
    email_exists: bool
    
class checkCompanyid(BaseModel):
    companyid_exists: bool

class checkzipcode(BaseModel):
    zipcode_exists: bool
    
class checkCompanyExists(BaseModel):
    name_exists: bool
    kind_exists: bool
    primary_location_exists: bool
    open_date_exists: bool


    
    
class EmailSchema(BaseModel):
    email: EmailStr

class VerifySchema(BaseModel):
    email: EmailStr
    otp: str


#------------------LOGIN-------------------
class LoginRequest(BaseModel):
    username: str
    password: str

class PhoneLoginRequest(BaseModel):
    phone_number: str
    
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = 'bearer'
    employee_id: Optional[int] = None   # can be None if employer
    employer_id: Optional[int] = None   # can be None if employee
    role: str  # 'employee' or 'employer'
    
class PhoneRequest(BaseModel):
    phone_number: str
    
class OTPLoginRequest(BaseModel):
    phone_number: str
    otp: str
    
    
#--------------------------- Settings--------------------

class LocationResponse(BaseModel):
    location: str
    
class PasswordChangeRequest(BaseModel):
    new_password: str



    
#-------------------------Message-----------------
class ConversationCreateRequest(BaseModel):
    type: str  # 'direct' or 'group'
    roles: List[str]
    participants: List[int]
    roles: List[str]
    name: Optional[str] = None  # Only for group chats
    
class ParticipantResponse(BaseModel):
    id: int
    employee_id: Optional[int] = None
    employer_id: Optional[int] = None
    role: str
    joined_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ConversationResponse(BaseModel):
    id: int
    type: str
    name: Optional[str]
    created_at: datetime
    last_message_at: datetime
    participants: List[ParticipantResponse] = []

    model_config = ConfigDict(from_attributes=True)

# ----------- Availablities -----------------

class AvailabilityStatus(str, Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"

class AvailabilityBase(BaseModel):
    employee_id: int
    name: str
    start_date: date
    end_date: date | None = None
    day_of_week: int | None = None  # 0=Monday, 6=Sunday
    start_time: time
    end_time: time
    description: str
    status: AvailabilityStatus = AvailabilityStatus.pending

class AvailabilityCreate(AvailabilityBase):
    pass

class Availability(AvailabilityBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
    
# ---------------- shifts ----------
class ShiftOut(BaseModel):
    id: int
    role: str
    title: str
    start_time: datetime
    end_time: datetime
    status: models.ShiftStatus
    created_at: datetime
    employee_id: int
    employer_id: int
    location: Optional[str] = None
    description: Optional[str] = None
    publish_status: models.PublishStatus

    model_config = dict(from_attributes=True)
    

class ShiftCreate(BaseModel):
    employee_id: int
    employer_id: int
    role: str
    location: str
    publish_status: str
    status:  Optional[models.ShiftStatus] = models.ShiftStatus.scheduled
    title: str
    description: str
    start_time: datetime
    end_time: datetime



class ShiftEmployeeDashboard(BaseModel):
    id:int
    employee_id: int
    employer_id: int
    role: str
    location: str
    publish_status: str
    status:  Optional[models.ShiftStatus] = models.ShiftStatus.scheduled
    title: str
    description: str
    start_time: datetime
    end_time: datetime
    
    
# ----------- Availabilities -------------

# -------- Base Schema --------
class AvailabilityBase(BaseModel):
    employee_id: int = Field(..., description="The employee this availability belongs to")
    type: models.AvailabilityType = Field(default=models.AvailabilityType.available, description="Type of availability")
    name: Optional[str] = Field(None, max_length=50, description="Label (Vacation, Class Schedule, etc.)")

    # Date range
    start_date: date = Field(..., description="Start date of availability")
    end_date: Optional[date] = Field(None, description="End date of availability (null if one-day)")

    # Recurrence
    day_of_week: Optional[int] = Field(
        None, ge=0, le=6, description="Optional recurring day of week (0=Monday, 6=Sunday)"
    )

    # Time range
    start_time: Optional[time] = Field(None, description="Start time (null = all day)")
    end_time: Optional[time] = Field(None, description="End time (null = all day)")

    description: Optional[str] = Field(None, max_length=200, description="Extra notes")


# -------- Create Schema --------
class AvailabilityCreate(AvailabilityBase):
    """Schema for creating new availability"""
    pass


# -------- Update Schema --------
class AvailabilityUpdate(BaseModel):
    """Schema for updating an availability"""
    type: Optional[models.AvailabilityType]
    name: Optional[str]
    start_date: Optional[date]
    end_date: Optional[date]
    day_of_week: Optional[int]
    start_time: Optional[time]
    end_time: Optional[time]
    description: Optional[str]
    status: Optional[AvailabilityStatus]


# -------- Response Schema --------
class AvailabilityResponse(AvailabilityBase):
    """Schema for returning availability with DB fields"""
    id: int
    status: AvailabilityStatus = AvailabilityStatus.pending

    model_config = dict(from_attributes=True) 


# ----------------------- Announcements -----------------
class AnnouncementCreate(BaseModel):
    employer_id: int
    title: str
    message: str
    attachment_url: Optional[str] = None
    expires_at: Optional[date] = None

class AnnouncementOut(BaseModel):
    id: int
    employer_id: int
    title: str
    message: str
    attachment_url: Optional[str] = None
    created_at: date
    expires_at: Optional[date] = None

    model_config = dict(from_attributes=True)