from datetime import date, datetime, timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict, Field, field_validator
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.auth import current_user
from app.database import get_db
from app.models.entities import (
    AIAction, Activity, Friendship, InventoryItem, Notification, Quest, QuestSession,
    User, UserPreference,
)
from app.reward_engine import calculate_reward
from app.settings import settings

router = APIRouter()

SHOP_ITEMS = [
    {"id": "golden-frame", "name": "Golden Frame", "category": "Profile Frame", "price": 500, "rarity": "Rare", "preview": "golden-frame", "locked": False},
    {"id": "legendary-border", "name": "Legendary Border", "category": "Profile Frame", "price": 2000, "rarity": "Legendary", "preview": "legendary-border", "locked": False},
    {"id": "neon-nameplate", "name": "Neon Nameplate", "category": "Nameplate", "price": 750, "rarity": "Epic", "preview": "neon-nameplate", "locked": False},
    {"id": "shadow-theme", "name": "Shadow Theme", "category": "Theme", "price": 300, "rarity": "Common", "preview": "shadow-theme", "locked": False},
    {"id": "particle-effects", "name": "Particle Effects", "category": "XP Effect", "price": 1500, "rarity": "Epic", "preview": "particle-effects", "locked": False},
    {"id": "mythic-aura", "name": "Mythic Aura", "category": "Avatar Effect", "price": 5000, "rarity": "Mythic", "preview": "mythic-aura", "locked": True, "unlocksAt": "Level 50"},
    {"id": "rainbow-wings", "name": "Rainbow Wings", "category": "Avatar Effect", "price": 3000, "rarity": "Legendary", "preview": "rainbow-wings", "locked": True, "unlocksAt": "Chest #42"},
    {"id": "champion-badge", "name": "Champion Badge", "category": "Badge", "price": 1000, "rarity": "Rare", "preview": "champion-badge", "locked": False},
]


class QuestCreate(BaseModel):
    title: str = Field(min_length=3, max_length=120)
    description: str = Field(default="", max_length=1000)
    category: str = Field(min_length=2, max_length=32)
    difficulty: str
    priority: str = "Medium"
    estimated_minutes: int = Field(ge=5, le=480)

    @field_validator("difficulty")
    @classmethod
    def validate_difficulty(cls, value: str) -> str:
        if value not in {"Easy", "Medium", "Hard"}:
            raise ValueError("Difficulty must be Easy, Medium, or Hard")
        return value

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, value: str) -> str:
        if value not in {"Low", "Medium", "High"}:
            raise ValueError("Priority must be Low, Medium, or High")
        return value


class UserSetup(BaseModel):
    display_name: str = Field(min_length=1, max_length=80)
    username: str = Field(min_length=3, max_length=32)
    avatar: str = Field(default="avatar-1", max_length=500000)


class FriendRequest(BaseModel):
    username: str | None = Field(default=None, min_length=3, max_length=32)
    user_id: int | None = Field(default=None, alias="userId")
    model_config = ConfigDict(populate_by_name=True)


class PreferenceUpdate(BaseModel):
    values: dict[str, Any] = Field(default_factory=dict)
    model_config = ConfigDict(extra="allow")


class AIActionRequest(BaseModel):
    action: str = Field(min_length=1, max_length=64)
    input: dict[str, Any] = Field(default_factory=dict)


def serialize_user(user: User) -> dict[str, Any]:
    return {
        "id": user.id,
        "username": user.username,
        "displayName": user.display_name,
        "email": user.email,
        "avatar": user.avatar,
        "onboardingCompleted": user.onboarding_completed,
        "level": user.level,
        "experience": user.experience,
        "nextLevelExp": user.next_level_exp,
        "coins": user.coins,
        "streak": user.streak,
        "bestStreak": user.best_streak,
        "globalRank": 0,
        "friendRank": 0,
        "joinedDate": user.created_at.date().isoformat(),
        "attributes": user.attributes or {},
    }


