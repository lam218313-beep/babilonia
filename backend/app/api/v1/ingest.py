from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
import shutil
from pathlib import Path
import os

from app.services.data_core.engine import DataCoreEngine

router = APIRouter()
engine = DataCoreEngine()

TEMP_DIR = Path("./data/temp")
TEMP_DIR.mkdir(parents=True, exist_ok=True)

@router.post("/upload")
async def ingest_document(file: UploadFile = File(...)):
    """
    Endpoint de ingesta con Streaming de Logs.
    """
    # Guardar temporalmente el archivo subido
    temp_path = TEMP_DIR / file.filename
    
    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving temp file: {e}")

    # Iniciar generador de logs
    return StreamingResponse(
        engine.process_document(str(temp_path), file.filename),
        media_type="text/plain"
    )
