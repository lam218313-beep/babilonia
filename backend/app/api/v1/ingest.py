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
    print(f"DEBUG: Received upload request for {file.filename}")
    
    # Guardar temporalmente el archivo subido
    temp_path = TEMP_DIR / file.filename
    
    try:
        # Write file asynchronously
        content = await file.read()
        with open(temp_path, "wb") as buffer:
            buffer.write(content)
        print(f"DEBUG: File saved to {temp_path}")
    except Exception as e:
        print(f"ERROR: Failed to save file: {e}")
        raise HTTPException(status_code=500, detail=f"Error saving temp file: {e}")

    # Iniciar generador de logs
    return StreamingResponse(
        engine.process_document(str(temp_path), file.filename),
        media_type="text/plain"
    )