def serialize_quest(quest: Quest, active_session: QuestSession | None = None) -> dict[str, Any]:
    elapsed = 0
    if active_session and active_session.active:
        elapsed = max(0, int((datetime.utcnow() - active_session.started_at).total_seconds()))
    return {
        "id": quest.id,
        "title": quest.title,
        "description": quest.description,
        "category": quest.category,
        "difficulty": quest.difficulty,
        "priority": quest.priority,
        "estimatedMinutes": quest.estimated_minutes,
        "estimatedTime": f"{quest.estimated_minutes} min",
        "status": quest.status,
        "startedAt": active_session.started_at.isoformat() + "Z" if active_session else None,
        "elapsedSeconds": elapsed,
        "requiredSeconds": quest.estimated_minutes * 60,
        "completed": quest.status == "completed",
        "rewardClaimed": quest.reward_claimed,
        "xp": quest.reward_xp,
        "coins": quest.reward_coins,
        "createdAt": quest.created_at.isoformat() + "Z",
    }


def _friend_ids(database: Session, user_id: int) -> set[int]:
    rows = database.scalars(select(Friendship).where(
        ((Friendship.requester_id == user_id) | (Friendship.addressee_id == user_id)),
        Friendship.status == "accepted",
    )).all()
    return {row.addressee_id if row.requester_id == user_id else row.requester_id for row in rows}


def _relationship(database: Session, first: int, second: int) -> Friendship | None:
    return database.scalar(select(Friendship).where(
        ((Friendship.requester_id == first) & (Friendship.addressee_id == second))
        | ((Friendship.requester_id == second) & (Friendship.addressee_id == first))
    ))


def serialize_notification(item: Notification) -> dict[str, Any]:
    return {"id": item.id, "kind": item.kind, "title": item.title, "message": item.message,
            "payload": item.payload or {}, "read": item.read_at is not None,
            "createdAt": item.created_at.isoformat() + "Z"}


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/me")
def get_me(user: User = Depends(current_user), database: Session = Depends(get_db)) -> dict[str, Any]:
    completed = database.scalar(select(func.count(Quest.id)).where(Quest.user_id == user.id, Quest.status == "completed")) or 0
    category_rows = database.execute(
        select(Quest.category, func.count(Quest.id))
        .where(Quest.user_id == user.id, Quest.status == "completed")
        .group_by(Quest.category)
    ).all()
    rank = database.scalar(select(func.count(User.id)).where(User.experience > user.experience)) or 0
    payload = serialize_user(user)
    payload["globalRank"] = rank + 1
    payload["completedQuests"] = completed
    payload["completedQuestCount"] = completed
    payload["friendCount"] = database.scalar(select(func.count(Friendship.id)).where(
        Friendship.status == "accepted",
        ((Friendship.requester_id == user.id) | (Friendship.addressee_id == user.id)),
    )) or 0
    payload["categoryCounts"] = {category: count for category, count in category_rows}
    payload["activity"] = [
        {"id": item.id, "title": item.title, "detail": item.detail, "time": item.created_at.isoformat() + "Z",
         "createdAt": item.created_at.isoformat() + "Z", "date": item.created_at.date().isoformat(), "icon": item.kind}
        for item in database.scalars(select(Activity).where(Activity.user_id == user.id).order_by(Activity.created_at.desc()).limit(10))
    ]
    payload["achievements"] = []
    if completed >= 1:
        payload["achievements"].append({"id": "first-steps", "name": "First Steps", "description": "Complete your first quest", "icon": "✓", "rarity": "Common"})
    if user.streak >= 7:
        payload["achievements"].append({"id": "seven-streak", "name": "Seven-Day Signal", "description": "Maintain a 7-day streak", "icon": "streak", "rarity": "Rare"})
    if completed >= 50:
        payload["achievements"].append({"id": "fifty-quests", "name": "Seasoned Grinder", "description": "Complete 50 quests", "icon": "medal", "rarity": "Epic"})
    return payload


@router.patch("/me")
def update_me(payload: UserSetup, user: User = Depends(current_user), database: Session = Depends(get_db)) -> dict[str, Any]:
    existing = database.scalar(select(User).where(User.username == payload.username, User.id != user.id))
    if existing:
        raise HTTPException(status_code=409, detail="Username is already taken")
    user.display_name = payload.display_name
    user.username = payload.username
    user.avatar = payload.avatar
    user.onboarding_completed = True
    database.commit()
    database.refresh(user)
    return serialize_user(user)


@router.get("/quests")
def list_quests(user: User = Depends(current_user), database: Session = Depends(get_db)) -> list[dict[str, Any]]:
    quests = database.scalars(select(Quest).where(Quest.user_id == user.id).order_by(Quest.created_at.desc())).all()
    return [serialize_quest(quest, database.scalar(select(QuestSession).where(QuestSession.quest_id == quest.id, QuestSession.active.is_(True)))) for quest in quests]


