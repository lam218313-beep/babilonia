from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Dict, Any, Optional
import io

# Importar Router de Ingesta
from app.api.v1 import ingest

app = FastAPI(title="BIM-AI Data Core API", version="1.0.0")

# Configurar CORS para permitir peticiones desde el Frontend (Vite)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # En producción restringir a dominio del frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar Routers
app.include_router(ingest.router, prefix="/api/v1", tags=["Ingestion"])

@app.get("/")
def health_check():
    return {"status": "online", "service": "BIM-AI Data Core"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
