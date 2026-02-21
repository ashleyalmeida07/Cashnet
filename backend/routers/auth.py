"""
Firebase Auth authentication for Admin and Auditor roles.
Both roles share the `adminandauditor` table, differentiated by the `role` column.
Anyone not provisioned in that table is rejected with a 403.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import firebase_admin
from firebase_admin import auth as firebase_auth, credentials as fb_creds
from jose import jwt
from datetime import datetime, timedelta
from pydantic import BaseModel

from database import get_db
from models import AdminAuditor, AdminAuditorRoleEnum
from config import settings

# ─── Firebase Admin SDK init (once per process) ─────────────────────────────
if not firebase_admin._apps:
    # Uses GOOGLE_APPLICATION_CREDENTIALS env var pointing to service account JSON
    # or Application Default Credentials when running on GCP/Cloud Run.
    try:
        cred = fb_creds.ApplicationDefault()
    except Exception:
        # Fallback: if no credentials found, Firebase verify will raise on each call
        cred = None
    if cred is not None:
        firebase_admin.initialize_app(cred)

router = APIRouter(prefix="/auth", tags=["auth"])

# ─── Schemas ────────────────────────────────────────────────────────────────

class GoogleTokenRequest(BaseModel):
    credential: str          # Google ID token from frontend

class ProvisionRequest(BaseModel):
    secret: str              # Must match PROVISION_SECRET in env
    uid: str                 # Google UID (sub)
    email: str
    name: str
    picture: str = ""
    role: AdminAuditorRoleEnum

class UserOut(BaseModel):
    uid: str
    email: str
    name: str
    picture: str
    role: str
    token: str               # JWT for frontend session

    class Config:
        from_attributes = True

# ─── JWT helpers ────────────────────────────────────────────────────────────

def create_jwt(payload: dict) -> str:
    data = payload.copy()
    data["exp"] = datetime.utcnow() + timedelta(hours=12)
    return jwt.encode(data, settings.jwt_secret, algorithm="HS256")

# ─── Routes ─────────────────────────────────────────────────────────────────

@router.post("/google", response_model=UserOut)
def google_login(body: GoogleTokenRequest, db: Session = Depends(get_db)):
    """
    Verify Google ID token. Lookup UID in adminandauditor table.
    - If found   → return user + JWT
    - If missing → 403 "Admin or Auditor access only"
    """
    # 1. Verify Firebase ID token
    try:
        decoded = firebase_auth.verify_id_token(body.credential)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Invalid Firebase token: {e}")

    uid: str = decoded["uid"]
    email: str = decoded.get("email", "")
    name: str = decoded.get("name", email)
    picture: str = decoded.get("picture", "")

    # 2. Check provisioned table
    record = db.query(AdminAuditor).filter(AdminAuditor.uid == uid).first()

    # Also try email match in case uid wasn't stored yet (first-time provisioned by email)
    if not record:
        record = db.query(AdminAuditor).filter(AdminAuditor.email == email).first()
        if record:
            # Back-fill the UID now that we know it
            record.uid = uid
            db.commit()
            db.refresh(record)

    if not record:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": "access_denied",
                "message": "This portal is restricted to Admin and Auditor accounts only. "
                           "Contact the system operator to request access.",
            },
        )

    # 3. Update last_login
    record.last_login = datetime.utcnow()
    db.commit()

    # 4. Issue JWT
    token = create_jwt({"uid": uid, "email": email, "role": record.role.value})

    return UserOut(
        uid=uid,
        email=email,
        name=name,
        picture=picture,
        role=record.role.value,
        token=token,
    )


@router.post("/provision", status_code=status.HTTP_201_CREATED)
def provision_user(body: ProvisionRequest, db: Session = Depends(get_db)):
    """
    Operator-only endpoint to add an Admin or Auditor account.
    Requires PROVISION_SECRET from environment variables.
    """
    if body.secret != settings.provision_secret:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid provision secret")

    existing = db.query(AdminAuditor).filter(
        (AdminAuditor.uid == body.uid) | (AdminAuditor.email == body.email)
    ).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="User already provisioned")

    record = AdminAuditor(
        uid=body.uid,
        email=body.email,
        name=body.name,
        picture=body.picture,
        role=body.role,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return {"message": f"{record.role.value} account provisioned", "email": record.email}


@router.get("/adminandauditor", tags=["auth"])
def list_admin_auditors(db: Session = Depends(get_db)):
    """List all provisioned admin/auditor accounts (admin use only in production)."""
    records = db.query(AdminAuditor).all()
    return [
        {"uid": r.uid, "email": r.email, "name": r.name, "role": r.role.value, "created_at": r.created_at}
        for r in records
    ]