@router.post("/quests", status_code=status.HTTP_201_CREATED)
def create_quest(payload: QuestCreate, user: User = Depends(current_user), database: Session = Depends(get_db)) -> dict[str, Any]:
    today = date.today()
    duplicate = database.scalar(select(Quest).where(Quest.user_id == user.id, Quest.title == payload.title, func.date(Quest.created_at) == today))
    if duplicate:
        raise HTTPException(status_code=409, detail="A quest with this title already exists today")
    quest = Quest(user_id=user.id, **payload.model_dump())
    database.add(quest)
    database.commit()
    database.refresh(quest)
    return serialize_quest(quest)


@router.post("/quests/{quest_id}/start")
def start_quest(quest_id: int, user: User = Depends(current_user), database: Session = Depends(get_db)) -> dict[str, Any]:
    quest = database.scalar(select(Quest).where(Quest.id == quest_id, Quest.user_id == user.id))
    if not quest:
        raise HTTPException(status_code=404, detail="Quest not found")
    if quest.status == "completed":
        raise HTTPException(status_code=409, detail="Completed quests cannot be started again")
    active_quest = database.scalar(select(Quest).where(Quest.user_id == user.id, Quest.status == "active", Quest.id != quest.id))
    if active_quest:
        raise HTTPException(status_code=409, detail={"code": "ACTIVE_QUEST_EXISTS", "activeQuestId": active_quest.id, "message": "Finish your current quest first. One quest at a time."})
    session = database.scalar(select(QuestSession).where(QuestSession.quest_id == quest.id, QuestSession.user_id == user.id))
    if session and session.active:
        return serialize_quest(quest, session)
    if session:
        session.started_at = datetime.utcnow()
        session.stopped_at = None
        session.active = True
    else:
        session = QuestSession(quest_id=quest.id, user_id=user.id)
        database.add(session)
    quest.status = "active"
    quest.started_at = datetime.utcnow()
    database.commit()
    database.refresh(session)
    return serialize_quest(quest, session)


@router.post("/quests/{quest_id}/complete")
def complete_quest(quest_id: int, user: User = Depends(current_user), database: Session = Depends(get_db)) -> dict[str, Any]:
    quest = database.scalar(select(Quest).where(Quest.id == quest_id, Quest.user_id == user.id).with_for_update())
    if not quest:
        raise HTTPException(status_code=404, detail="Quest not found")
    if quest.reward_claimed or quest.status == "completed":
        raise HTTPException(status_code=409, detail="Reward has already been claimed")
    session = database.scalar(select(QuestSession).where(QuestSession.quest_id == quest.id, QuestSession.user_id == user.id, QuestSession.active.is_(True)))
    if not session:
        raise HTTPException(status_code=409, detail="Start the quest before completing it")
    elapsed = int((datetime.utcnow() - session.started_at).total_seconds())
    required = quest.estimated_minutes * 60
    if elapsed < required:
        raise HTTPException(status_code=409, detail={"code": "TIMER_NOT_SATISFIED", "remainingSeconds": required - elapsed, "message": "Keep the quest active until its required time has elapsed"})

    completed_today = database.scalar(select(func.count(Quest.id)).where(Quest.user_id == user.id, Quest.status == "completed", func.date(Quest.completed_at) == date.today())) or 0
    reward = calculate_reward(difficulty=quest.difficulty, priority=quest.priority, category=quest.category, estimated_minutes=quest.estimated_minutes, current_streak=user.streak, completed_today=completed_today)
    today = date.today()
    if user.last_completed_on == today:
        next_streak = user.streak
    elif user.last_completed_on == today - timedelta(days=1):
        next_streak = user.streak + 1
    else:
        next_streak = 1
    user.streak = next_streak
    user.best_streak = max(user.best_streak, next_streak)
    user.last_completed_on = today
    user.coins += reward.coins
    user.experience += reward.xp
    while user.experience >= user.next_level_exp:
        user.experience -= user.next_level_exp
        user.level += 1
        user.next_level_exp = round(900 + user.level * 180 + user.level ** 1.45 * 24)
    attributes = dict(user.attributes or {})
    attributes[reward.attribute] = min(100, attributes.get(reward.attribute, 0) + reward.attribute_points)
    user.attributes = attributes
    quest.status = "completed"
    quest.completed_at = datetime.utcnow()
    quest.reward_claimed = True
    quest.reward_xp = reward.xp
    quest.reward_coins = reward.coins
    session.active = False
    session.stopped_at = datetime.utcnow()
    database.add(Activity(user_id=user.id, kind="check", title=f"Completed {quest.title}", detail=f"+{reward.xp} XP · +{reward.coins} coins"))
    database.commit()
    database.refresh(quest)
    return {"quest": serialize_quest(quest), "reward": {"xp": reward.xp, "coins": reward.coins, "attribute": reward.attribute, "attributePoints": reward.attribute_points, "antiSpamMultiplier": reward.anti_spam_multiplier}, "user": serialize_user(user)}


