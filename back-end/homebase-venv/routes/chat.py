import asyncio
from typing import Optional, List, Set
from datetime import datetime
import os
import shutil
import uuid
from schemas import ConversationCreateRequest  # import the Pydantic model

from fastapi import (
    APIRouter, Depends, UploadFile, File, Form, WebSocket,
    WebSocketDisconnect, HTTPException, Query, Request
)
from starlette import status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, and_
import schemas
from database import get_db
from models import Conversation, Participant, Message, Employee, Employer

router = APIRouter(prefix="/chat", tags=["Chat"])

# --------- File uploads ----------
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "uploads", "chat")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# --------- WS in-memory store ----------
active_connections = {}  # {conversation_id: List[WebSocket]}

# =========================
# Helper functions
# =========================
## ChatUser helpers removed. Use Employee/Employer directly.

def _ensure_conversation(db: Session, conversation_id: int) -> Conversation:
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conv

def _is_participant(db: Session, conversation_id: int, user_id: int) -> bool:
    return db.query(Participant).filter(
        Participant.conversation_id == conversation_id,
        (Participant.employee_id == user_id) | (Participant.employer_id == user_id)
    ).first() is not None

def _get_participant(db: Session, conversation_id: int, user_id: int) -> Optional[Participant]:
    return db.query(Participant).filter(
        Participant.conversation_id == conversation_id,
        (Participant.employee_id == user_id) | (Participant.employer_id == user_id)
    ).first()

def _is_admin(db: Session, conversation_id: int, user_id: int) -> bool:
    p = db.query(Participant).filter(
        Participant.conversation_id == conversation_id,
        (Participant.employee_id == user_id) | (Participant.employer_id == user_id)
    ).first()
    return bool(p and p.role == "admin")

def get_or_create_direct_conversation(db: Session, user_ids: List[int]) -> Conversation:
    """Return existing direct conversation between two users or create a new one.
       IMPORTANT: expects exactly 2 distinct user_ids (ChatUser IDs)."""
    if len(user_ids) != 2 or len(set(user_ids)) != 2:
        raise HTTPException(status_code=400, detail="Direct chat needs exactly two distinct users")

    # Find existing direct conversation with exactly those two participants
    existing = (
        db.query(Conversation)
        .join(Participant, Participant.conversation_id == Conversation.id)
        .filter(Conversation.type == "direct")
        .group_by(Conversation.id)
        .having(func.count(Participant.id) == 2)
        .all()
    )

    wanted = set(user_ids)
    for conv in existing:
        part_ids: Set[int] = {p.employee_id or p.employer_id for p in conv.participants if p.employee_id or p.employer_id}
        if part_ids == wanted:
            return conv

    # Create a new one
    conv = Conversation(type="direct", name=None)
    db.add(conv)
    db.commit()
    db.refresh(conv)

    # Add the two participants (no admin concept for direct)
    for pid in user_ids:
        db.add(Participant(employee_id=pid, conversation_id=conv.id, role="member"))
    db.commit()
    return conv

# =========================
# Team (Employees + Employers)
# =========================
@router.get("/team")
def get_connected_employees(
    request: Request,
    db: Session = Depends(get_db),
    employee_id: Optional[int] = Query(None),
    employer_id: Optional[int] = Query(None),
):
    if (employee_id and employer_id) or (not employee_id and not employer_id):
        raise HTTPException(
            status_code=400,
            detail="You must provide either employee_id or employer_id, but not both."
        )
    if not employer_id:
        flag = True

    DEFAULT_PROFILE_PIC = "/static/profile_pictures/1_20240627.jpg"
    result = []
    added_employers = set()

    if employee_id:
        employee = db.query(Employee).filter(Employee.id == employee_id).first()
        if not employee:
            raise HTTPException(status_code=404, detail="Employee not found")

        employer_id = employee.employer_id
        if not employer_id:
            raise HTTPException(status_code=400, detail="This employee has no employer assigned")

    employer = db.query(Employer).filter(Employer.id == employer_id).first()
    if not employer:
        raise HTTPException(status_code=404, detail="Employer not found")

    employees = db.query(Employee).filter(Employee.employer_id == employer_id).all()

    for emp in employees:
        if emp.id == employee_id:  # skip self if employee_id provided
            continue
        emp_pic = str(request.base_url) + (emp.profile_picture or DEFAULT_PROFILE_PIC).lstrip("/")
        result.append({
            "id": emp.id,
            "role": "employee",
            "full_name": f"{emp.first_name} {emp.last_name}",
            "profile_pic": emp_pic,
        })
    print(employer_id)
    if flag:
        emp_employer_pic = str(request.base_url) + (employer.profile_picture or DEFAULT_PROFILE_PIC).lstrip("/")
        result.append({
            "id": employer.id,
            "role": "employer",
            "full_name": f"{employer.first_name} {employer.last_name}",
            "profile_pic": emp_employer_pic,
        })

    return {"team": result}
