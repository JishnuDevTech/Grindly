from dataclasses import dataclass
from math import log1p

DIFFICULTY = {"Easy": 0.85, "Medium": 1.0, "Hard": 1.25}
PRIORITY = {"Low": 0.9, "Medium": 1.0, "High": 1.12}
CATEGORY_ATTRIBUTE = {"Study": "intelligence", "Coding": "intelligence", "Health": "endurance", "Work": "discipline", "Personal": "discipline", "Learning": "wisdom"}


@dataclass(frozen=True)
class RewardResult:
    xp: int
    coins: int
    attribute: str
    attribute_points: int
    anti_spam_multiplier: float


def calculate_reward(*, difficulty: str, priority: str, category: str, estimated_minutes: int, current_streak: int, completed_today: int) -> RewardResult:
    difficulty_factor = DIFFICULTY.get(difficulty, 1.0)
    priority_factor = PRIORITY.get(priority, 1.0)
    safe_minutes = max(5, min(480, estimated_minutes))
    time_factor = min(1.65, 0.72 + (log1p(safe_minutes) / log1p(120)) * 0.58)
    streak_factor = min(1.25, 1 + max(0, current_streak) * 0.015)
    anti_spam = max(0.12, 1 - max(0, completed_today) * 0.12)
    raw_xp = 42 * difficulty_factor * priority_factor * time_factor * streak_factor * anti_spam
    raw_coins = 18 * difficulty_factor * min(1.35, time_factor) * anti_spam
    attribute = CATEGORY_ATTRIBUTE.get(category, "discipline")
    return RewardResult(
        xp=max(1, min(250, round(raw_xp))),
        coins=max(1, min(120, round(raw_coins))),
        attribute=attribute,
        attribute_points=max(1, min(8, round(raw_xp / 35))),
        anti_spam_multiplier=round(anti_spam, 2),
    )