@router.get("/leaderboard")
def leaderboard(user: User = Depends(current_user), database: Session = Depends(get_db)) -> list[dict[str, Any]]:
    users = database.scalars(select(User).order_by(User.experience.desc(), User.level.desc()).limit(100)).all()
    return [{"rank": index + 1, "id": entry.id, "username": entry.username, "displayName": entry.display_name,
             "avatar": entry.avatar, "level": entry.level, "xp": entry.experience,
             "isCurrentUser": entry.id == user.id} for index, entry in enumerate(users)]


@router.get("/shop")
def shop(user: User = Depends(current_user), database: Session = Depends(get_db)) -> list[dict[str, Any]]:
    owned = {item.item_id: item.equipped for item in database.scalars(select(InventoryItem).where(InventoryItem.user_id == user.id))}
    return [{**item, "owned": item["id"] in owned, "equipped": owned.get(item["id"], False)} for item in SHOP_ITEMS]


@router.post("/shop/{item_id}/purchase")
def purchase(item_id: str, user: User = Depends(current_user), database: Session = Depends(get_db)) -> dict[str, Any]:
    item = next((entry for entry in SHOP_ITEMS if entry["id"] == item_id), None)
    if not item or item["locked"]:
        raise HTTPException(status_code=404, detail="Item is not available")
    if database.scalar(select(InventoryItem).where(InventoryItem.user_id == user.id, InventoryItem.item_id == item_id)):
        raise HTTPException(status_code=409, detail="Item already owned")
    if user.coins < item["price"]:
        raise HTTPException(status_code=409, detail="Not enough coins")
    user.coins -= item["price"]
    database.add(InventoryItem(user_id=user.id, item_id=item_id))
    database.commit()
    return {"item": {**item, "owned": True}, "user": serialize_user(user)}


@router.get("/friends/search")
def search_friends(q: str = "", user: User = Depends(current_user), database: Session = Depends(get_db)) -> list[dict[str, Any]]:
    if not q.strip():
        return []
    matches = database.scalars(select(User).where(
        User.id != user.id,
        (User.username.ilike(f"%{q.strip()}%") | User.display_name.ilike(f"%{q.strip()}%")),
    ).limit(25)).all()
    friend_ids = _friend_ids(database, user.id)
    results = []
    for item in matches:
        relationship = _relationship(database, user.id, item.id)
        results.append({"id": item.id, "username": item.username, "displayName": item.display_name,
                        "avatar": item.avatar, "level": item.level,
                        "relationship": "friends" if item.id in friend_ids else
                        (relationship.status if relationship and relationship.requester_id == user.id else
                         ("incoming" if relationship else "none")),
                        "relationshipId": relationship.id if relationship else None})
    return results


@router.get("/friends")
def list_friends(user: User = Depends(current_user), database: Session = Depends(get_db)) -> list[dict[str, Any]]:
    ids = _friend_ids(database, user.id)
    friends = database.scalars(select(User).where(User.id.in_(ids)).order_by(User.experience.desc())).all() if ids else []
    return [{
        "id": item.id, "username": item.username, "displayName": item.display_name,
        "avatar": item.avatar, "level": item.level, "xp": item.experience,
        "streak": item.streak,
        "completedQuests": database.scalar(select(func.count(Quest.id)).where(Quest.user_id == item.id, Quest.status == "completed")) or 0,
    } for item in friends]


