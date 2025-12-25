from typing import List, Literal, Optional, Dict, Any
from uuid import UUID
from pydantic import BaseModel, Field

class DocumentMetadata(BaseModel):
    """
    Metadatos estrictos para documentos indexados en el Data Core.
    """
    category: Literal["ESTRUCTURAS", "ARQUITECTURA", "SANITARIAS", "ELECTRICAS", "NORMATIVA", "GESTION"] = Field(
        ..., 
        description="Categoría técnica principal del documento."
    )
    code: str = Field(
        ..., 
        description="Código del documento (ej. E.030, ISO-19650). Se permite string libre pero se recomienda normalización."
    )
    title: str = Field(..., description="Título descriptivo del documento.")
    year: int = Field(..., description="Año de publicación o vigencia.")
    store_type: Literal["A", "B", "C", "D"] = Field(
        ..., 
        description="Tipo de Store donde reside: A=Metodología, B=Normativa, C=Specs, D=Contexto Proyecto."
    )

class Citation(BaseModel):
    """
    Referencia exacta a la fuente de la información.
    """
    document_id: Optional[UUID] = Field(None, description="ID único del documento en el sistema.")
    source_file: str = Field(..., description="Nombre del archivo fuente (ej. E030_Sismo_2018.pdf).")
    article_id: Optional[str] = Field(None, description="ID del artículo o sección específica (ej. Art. 12.3).")
    page_number: int = Field(..., description="Número de página donde se encuentra la evidencia (1-based).")
    text_snippet: str = Field(..., description="Fragmento de texto exacto extraído del documento.")

class CoreResponse(BaseModel):
    """
    Respuesta estandarizada del Data Core a cualquier consulta.
    """
    answer: str = Field(..., description="Respuesta sintetizada en lenguaje natural.")
    citations: List[Citation] = Field(default_factory=list, description="Lista de evidencias que sustentan la respuesta.")
    confidence_score: float = Field(..., ge=0.0, le=1.0, description="Nivel de confianza de la respuesta (0.0 a 1.0).")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Metadatos adicionales de la ejecución (latencia, tokens, etc).")
