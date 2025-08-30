from datetime import datetime, time, date
from sqlalchemy import (
    Column, Integer, String, ForeignKey, Time, DateTime, Date, UniqueConstraint,
    Index, Enum, Boolean
)
from sqlalchemy.orm import relationship
from database import Base
import enum

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
    chat_user = relationship("ChatUser", back_populates="employee", uselist=False)


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
    chat_user = relationship("ChatUser", back_populates="employer", uselist=False)


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


class ChatUser(Base):
    __tablename__ = "chat_users"
    __table_args__ = (
        UniqueConstraint('employee_id', name='uq_chatuser_employee'),
        UniqueConstraint('employer_id', name='uq_chatuser_employer'),
    )

    id = Column(Integer, primary_key=True, index=True)
    role = Column(String(20), nullable=False)  # 'employee' or 'employer'
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=True, unique=True)
    employer_id = Column(Integer, ForeignKey("employers.id"), nullable=True, unique=True)

    display_name = Column(String(50), nullable=False)
    profile_picture = Column(String(255), nullable=True)

    messages = relationship("Message", back_populates="sender", cascade="all, delete-orphan")
    employee = relationship("Employee", back_populates="chat_user")
    employer = relationship("Employer", back_populates="chat_user")
    participants = relationship("Participant", back_populates="user", cascade="all, delete-orphan")


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
    __table_args__ = (Index('ix_user_conversation', 'user_id', 'conversation_id', unique=True),)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("chat_users.id", ondelete="CASCADE"), nullable=False)
    conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=False)
    role = Column(String(20), default="member")  # 'member' or 'admin'
    joined_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("ChatUser")
    conversation = relationship("Conversation", back_populates="participants")


class Message(Base):
    __tablename__ = "messages"
    __table_args__ = (Index('ix_conversation_created', 'conversation_id', 'created_at'),)

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=False)
    sender_id = Column(Integer, ForeignKey("chat_users.id", ondelete="CASCADE"), nullable=False)

    text = Column(String, nullable=True)
    attachment_url = Column(String, nullable=True)
    attachment_type = Column(String(20), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    conversation = relationship("Conversation", back_populates="messages")
    sender = relationship("ChatUser", back_populates="messages")

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
    name = Column(String(50), nullable=True)  # label like "Vacation" (optional)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    #is_time_off = Column(Boolean, default=False)  # true = employee is not available

    # Range
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)  # if null, applies to start_date only

    # Optional recurring pattern
    day_of_week = Column(Integer, nullable=True)  # 0 = Monday, 6 = Sunday

    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    description = Column(String(200), nullable=True)

    status = Column(Enum(AvailabilityStatus), default=AvailabilityStatus.pending)

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

# class Announcements(Base):
#     __tablename__ 