@router.post("/friends/requests", status_code=status.HTTP_201_CREATED)
def send_friend_request(payload: FriendRequest, user: User = Depends(current_user), database: Session = Depends(get_db)) -> dict[str, Any]:
    target = database.scalar(select(User).where(User.id == payload.user_id)) if payload.user_id else database.scalar(select(User).where(User.username == payload.username))
    if not target or target.id == user.id:
        raise HTTPException(status_code=404, detail="User not found")
    existing = _relationship(database, user.id, target.id)
    if existing:
        if existing.status == "rejected":
            database.delete(existing)
            database.flush()
            existing = None
    if existing:
        if existing.status == "pending" and existing.addressee_id == user.id:
            existing.status = "accepted"
            database.add(Notification(user_id=target.id, kind="friend", title="Friend request accepted", message=f"{user.display_name} accepted your request", payload={"username": user.username}))
            database.commit()
            return {"status": "accepted"}
        raise HTTPException(status_code=409, detail="A relationship already exists")
    relationship = Friendship(requester_id=user.id, addressee_id=target.id)
    database.add(relationship)
    database.add(Notification(user_id=target.id, kind="friend", title="New friend request", message=f"{user.display_name} sent you a friend request", payload={"userId": user.id}))
    database.commit()
    return {"id": relationship.id, "status": relationship.status}


@router.get("/friends/requests")
def friend_requests(user: User = Depends(current_user), database: Session = Depends(get_db)) -> dict[str, list[dict[str, Any]]]:
    incoming = database.scalars(select(Friendship).where(Friendship.addressee_id == user.id, Friendship.status == "pending")).all()
    outgoing = database.scalars(select(Friendship).where(Friendship.requester_id == user.id, Friendship.status == "pending")).all()
    def render(row: Friendship, incoming_request: bool) -> dict[str, Any]:
        person = database.get(User, row.requester_id if incoming_request else row.addressee_id)
        return {"id": row.id, "userId": person.id, "username": person.username, "displayName": person.display_name, "avatar": person.avatar, "createdAt": row.created_at.isoformat() + "Z"}
    return {"incoming": [render(row, True) for row in incoming], "outgoing": [render(row, False) for row in outgoing]}


def _change_request(request_id: int, action: str, user: User, database: Session) -> dict[str, Any]:
    row = database.scalar(select(Friendship).where(Friendship.id == request_id, Friendship.addressee_id == user.id, Friendship.status == "pending"))
    if not row:
        raise HTTPException(status_code=404, detail="Friend request not found")
    row.status = "accepted" if action == "accept" else "rejected"
    requester = database.get(User, row.requester_id)
    database.add(Notification(user_id=requester.id, kind="friend", title=f"Friend request {row.status}", message=f"{user.display_name} {row.status} your request"))
    database.commit()
    return {"status": row.status, "friendId": requester.id}


@router.post("/friends/requests/{request_id}/accept")
def accept_friend_request(request_id: int, user: User = Depends(current_user), database: Session = Depends(get_db)) -> dict[str, Any]:
    return _change_request(request_id, "accept", user, database)


@router.post("/friends/requests/{request_id}/reject")
def reject_friend_request(request_id: int, user: User = Depends(current_user), database: Session = Depends(get_db)) -> dict[str, Any]:
    return _change_request(request_id, "reject", user, database)


@router.delete("/friends/{friend_id}")
def remove_friend(friend_id: int, user: User = Depends(current_user), database: Session = Depends(get_db)) -> dict[str, str]:
    row = _relationship(database, user.id, friend_id)
    if not row or row.status != "accepted":
        raise HTTPException(status_code=404, detail="Friend not found")
    database.delete(row)
    database.commit()
    return {"status": "removed"}


@router.get("/friends/leaderboard")
def friend_leaderboard(user: User = Depends(current_user), database: Session = Depends(get_db)) -> list[dict[str, Any]]:
    ids = _friend_ids(database, user.id) | {user.id}
    users = database.scalars(select(User).where(User.id.in_(ids)).order_by(User.experience.desc(), User.level.desc())).all()
    return [{"rank": index + 1, "id": item.id, "username": item.username, "displayName": item.display_name,
             "avatar": item.avatar, "level": item.level, "xp": item.experience, "isCurrentUser": item.id == user.id}
            for index, item in enumerate(users)]


