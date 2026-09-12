from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router
from app.database import Base, engine
from app.settings import settings

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Grindly API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(router, prefix="/api")


@app.get("/")
def read_root():
    return {"service": "grindly-api", "status": "ok"}
