import os
import re
from typing import List, Dict, Any
from uuid import uuid4
import google.generativeai as genai

from app.services.data_core.models.schema import CoreResponse, Citation

class VertexAISearchMock:
    """
    Mock para simular Vertex AI Search cuando no hay credenciales de nube.
    """
    def search(self, query: str, store_id: str, top_k: int = 5):
        # Simulación de respuesta basada en keywords simples
        print(f"MOCK SEARCH: Query='{query}' in Store='{store_id}'")
        
        if "sismo" in query.lower() or "e.030" in query.lower():
            return [
                {
                    "document_id": str(uuid4()),
                    "source_file": "E030_Diseno_Sismorresistente_2018.pdf",
                    "page_number": 15,
                    "content": "Artículo 12. La zonificación sísmica del Perú se divide en 4 zonas...",
                    "article_id": "Art. 12"
                },
                {
                    "document_id": str(uuid4()),
                    "source_file": "E030_Diseno_Sismorresistente_2018.pdf",
                    "page_number": 16,
                    "content": "Tabla N° 1. Factores de Zona 'Z'. Zona 4 -> Z=0.45",
                    "article_id": "Tabla 1"
                }
            ]
        return []

class DataCoreRouter:
    def __init__(self):
        self.project_id = os.getenv("GOOGLE_PROJECT_ID", "mock-project")
        self.location = "global"
        # Mapeo de Stores (IDs reales vs Mocks)
        self.stores = {
            "A": os.getenv("STORE_A_ID", "mock-store-a"), # Metodología
            "B": os.getenv("STORE_B_ID", "mock-store-b"), # Normativa
            "C": os.getenv("STORE_C_ID", "mock-store-c"), # Specs
            "D": os.getenv("STORE_D_ID", "mock-store-d"), # Contexto
        }
        self.search_client = VertexAISearchMock() # Reemplazar con cliente real en Prod

    def _classify_intent(self, query: str) -> str:
        """
        Clasificación determinista de intención (Normativa vs Especificación vs Metodología).
        """
        query_lower = query.lower()
        
        # Reglas Regex para Normativa (Store B)
        normativa_patterns = [
            r"norma", r"reglamento", r"rne", r"ley", r"decreto", 
            r"artículo", r"inciso", r"e\.\d{3}", r"a\.\d{3}", r"is\.\d{3}"
        ]
        if any(re.search(p, query_lower) for p in normativa_patterns):
            return "NORMATIVA"
            
        # Reglas para Especificaciones (Store C)
        specs_patterns = [
            r"ficha técnica", r"resistencia", r"dosificación", r"rendimiento",
            r"catálogo", r"proveedor", r"precio", r"costo"
        ]
        if any(re.search(p, query_lower) for p in specs_patterns):
            return "ESPECIFICACION"
            
        # Default a Metodología/General si no calza
        return "GENERAL"

    def route_query(self, user_query: str, project_context: Dict[str, Any] = None) -> CoreResponse:
        """
        Orquesta la consulta a los Stores adecuados.
        """
        intent = self._classify_intent(user_query)
        target_store = "A" # Default
        
        if intent == "NORMATIVA":
            target_store = "B"
        elif intent == "ESPECIFICACION":
            target_store = "C"
            
        # Ejecutar búsqueda (Retrieval)
        # En producción, aquí se configura search_type='HYBRID'
        results = self.search_client.search(user_query, self.stores[target_store], top_k=5)
        
        if not results:
            return CoreResponse(
                answer="Información no encontrada en la base normativa o técnica disponible.",
                citations=[],
                confidence_score=0.0
            )
            
        # Procesar resultados y generar respuesta (Synthesis) con Gemini Pro
        citations = []
        context_text = ""
        
        for res in results:
            citations.append(Citation(
                document_id=res["document_id"],
                source_file=res["source_file"],
                article_id=res.get("article_id"),
                page_number=res["page_number"],
                text_snippet=res["content"]
            ))
            context_text += f"--- Documento: {res['source_file']} (Página {res['page_number']}) ---\n{res['content']}\n\n"
            
        # Llamada real a Gemini 1.5 Pro
        try:
            model = genai.GenerativeModel('gemini-1.5-pro')
            
            system_instruction = """
            Eres un asistente técnico experto en construcción y normativa BIM.
            Responde a la consulta del usuario basándote EXCLUSIVAMENTE en el contexto proporcionado.
            SIEMPRE cita el nombre del archivo y el número de página al final de cada afirmación relevante.
            Si la información no está en el contexto, indícalo claramente.
            """
            
            prompt = f"""
            {system_instruction}
            
            CONTEXTO RECUPERADO:
            {context_text}
            
            CONSULTA DEL USUARIO:
            {user_query}
            """
            
            response = model.generate_content(prompt)
            synthesized_answer = response.text
            confidence = 0.9 # Estimado
            
        except Exception as e:
            print(f"Error generando respuesta con Gemini: {e}")
            synthesized_answer = f"Error al generar respuesta detallada. Contexto encontrado:\n\n{context_text}"
            confidence = 0.5
        
        return CoreResponse(
            answer=synthesized_answer,
            citations=citations,
            confidence_score=confidence,
            metadata={"intent": intent, "store_used": target_store}
        )