@router.get("/users/{username}/profile")
@router.get("/profile/{username}")
def public_profile(username: str, user: User = Depends(current_user), database: Session = Depends(get_db)) -> dict[str, Any]:
    target = database.scalar(select(User).where(User.username == username))
    if not target:
        raise HTTPException(status_code=404, detail="Profile not found")
    prefs = database.get(UserPreference, target.id)
    values = prefs.values if prefs else {}
    visibility = values.get("profile_visibility", "public")
    is_friend = target.id in _friend_ids(database, user.id)
    relationship = _relationship(database, user.id, target.id)
    relationship_state = "friends" if is_friend else (
        relationship.status if relationship and relationship.requester_id == user.id else
        "incoming" if relationship else "none"
    )
    friend_count = database.scalar(select(func.count(Friendship.id)).where(
        Friendship.status == "accepted",
        ((Friendship.requester_id == target.id) | (Friendship.addressee_id == target.id)),
    )) or 0
    if target.id != user.id and (visibility == "private" or (visibility == "friends" and not is_friend)):
        return {"id": target.id, "username": target.username, "displayName": target.display_name,
                "avatar": target.avatar, "friendCount": friend_count,
                "relationship": relationship_state, "relationshipId": relationship.id if relationship else None,
                "private": True}
    result = {"id": target.id, "username": target.username, "displayName": target.display_name, "avatar": target.avatar,
              "level": target.level, "streak": target.streak, "bestStreak": target.best_streak,
              "experience": target.experience, "joinedDate": target.created_at.date().isoformat(), "private": False}
    result["relationship"] = relationship_state
    result["relationshipId"] = relationship.id if relationship else None
    result["friendCount"] = friend_count
    if values.get("show_email", False) and target.id == user.id:
        result["email"] = target.email
    if values.get("show_stats", True):
        result["attributes"] = target.attributes or {}
        completed = database.scalar(select(func.count(Quest.id)).where(Quest.user_id == target.id, Quest.status == "completed")) or 0
        result["completedQuests"] = completed
        result["achievements"] = [
            {"id": "first-quest", "name": "First Signal", "rarity": "Common"}
        ] if completed >= 1 else []
        if target.streak >= 7:
            result["achievements"].append({"id": "seven-streak", "name": "Seven-Day Signal", "rarity": "Rare"})
        if completed >= 50:
            result["achievements"].append({"id": "fifty-quests", "name": "Seasoned Grinder", "rarity": "Epic"})
        equipped = database.scalars(select(InventoryItem).where(
            InventoryItem.user_id == target.id, InventoryItem.equipped.is_(True)
        )).all()
        catalog = {item["id"]: item for item in SHOP_ITEMS}
        result["equippedItems"] = [
            {"id": item.item_id, "name": catalog.get(item.item_id, {}).get("name", item.item_id),
             "category": catalog.get(item.item_id, {}).get("category", "Cosmetic")}
            for item in equipped
        ]
    return result


@router.get("/notifications")
def list_notifications(unread_only: bool = False, user: User = Depends(current_user), database: Session = Depends(get_db)) -> dict[str, Any]:
    query = select(Notification).where(Notification.user_id == user.id)
    if unread_only:
        query = query.where(Notification.read_at.is_(None))
    items = database.scalars(query.order_by(Notification.created_at.desc()).limit(100)).all()
    return {"items": [serialize_notification(item) for item in items], "unreadCount": database.scalar(select(func.count(Notification.id)).where(Notification.user_id == user.id, Notification.read_at.is_(None))) or 0}


@router.post("/notifications/{notification_id}/read")
@router.patch("/notifications/{notification_id}/read")
def mark_notification_read(notification_id: int, user: User = Depends(current_user), database: Session = Depends(get_db)) -> dict[str, bool]:
    item = database.scalar(select(Notification).where(Notification.id == notification_id, Notification.user_id == user.id))
    if not item:
        raise HTTPException(status_code=404, detail="Notification not found")
    item.read_at = datetime.utcnow()
    database.commit()
    return {"read": True}


@router.post("/notifications/read-all")
def mark_notifications_read(user: User = Depends(current_user), database: Session = Depends(get_db)) -> dict[str, int]:
    items = database.scalars(select(Notification).where(Notification.user_id == user.id, Notification.read_at.is_(None))).all()
    for item in items:
        item.read_at = datetime.utcnow()
    database.commit()
    return {"updated": len(items)}


@router.get("/preferences")
@router.get("/settings")
def get_preferences(user: User = Depends(current_user), database: Session = Depends(get_db)) -> dict[str, Any]:
    item = database.get(UserPreference, user.id)
    return {"preferences": item.values if item else {}}