# =========================
# Conversations
# =========================
@router.post("/conversation", response_model=schemas.ConversationResponse)
def create_conversation(request: ConversationCreateRequest, db: Session = Depends(get_db)):
    type = request.type
    participants = request.participants

    if type not in ["direct", "group"]:
        raise HTTPException(status_code=400, detail="Invalid type")

    if type == "direct":
        if len(participants) != 2:
            raise HTTPException(status_code=400, detail="Direct chat needs 2 participants")
        name = db.query(Employee).filter(Employee.id == participants[1]).first().first_name
        conv = Conversation(type="direct", name=name)
        db.add(conv)
        db.commit()
        db.refresh(conv)
        if request.roles[0] == "employee":
            db.add(Participant(employee_id=participants[0], conversation_id=conv.id))
        else:
            db.add(Participant(employer_id=participants[0], conversation_id=conv.id))
        if request.roles[1] == "employee":
            db.add(Participant(employee_id=participants[1], conversation_id=conv.id))
        else:
            db.add(Participant(employer_id=participants[1], conversation_id=conv.id))
        db.commit()
        db.refresh(conv)  # Refresh to load relationships
        return conv

    if type == "group":
        if len(participants) < 3:
            raise HTTPException(status_code=400, detail="Group chat needs 3+ participants")
        name = request.name
        if not name:
            raise HTTPException(status_code=400, detail="Group chat requires a name")
        conv = Conversation(type="group", name=name)
        db.add(conv)
        db.commit()
        db.refresh(conv)
        for idx, pid in enumerate(participants):
            if request.roles[idx] == "employee":
                db.add(Participant(employee_id=pid, conversation_id=conv.id, role="admin" if idx==0 else "member"))
            else:
                db.add(Participant(employer_id=pid, conversation_id=conv.id, role="admin" if idx==0 else "member"))
        db.commit()
        db.refresh(conv)  # Refresh to load relationships
        return conv


@router.get("/conversations/{user_id}")
def get_user_conversations(user_id: int, db: Session = Depends(get_db)):
    convs = (
        db.query(Conversation)
        .join(Participant)
        .filter(Participant.employee_id == user_id)
        .order_by(Conversation.last_message_at.desc())
        .all()
    )
    return [
        {
            "id": c.id,
            "name": c.name,
            "type": c.type,
            "created_at": c.created_at.isoformat(),
            "last_message_at": c.last_message_at.isoformat() if c.last_message_at else None
        } for c in convs
    ]

@router.get("/conversation/{conversation_id}/participants")
def list_participants(conversation_id: int, db: Session = Depends(get_db)):
    conv = _ensure_conversation(db, conversation_id)
    return [
        {"employee_id": p.employee_id, "employer_id": p.employer_id, "role": p.role, "joined_at": p.joined_at.isoformat()}
        for p in conv.participants
    ]

@router.post("/conversation/{conversation_id}/rename")
def rename_group(
    conversation_id: int,
    requester_id: int = Form(...),
    new_name: str = Form(...),
    db: Session = Depends(get_db)
):
    conv = _ensure_conversation(db, conversation_id)
    if conv.type != "group":
        raise HTTPException(status_code=400, detail="Only group conversations can be renamed")
    if not _is_admin(db, conversation_id, requester_id):
        raise HTTPException(status_code=403, detail="Only group admins can rename the group")

    conv.name = new_name.strip()
    db.commit()
    return {"id": conv.id, "name": conv.name, "type": conv.type}

