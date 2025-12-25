import os
import json
import fitz  # PyMuPDF
from typing import Optional
import google.generativeai as genai
from PIL import Image
import io

# Importar el modelo para validación (aunque el output del LLM es JSON, lo parseamos a este modelo)
from src.data_core.models.schema import DocumentMetadata

def extract_first_page_as_image(file_path: str) -> Image.Image:
    """
    Convierte la primera página de un PDF a una imagen PIL.
    """
    doc = fitz.open(file_path)
    page = doc[0]
    pix = page.get_pixmap()
    img_data = pix.tobytes("png")
    return Image.open(io.BytesIO(img_data))

def tag_document(file_path: str) -> Optional[DocumentMetadata]:
    """
    Usa Gemini 1.5 Flash para extraer metadatos de la primera página del documento.
    """
    
    # Configuración de API Key (debe estar en variables de entorno)
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        # En modo desarrollo sin API Key, retornamos un mock o lanzamos error
        print("WARNING: GOOGLE_API_KEY not found. Returning mock metadata.")
        return DocumentMetadata(
            category="GESTION",
            code="MOCK-001",
            title="Documento Sin Procesar (Mock)",
            year=2024,
            store_type="D"
        )

    genai.configure(api_key=api_key)
    
    # Modelo Flash para baja latencia y costo
    model = genai.GenerativeModel('gemini-1.5-flash')
    
    image = extract_first_page_as_image(file_path)
    
    prompt = """
    Actúa como un Bibliotecario BIM experto. Analiza la imagen de la portada de este documento técnico.
    Extrae el Código de Norma, Categoría Técnica y Año del documento.
    
    Las categorías permitidas son: ESTRUCTURAS, ARQUITECTURA, SANITARIAS, ELECTRICAS, NORMATIVA, GESTION.
    Los tipos de Store son: 
    - A: Metodología (Guías, BEP, ISO)
    - B: Normativa (RNE, Leyes, Reglamentos)
    - C: Specs (Fichas Técnicas, Catálogos)
    - D: Contexto Proyecto (Memorias, Estudios de Suelos)
    
    Devuelve exclusivamente un JSON con la siguiente estructura:
    {
        "category": "...",
        "code": "...",
        "title": "...",
        "year": 2024,
        "store_type": "..."
    }
    
    Si no estás seguro de la categoría, usa GESTION.
    Si no encuentras el año, estima basado en el contexto o usa el año actual.
    """
    
    try:
        response = model.generate_content([prompt, image])
        json_str = response.text.strip()
        
        # Limpieza básica por si el modelo devuelve bloques de código markdown
        if json_str.startswith("```json"):
            json_str = json_str[7:]
        if json_str.endswith("```"):
            json_str = json_str[:-3]
            
        data = json.loads(json_str)
        
        return DocumentMetadata(**data)
        
    except Exception as e:
        print(f"Error tagging document: {e}")
        # Fallback seguro
        return DocumentMetadata(
            category="GESTION",
            code="UNKNOWN",
            title=os.path.basename(file_path),
            year=2024,
            store_type="D"
        )
