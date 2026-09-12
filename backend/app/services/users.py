import re

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.entities import User

DEFAULT_ATTRIBUTES = {
    "intelligence": 0,
    "endurance": 0,
    "discipline": 0,
    "wisdom": 0,
    "creativity": 0,
    "social": 0,
}


def get_or_create_user(database: Session, identity: dict) -> User:
    firebase_uid = identity["uid"]
    user = database.scalar(select(User).where(User.firebase_uid == firebase_uid))
    if user:
        return user

    display_name = identity.get("name") or identity.get("email", "Grinder").split("@")[0]
    base_username = re.sub(r"[^a-zA-Z0-9_]", "", display_name).lower()[:24] or "grinder"
    username = base_username
    suffix = 1
    while database.scalar(select(User).where(User.username == username)):
        suffix += 1
        username = f"{base_username[:20]}{suffix}"

    user = User(
        firebase_uid=firebase_uid,
        email=identity.get("email"),
        username=username,
        display_name=display_name[:80],
        attributes=DEFAULT_ATTRIBUTES.copy(),
    )
    database.add(user)
    database.commit()
    database.refresh(user)
    return user
