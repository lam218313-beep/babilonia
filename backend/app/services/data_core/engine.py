import os
import json
import time
import asyncio
import fitz  # PyMuPDF
import google.generativeai as genai
from pathlib import Path
from typing import Dict, Any, Generator
from uuid import uuid4
from dotenv import load_dotenv
from app.services.data_core.librarian.sanitizer import clean_document

# Cargar variables de entorno
load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
LOCAL_STORAGE_PATH = Path(os.getenv("LOCAL_STORAGE_PATH", "./data/storage"))
REGISTRY_PATH = Path(os.getenv("REGISTRY_PATH", "./data/registry.json"))

# Configurar Gemini
if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)

class DataCoreEngine:
    def __init__(self):
        # Asegurar directorios
        LOCAL_STORAGE_PATH.mkdir(parents=True, exist_ok=True)
        if not REGISTRY_PATH.exists():
            with open(REGISTRY_PATH, "w") as f:
                json.dump({}, f)

    def _load_registry(self) -> Dict:
        try:
            with open(REGISTRY_PATH, "r") as f:
                return json.load(f)
        except Exception:
            return {}

    def _save_registry(self, data: Dict):
        with open(REGISTRY_PATH, "w") as f:
            json.dump(data, f, indent=2)

    async def process_document(self, file_path: str, original_filename: str) -> Generator[str, None, None]:
        """
        Generador asíncrono que emite logs del proceso de ingesta.
        """
        loop = asyncio.get_running_loop()
        print(f"DEBUG: Starting process_document for {original_filename}")
        try:
            yield f"START: Iniciando procesamiento de {original_filename}\n"
            
            # 1. Sanitización Local
            print("DEBUG: Starting sanitization")
            yield "STEP: Sanitizando documento (recorte de headers/footers)...\n"
            # Ejecutar tarea bloqueante en thread pool
            clean_pdf_path = await loop.run_in_executor(None, self._sanitize_document, file_path)
            print(f"DEBUG: Sanitization complete. Path: {clean_pdf_path}")
            yield f"INFO: Documento limpio guardado en {clean_pdf_path.name}\n"

            # 2. Subida a Gemini
            print("DEBUG: Starting Gemini upload")
            yield "STEP: Subiendo a Gemini File Search...\n"
            if not GOOGLE_API_KEY:
                print("DEBUG: No API Key, mocking upload")
                yield "WARN: No API Key found. Skipping Gemini upload (Mock Mode).\n"
                gemini_file = {"name": "mock-gemini-id", "uri": "mock-uri"}
            else:
                # Ejecutar tarea bloqueante en thread pool
                gemini_file = await loop.run_in_executor(None, self._upload_to_gemini, clean_pdf_path)
                print("DEBUG: Gemini upload complete")
                yield "INFO: Archivo subido exitosamente a Gemini.\n"

            # 3. Tagging (Clasificación)
            print("DEBUG: Starting Tagging")
            yield "STEP: Analizando contenido con IA (Tagging)...\n"
            # Ejecutar tarea bloqueante en thread pool
            metadata = await loop.run_in_executor(None, self._tag_document, clean_pdf_path)
            print(f"DEBUG: Tagging complete: {metadata}")
            yield f"INFO: Clasificado como {metadata.get('category')} - {metadata.get('code')}\n"

            # 4. Registro
            print("DEBUG: Registering in DB")
            yield "STEP: Registrando en base de datos local...\n"
            record_id = str(uuid4())
            record = {
                "id": record_id,
                "original_name": original_filename,
                "local_path": str(clean_pdf_path),
                "gemini_id": gemini_file.name if hasattr(gemini_file, 'name') else gemini_file['name'],
                "gemini_uri": gemini_file.uri if hasattr(gemini_file, 'uri') else gemini_file['uri'],
                "metadata": metadata,
                "timestamp": time.time()
            }
            
            registry = self._load_registry()
            registry[record_id] = record
            self._save_registry(registry)

            yield f"SUCCESS: {json.dumps(record)}\n"

        except Exception as e:
            yield f"ERROR: {str(e)}\n"

    def _sanitize_document(self, input_path: str) -> Path:
        """
        Limpia headers y footers (10%) y guarda en storage usando el Librarian.
        """
        try:
            clean_bytes = clean_document(str(input_path))
            
            output_filename = f"{uuid4()}.pdf"
            output_path = LOCAL_STORAGE_PATH / output_filename
            
            with open(output_path, "wb") as f:
                f.write(clean_bytes)
                
            return output_path
        except Exception as e:
            raise ValueError(f"Error durante la sanitización: {str(e)}")

    def _upload_to_gemini(self, file_path: Path):
        """
        Sube archivo a Gemini y espera a que esté activo.
        """
        print(f"Uploading {file_path} to Gemini...")
        file = genai.upload_file(path=file_path)
        
        # Polling de estado
        while file.state.name == "PROCESSING":
            time.sleep(2)
            file = genai.get_file(file.name)
            
        if file.state.name != "ACTIVE":
            raise Exception(f"Gemini File Upload Failed: {file.state.name}")
            
        return file

    def _tag_document(self, file_path: Path) -> Dict:
        """
        Usa Gemini Flash para extraer metadatos de la primera página.
        """
        if not GOOGLE_API_KEY:
            return {"category": "MOCK", "code": "MOCK-001", "title": "Mock Doc", "year": 2024}

        model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Convertir primera página a imagen para el modelo
        doc = fitz.open(file_path)
        page = doc[0]
        pix = page.get_pixmap()
        img_data = pix.tobytes("png")
        
        image_part = {
            "mime_type": "image/png",
            "data": img_data
        }
        
        prompt = """
        Analiza esta portada de documento técnico de construcción.
        Extrae en JSON:
        - category: (ESTRUCTURAS, ARQUITECTURA, SANITARIAS, ELECTRICAS, NORMATIVA, GESTION)
        - code: Código del documento (ej. E.030)
        - title: Título principal
        - year: Año de publicación (int)
        """
        
        try:
            response = model.generate_content([prompt, image_part])
            text = response.text.replace("```json", "").replace("```", "").strip()
            return json.loads(text)
        except Exception as e:
            print(f"Tagging error: {e}")
            return {"category": "UNKNOWN", "code": "UNK", "title": file_path.name, "year": 2024}
