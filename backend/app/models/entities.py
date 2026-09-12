from datetime import date, datetime
from decimal import Decimal
from typing import Any

from sqlalchemy import JSON, Boolean, Date, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    firebase_uid: Mapped[str] = mapped_column(String(128), unique=True, index=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    username: Mapped[str] = mapped_column(String(32), unique=True, index=True)
    display_name: Mapped[str] = mapped_column(String(80))
    avatar: Mapped[str] = mapped_column(String(32), default="avatar-1")
    level: Mapped[int] = mapped_column(Integer, default=1)
    experience: Mapped[int] = mapped_column(Integer, default=0)
    next_level_exp: Mapped[int] = mapped_column(Integer, default=1000)
    coins: Mapped[int] = mapped_column(Integer, default=250)
    streak: Mapped[int] = mapped_column(Integer, default=0)
    best_streak: Mapped[int] = mapped_column(Integer, default=0)
    last_completed_on: Mapped[date | None] = mapped_column(Date, nullable=True)
    attributes: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    quests: Mapped[list["Quest"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    activities: Mapped[list["Activity"]] = relationship(back_populates="user", cascade="all, delete-orphan")


class Quest(Base):
    __tablename__ = "quests"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    title: Mapped[str] = mapped_column(String(120))
    description: Mapped[str] = mapped_column(Text, default="")
    category: Mapped[str] = mapped_column(String(32))
    difficulty: Mapped[str] = mapped_column(String(16))
    priority: Mapped[str] = mapped_column(String(16), default="Medium")
    estimated_minutes: Mapped[int] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String(16), default="planned")
    started_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    reward_claimed: Mapped[bool] = mapped_column(Boolean, default=False)
    reward_xp: Mapped[int] = mapped_column(Integer, default=0)
    reward_coins: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped[User] = relationship(back_populates="quests")
    sessions: Mapped[list["QuestSession"]] = relationship(back_populates="quest", cascade="all, delete-orphan")


class QuestSession(Base):
    __tablename__ = "quest_sessions"
    __table_args__ = (UniqueConstraint("quest_id", "user_id", name="uq_quest_user_session"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    quest_id: Mapped[int] = mapped_column(ForeignKey("quests.id"), index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    started_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    stopped_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    active: Mapped[bool] = mapped_column(Boolean, default=True)

    quest: Mapped[Quest] = relationship(back_populates="sessions")


class Activity(Base):
    __tablename__ = "activities"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    kind: Mapped[str] = mapped_column(String(32))
    title: Mapped[str] = mapped_column(String(160))
    detail: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped[User] = relationship(back_populates="activities")


class InventoryItem(Base):
    __tablename__ = "inventory_items"
    __table_args__ = (UniqueConstraint("user_id", "item_id", name="uq_inventory_user_item"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    item_id: Mapped[str] = mapped_column(String(64))
    purchased_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
