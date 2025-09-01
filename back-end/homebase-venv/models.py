from pydantic import BaseModel, Field
from datetime import datetime, time, date
from typing import Optional
from sqlalchemy import (
    Column, Integer, String, ForeignKey, Time, DateTime, Date, UniqueConstraint,
    Index, Enum, Boolean
)
from sqlalchemy.orm import relationship
from database import Base
import enum
from sqlalchemy.types import Enum as SQLEnum

# ---------------------- Chat & Users ----------------------

class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    dob = Column(Date, nullable=True)
    phone_number = Column(String(20), unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    profile_picture = Column(String, nullable=True)

    employer_id = Column(Integer, ForeignKey("employers.id"), nullable=False)
    employer = relationship("Employer", back_populates="employees")
    availabilities = relationship("EmployeeAvailability", back_populates="employee", cascade="all, delete-orphan")


class Employer(Base):
    __tablename__ = "employers"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone_number = Column(String(20), unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    profile_picture = Column(String, nullable=True)

    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    company = relationship("Company", back_populates="employers")

    employees = relationship("Employee", back_populates="employer", cascade="all, delete-orphan")


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, index=True, nullable=False)
    kind = Column(String, nullable=False)
    primary_location = Column(String, nullable=True)
    number_of_employees = Column(String, nullable=False)
    number_of_locations = Column(String, nullable=False)
    open_date = Column(Date, nullable=True)
    selected_services = Column(String, nullable=True)

    employers = relationship("Employer", back_populates="company", cascade="all, delete-orphan")




class Conversation(Base):
    __tablename__ = "conversations"
    __table_args__ = (UniqueConstraint('type', 'name', name='uq_group_name'),)

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=True)  # Group chat name
    type = Column(String(20), nullable=False)  # 'direct' or 'group'
    created_at = Column(DateTime, default=datetime.utcnow)
    last_message_at = Column(DateTime, default=datetime.utcnow, index=True)

    participants = relationship("Participant", back_populates="conversation", cascade="all, delete-orphan")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")


class Participant(Base):
    __tablename__ = "participants"
    __table_args__ = (
        Index('ix_employee_conversation', 'employee_id', 'conversation_id'),
        Index('ix_employer_conversation', 'employer_id', 'conversation_id'),
    )

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=True)
    employer_id = Column(Integer, ForeignKey("employers.id", ondelete="CASCADE"), nullable=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=False)
    role = Column(String(20), default="member")  # 'member' or 'admin'
    joined_at = Column(DateTime, default=datetime.utcnow)

    employee = relationship("Employee")
    employer = relationship("Employer")
    conversation = relationship("Conversation", back_populates="participants")


class Message(Base):
    __tablename__ = "messages"
    __table_args__ = (Index('ix_conversation_created', 'conversation_id', 'created_at'),)

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=False)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=True)
    employer_id = Column(Integer, ForeignKey("employers.id", ondelete="CASCADE"), nullable=True)

    text = Column(String, nullable=True)
    attachment_url = Column(String, nullable=True)
    attachment_type = Column(String(20), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    conversation = relationship("Conversation", back_populates="messages")
    employee = relationship("Employee")
    employer = relationship("Employer")
<<<<<<< HEAD
=======
    
# ---------------------- Announcements ------------
class Announcement(Base):
    __tablename__ = "announcements"
    __table_args__ = (
        Index("ix_announcement_employer_created", "employer_id", "created_at"),
    )

    id = Column(Integer, primary_key=True, index=True)
    employer_id = Column(Integer, ForeignKey("employers.id"), nullable=False)

    title = Column(String(100), nullable=False)
    message = Column(String, nullable=False)
    attachment_url = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)  # optional expiry

    employer = relationship("Employer", backref="announcements")