@router.patch("/preferences")
@router.patch("/settings")
def update_preferences(payload: PreferenceUpdate, user: User = Depends(current_user), database: Session = Depends(get_db)) -> dict[str, Any]:
    item = database.get(UserPreference, user.id)
    if not item:
        item = UserPreference(user_id=user.id, values={})
        database.add(item)
    extra_values = {key: value for key, value in payload.model_dump(exclude={"values"}).items()}
    item.values = {**(item.values or {}), **payload.values, **extra_values}
    database.commit()
    return {"preferences": item.values}


@router.get("/inventory")
def inventory(user: User = Depends(current_user), database: Session = Depends(get_db)) -> dict[str, Any]:
    items = database.scalars(select(InventoryItem).where(InventoryItem.user_id == user.id)).all()
    return {"items": [{**next((x for x in SHOP_ITEMS if x["id"] == item.item_id), {"id": item.item_id}), "equipped": item.equipped} for item in items]}


@router.post("/inventory/{item_id}/equip")
def equip_item(item_id: str, user: User = Depends(current_user), database: Session = Depends(get_db)) -> dict[str, Any]:
    owned = database.scalar(select(InventoryItem).where(InventoryItem.user_id == user.id, InventoryItem.item_id == item_id))
    if not owned:
        raise HTTPException(status_code=404, detail="Item is not owned")
    category = next((x["category"] for x in SHOP_ITEMS if x["id"] == item_id), None)
    for item in database.scalars(select(InventoryItem).where(InventoryItem.user_id == user.id)):
        if category and next((x["category"] for x in SHOP_ITEMS if x["id"] == item.item_id), None) == category:
            item.equipped = False
    owned.equipped = True
    database.commit()
    return {"itemId": item_id, "equipped": True}


@router.post("/inventory/{item_id}/unequip")
@router.delete("/inventory/{item_id}/equip")
@router.delete("/inventory/{item_id}/unequip")
def unequip_item(item_id: str, user: User = Depends(current_user), database: Session = Depends(get_db)) -> dict[str, Any]:
    item = database.scalar(select(InventoryItem).where(InventoryItem.user_id == user.id, InventoryItem.item_id == item_id))
    if not item:
        raise HTTPException(status_code=404, detail="Item is not owned")
    item.equipped = False
    database.commit()
    return {"itemId": item_id, "equipped": False}


@router.get("/ai/context")
def ai_context(user: User = Depends(current_user), database: Session = Depends(get_db)) -> dict[str, Any]:
    quests = database.scalars(select(Quest).where(Quest.user_id == user.id, Quest.status != "completed").limit(20)).all()
    inventory_items = database.scalars(select(InventoryItem).where(InventoryItem.user_id == user.id, InventoryItem.equipped.is_(True))).all()
    return {"user": serialize_user(user), "quests": [serialize_quest(q) for q in quests],
            "preferences": (database.get(UserPreference, user.id).values if database.get(UserPreference, user.id) else {}),
            "equipped": [item.item_id for item in inventory_items],
            "friends": list_friends(user, database)}


@router.post("/ai/actions")
def ai_action(payload: AIActionRequest, user: User = Depends(current_user), database: Session = Depends(get_db)) -> dict[str, Any]:
    if payload.action == "CREATE_QUEST":
        title = str(payload.input.get("title", "")).strip()
        minutes = payload.input.get("estimatedMinutes", payload.input.get("minutes", 0))
        if not title or len(title) < 3:
            raise HTTPException(status_code=422, detail="A quest title of at least 3 characters is required")
        if not isinstance(minutes, int) or minutes < 5 or minutes > 480:
            raise HTTPException(status_code=422, detail="Quest time must be between 5 and 480 minutes")
        quest = Quest(
            user_id=user.id,
            title=title[:120],
            description=str(payload.input.get("description", ""))[:1000],
            category=str(payload.input.get("category", "Personal"))[:32],
            difficulty=str(payload.input.get("difficulty", "Medium")),
            priority=str(payload.input.get("priority", "Medium")),
            estimated_minutes=minutes,
        )
        database.add(quest)
        database.flush()
        result = {"action": payload.action, "status": "created", "quest": serialize_quest(quest),
                  "message": f"Created '{quest.title}' as a {quest.estimated_minutes}-minute quest."}
        database.add(AIAction(user_id=user.id, action=payload.action, input=payload.input, result=result))
        database.commit()
        return result
    result = {"action": payload.action, "status": "received", "message": "Action is ready for the Grindly assistant."}
    database.add(AIAction(user_id=user.id, action=payload.action, input=payload.input, result=result))
    database.commit()
    return result