@router.post("/conversation/{conversation_id}/participants/add")
def add_participants(
    conversation_id: int,
    requester_id: int = Form(...),
    participants: str = Form(...),  # CSV of ChatUser IDs
    db: Session = Depends(get_db)
):
    conv = _ensure_conversation(db, conversation_id)
    if conv.type != "group":
        raise HTTPException(status_code=400, detail="Can only add participants to group conversations")
    if not _is_admin(db, conversation_id, requester_id):
        raise HTTPException(status_code=403, detail="Only admins can add participants")

    try:
        new_ids = [int(x.strip()) for x in participants.split(",") if x.strip()]
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid participant ID")

    if not new_ids:
        raise HTTPException(status_code=400, detail="No participants provided")

    existing_ids = {p.employee_id for p in conv.participants if p.employee_id is not None}
    for uid in new_ids:
        if uid in existing_ids:
            continue
        db.add(Participant(employee_id=uid, conversation_id=conv.id, role="member"))
    db.commit()

    return {"id": conv.id, "added": new_ids}

@router.post("/conversation/{conversation_id}/participants/remove")
def remove_participant(
    conversation_id: int,
    requester_id: int = Form(...),
    user_id: int = Form(...),
    db: Session = Depends(get_db)
):
    conv = _ensure_conversation(db, conversation_id)
    if conv.type != "group":
        raise HTTPException(status_code=400, detail="Can only remove participants from group conversations")
    if not _is_admin(db, conversation_id, requester_id):
        raise HTTPException(status_code=403, detail="Only admins can remove participants")

    participant = db.query(Participant).filter(
        Participant.conversation_id == conversation_id,
        (Participant.employee_id == user_id) | (Participant.employer_id == user_id)
    ).first()
    if not participant:
        raise HTTPException(status_code=404, detail="User is not a participant")

    db.delete(participant)
    db.commit()
    return {"id": conv.id, "removed_user_id": user_id}

@router.post("/conversation/{conversation_id}/leave")
def leave_group(
    conversation_id: int,
    user_id: int = Form(...),
    db: Session = Depends(get_db)
):
    conv = _ensure_conversation(db, conversation_id)
    if conv.type != "group":
        raise HTTPException(status_code=400, detail="Only group conversations support leaving")

    participant = db.query(Participant).filter(
        Participant.conversation_id == conversation_id,
        (Participant.employee_id == user_id) | (Participant.employer_id == user_id)
    ).first()
    if not participant:
        raise HTTPException(status_code=404, detail="You are not in this conversation")

    # If admin leaves, transfer admin if possible
    if participant.role == "admin":
        others = db.query(Participant).filter(
            Participant.conversation_id == conversation_id,
            ~((Participant.employee_id == user_id) | (Participant.employer_id == user_id))
        ).all()
        if others:
            # Promote the earliest joined member
            new_admin = sorted(others, key=lambda p: p.joined_at)[0]
            new_admin.role = "admin"

    db.delete(participant)
    db.commit()
    return {"id": conv.id, "left_user_id": user_id}

@router.post("/conversation/{conversation_id}/admin")
def set_admin(
    conversation_id: int,
    requester_id: int = Form(...),
    target_user_id: int = Form(...),
    make_admin: bool = Form(...),
    db: Session = Depends(get_db)
):
    conv = _ensure_conversation(db, conversation_id)
    if conv.type != "group":
        raise HTTPException(status_code=400, detail="Only group conversations support admin changes")
    if not _is_admin(db, conversation_id, requester_id):
        raise HTTPException(status_code=403, detail="Only admins can change roles")

    participant = db.query(Participant).filter(
        Participant.conversation_id == conversation_id,
        (Participant.employee_id == target_user_id) | (Participant.employer_id == target_user_id)
    ).first()
    if not participant:
        raise HTTPException(status_code=404, detail="Target user is not a participant")

    participant.role = "admin" if make_admin else "member"
    db.commit()
    return {"id": conv.id, "user_id": target_user_id, "role": participant.role}