class AnnouncementRecipient(Base):
    __tablename__ = "announcement_recipients"

    id = Column(Integer, primary_key=True, index=True)
    announcement_id = Column(Integer, ForeignKey("announcements.id", ondelete="CASCADE"), nullable=False)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False)

    read = Column(Boolean, default=False)
    read_at = Column(DateTime, nullable=True)

    announcement = relationship("Announcement", backref="recipients")
    employee = relationship("Employee")
>>>>>>> 096c644 (new)

# ---------------------- ShiftSchedule ------------

class ShiftStatus(str,enum.Enum):
    scheduled = "scheduled"
    in_progress = "in_progress"
    completed = "completed"
    cancelled = "cancelled"

class PublishStatus(str,enum.Enum):
    unpublished = "unpublished"
    published = "published"

class Shift(Base):
    __tablename__ = "shifts"
    __table_args__ = (
        Index("ix_shift_employer_start", "employer_id", "start_time"),
    )

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=True)  # allow unassigned/open shifts
    employer_id = Column(Integer, ForeignKey("employers.id"), nullable=False)

    role = Column(String(50), nullable=False)  # e.g. "Lifeguard", "Outdoor Guard"
    location = Column(String(100), nullable=True)
    title = Column(String(100), nullable=False)   # e.g. "Morning Shift"
    description = Column(String, nullable=True)   # optional notes
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)

    status = Column(Enum(ShiftStatus), default=ShiftStatus.scheduled)
    publish_status = Column(Enum(PublishStatus), default=PublishStatus.unpublished)

    created_at = Column(DateTime, default=datetime.utcnow)

    employee = relationship("Employee", backref="shifts")
    employer = relationship("Employer", backref="shifts")
    cover_requests = relationship("ShiftCoverRequest", back_populates="shift", cascade="all, delete-orphan")
    trade_requests = relationship("ShiftTradeRequest", back_populates="shift", cascade="all, delete-orphan")

# --------------- Availabilities ----------

# Enum (to keep consistency with SQLAlchemy)
class AvailabilityType(str, enum.Enum):
    available = "available"
    unavailable = "unavailable"
    


class AvailabilityStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class EmployeeAvailability(Base):
    __tablename__ = "employee_availabilities"
    __table_args__ = (
        Index("ix_avail_emp_start", "employee_id", "start_date"),
    )

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)

    type = Column(SQLEnum(AvailabilityType, name="availability_type"), default=AvailabilityType.available)
    name = Column(String(50), nullable=True)

    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    day_of_week = Column(Integer, nullable=True)
    start_time = Column(Time, nullable=True)
    end_time = Column(Time, nullable=True)
    description = Column(String(200), nullable=True)
    status = Column(String, default="pending")

    employee = relationship("Employee", back_populates="availabilities")

# ----------------- Requests -----------------

class RequestStatus(str, enum.Enum):
    pending = "pending"
    accepted = "accepted"
    rejected = "rejected"

class ShiftCoverRequest(Base):
    __tablename__ = "shift_cover_requests"

    id = Column(Integer, primary_key=True, index=True)
    shift_id = Column(Integer, ForeignKey("shifts.id", ondelete="CASCADE"), nullable=False)
    requester_id = Column(Integer, ForeignKey("employees.id"), nullable=False)

    status = Column(Enum(RequestStatus), default=RequestStatus.pending)
    created_at = Column(DateTime, default=datetime.utcnow)

    shift = relationship("Shift", back_populates="cover_requests")
    requester = relationship("Employee")


class ShiftTradeRequest(Base):
    __tablename__ = "shift_trade_requests"

    id = Column(Integer, primary_key=True, index=True)
    shift_id = Column(Integer, ForeignKey("shifts.id", ondelete="CASCADE"), nullable=False)
    proposer_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    target_employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)

    status = Column(Enum(RequestStatus), default=RequestStatus.pending)
    created_at = Column(DateTime, default=datetime.utcnow)

    shift = relationship("Shift", back_populates="trade_requests")
    proposer = relationship("Employee", foreign_keys=[proposer_id])
    target_employee = relationship("Employee", foreign_keys=[target_employee_id])