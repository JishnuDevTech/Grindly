from datetime import date, datetime, timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field, field_validator
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.auth import current_user
from app.database import get_db
from app.models.entities import Activity, InventoryItem, Quest, QuestSession, User
from app.reward_engine import calculate_reward
from app.settings import settings

router = APIRouter()

SHOP_ITEMS = [
    {"id": "golden-frame", "name": "Golden Frame", "category": "Profile Frame", "price": 500, "rarity": "Rare", "preview": "✨", "locked": False},
    {"id": "legendary-border", "name": "Legendary Border", "category": "Profile Frame", "price": 2000, "rarity": "Legendary", "preview": "👑", "locked": False},
    {"id": "neon-nameplate", "name": "Neon Nameplate", "category": "Nameplate", "price": 750, "rarity": "Epic", "preview": "⚡", "locked": False},
    {"id": "shadow-theme", "name": "Shadow Theme", "category": "Theme", "price": 300, "rarity": "Common", "preview": "🌑", "locked": False},
    {"id": "particle-effects", "name": "Particle Effects", "category": "XP Effect", "price": 1500, "rarity": "Epic", "preview": "✨", "locked": False},
    {"id": "mythic-aura", "name": "Mythic Aura", "category": "Avatar Effect", "price": 5000, "rarity": "Mythic", "preview": "🌟", "locked": True, "unlocksAt": "Level 50"},
    {"id": "rainbow-wings", "name": "Rainbow Wings", "category": "Avatar Effect", "price": 3000, "rarity": "Legendary", "preview": "🦄", "locked": True, "unlocksAt": "Chest #42"},
    {"id": "champion-badge", "name": "Champion Badge", "category": "Badge", "price": 1000, "rarity": "Rare", "preview": "🏆", "locked": False},
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
    avatar: str = Field(default="avatar-1", max_length=32)


def serialize_user(user: User) -> dict[str, Any]:
    return {
        "id": user.id,
        "username": user.username,
        "displayName": user.display_name,
        "email": user.email,
        "avatar": user.avatar,
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


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/me")
def get_me(user: User = Depends(current_user), database: Session = Depends(get_db)) -> dict[str, Any]:
    completed = database.scalar(select(func.count(Quest.id)).where(Quest.user_id == user.id, Quest.status == "completed")) or 0
    rank = database.scalar(select(func.count(User.id)).where(User.experience > user.experience)) or 0
    payload = serialize_user(user)
    payload["globalRank"] = rank + 1
    payload["completedQuests"] = completed
    payload["activity"] = [
        {"id": item.id, "title": item.title, "detail": item.detail, "time": item.created_at.isoformat() + "Z", "icon": item.kind}
        for item in database.scalars(select(Activity).where(Activity.user_id == user.id).order_by(Activity.created_at.desc()).limit(10))
    ]
    payload["achievements"] = []
    if completed >= 1:
        payload["achievements"].append({"id": "first-steps", "name": "First Steps", "description": "Complete your first quest", "icon": "✓", "rarity": "Common"})
    if user.streak >= 7:
        payload["achievements"].append({"id": "on-fire", "name": "On Fire", "description": "Maintain a 7-day streak", "icon": "🔥", "rarity": "Rare"})
    if completed >= 50:
        payload["achievements"].append({"id": "grind-never-stops", "name": "Grind Never Stops", "description": "Complete 50 quests", "icon": "🏆", "rarity": "Epic"})
    return payload


@router.patch("/me")
def update_me(payload: UserSetup, user: User = Depends(current_user), database: Session = Depends(get_db)) -> dict[str, Any]:
    existing = database.scalar(select(User).where(User.username == payload.username, User.id != user.id))
    if existing:
        raise HTTPException(status_code=409, detail="Username is already taken")
    user.display_name = payload.display_name
    user.username = payload.username
    user.avatar = payload.avatar
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
    return [{"rank": index + 1, "username": entry.username, "displayName": entry.display_name, "avatar": entry.avatar, "level": entry.level, "xp": entry.experience, "isCurrentUser": entry.id == user.id} for index, entry in enumerate(users)]


@router.get("/shop")
def shop(user: User = Depends(current_user), database: Session = Depends(get_db)) -> list[dict[str, Any]]:
    owned = {item.item_id for item in database.scalars(select(InventoryItem).where(InventoryItem.user_id == user.id))}
    return [{**item, "owned": item["id"] in owned} for item in SHOP_ITEMS]


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
