from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "sqlite:///./grindly.db"
    cors_origins: list[str] = ["https://grindly-psi.vercel.app", "http://localhost:5173", "http://127.0.0.1:5173"]
    environment: str = "development"
    firebase_project_id: str | None = None
    firebase_service_account_json: str | None = None
    minimum_task_minutes: int = 5
    max_task_minutes: int = 480

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
