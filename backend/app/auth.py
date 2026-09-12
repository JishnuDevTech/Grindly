import json
import base64
from functools import lru_cache

import firebase_admin
from fastapi import Depends, HTTPException, status
from firebase_admin import auth as firebase_auth, credentials
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.database import get_db
from app.settings import settings

bearer = HTTPBearer(auto_error=False)


@lru_cache
def firebase_ready() -> bool:
    service_account_json = settings.firebase_service_account_json
    if not service_account_json and settings.firebase_service_account_json_base64:
        service_account_json = base64.b64decode(settings.firebase_service_account_json_base64).decode("utf-8")
    if not service_account_json:
        return False
    if firebase_admin._apps:
        return True
    service_account = credentials.Certificate(json.loads(service_account_json))
    firebase_admin.initialize_app(service_account)
    return True


def current_identity(credentials_header: HTTPAuthorizationCredentials | None = Depends(bearer)) -> dict:
    if not credentials_header:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="A Firebase ID token is required")
    if not firebase_ready():
        if settings.environment == "development" and credentials_header.credentials == "dev-token":
            return {"uid": "local-development-user", "email": "dev@grindly.local", "name": "Local Grinder"}
        raise HTTPException(status_code=503, detail="Firebase verification is not configured")
    try:
        return firebase_auth.verify_id_token(credentials_header.credentials)
    except Exception as error:
        raise HTTPException(status_code=401, detail="Invalid Firebase ID token") from error


def current_user(identity: dict = Depends(current_identity), database: Session = Depends(get_db)):
    from app.services.users import get_or_create_user

    return get_or_create_user(database, identity)