# =========================
# Messages
# =========================
@router.get("/messages/{conversation_id}")
def get_conversation_messages(conversation_id: int, db: Session = Depends(get_db)):
    msgs = (
        db.query(Message)
        .filter(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.asc())
        .all()
    )
    return [
        {
            "id": m.id,
            "sender_id": m.sender_id,
            "text": m.text,
            "attachment_url": m.attachment_url,
            "attachment_type": m.attachment_type,
            "created_at": m.created_at.isoformat()
        }
        for m in msgs
    ]

@router.post("/message")
def send_message(
    conversation_id: int = Form(...),
    sender_id: int = Form(...),
    text: Optional[str] = Form(None),
    file: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    conv = _ensure_conversation(db, conversation_id)

    # Only participants can send messages
    if not _is_participant(db, conversation_id, sender_id):
        raise HTTPException(status_code=403, detail="Only participants can send messages")

    attachment_url = None
    attachment_type = None
    if file:
        ext = os.path.splitext(file.filename)[1].lower()
        unique_filename = f"{uuid.uuid4()}{ext}"
        filepath = os.path.join(UPLOAD_FOLDER, unique_filename)
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        attachment_url = f"/uploads/chat/{unique_filename}"
        attachment_type = "audio" if ext in [".mp3", ".wav", ".m4a", ".ogg"] else "image"
    sender_id = _get_participant(db, conversation_id, sender_id).id
    
    msg = Message(
        conversation_id=conversation_id,
        sender_id=sender_id,
        text=text,
        attachment_url=attachment_url,
        attachment_type=attachment_type,
        created_at=datetime.utcnow()
    )
    db.add(msg)

    conv.last_message_at = datetime.utcnow()
    db.commit()
    db.refresh(msg)

    # WS notify
    if conversation_id in active_connections:
        payload = {
            "type": "message",
            "message": {
                "id": msg.id,
                "sender_id": msg.sender_id,
                "text": msg.text,
                "attachment_url": msg.attachment_url,
                "attachment_type": msg.attachment_type,
                "created_at": msg.created_at.isoformat()
            }
        }
        for ws in list(active_connections[conversation_id]):
            try:
                asyncio.create_task(ws.send_json(payload))
            except Exception:
                pass

    return {"message_id": msg.id}

# =========================
# Conversation deletion (safer)
# =========================
@router.delete("/chat/remover/conversation/{conversationId}")
def remove_conversation(
    conversationId: int,
    requester_id: int = Query(..., description="ChatUser id initiating the deletion"),
    db: Session = Depends(get_db)
):
    conv = _ensure_conversation(db, conversationId)

    # Only admins can delete a group; either participant can delete a direct
    if conv.type == "group":
        if not _is_admin(db, conversationId, requester_id):
            raise HTTPException(status_code=403, detail="Only a group admin can delete the conversation")
    else:
        if not _is_participant(db, conversationId, requester_id):
            raise HTTPException(status_code=403, detail="Only participants can delete this conversation")

    try:
        db.delete(conv)  # cascades messages + participants
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Deletion failed: {e}")

    return {"detail": f"Conversation {conversationId} deleted successfully"}

# =========================
# WebSocket
# =========================
@router.websocket("/ws/{conversation_id}")
async def websocket_endpoint(websocket: WebSocket, conversation_id: int):
    await websocket.accept()
    active_connections.setdefault(conversation_id, []).append(websocket)
    try:
        while True:
            data = await websocket.receive_json()  # expect JSON
            event_type = data.get("type")
            
            # Broadcast typing event
            if event_type == "typing":
                payload = {
                    "type": "typing",
                    "user_id": data.get("user_id"),
                    "display_name": data.get("display_name"),
                }
                for ws in list(active_connections[conversation_id]):
                    if ws != websocket:  # don't send to the typer
                        await ws.send_json(payload)
            
            # Broadcast normal message
            elif event_type == "message":
                payload = {
                    "type": "message",
                    "message": data.get("message")
                }
                for ws in list(active_connections[conversation_id]):
                    await ws.send_json(payload)

    except WebSocketDisconnect:
        active_connections[conversation_id].remove(websocket)
        if not active_connections[conversation_id]:
            del active_connections[conversation_id]
