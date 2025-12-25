import fitz  # PyMuPDF
import io

def clean_document(file_path: str) -> bytes:
    """
    Limpia un documento PDF eliminando encabezados y pies de página basados en un margen porcentual (10%).
    También descarta páginas con baja densidad de contenido (separadores).
    
    Args:
        file_path: Ruta absoluta al archivo PDF.
        
    Returns:
        bytes: El contenido del PDF limpio en memoria.
    """
    try:
        doc = fitz.open(file_path)
        
        # Crear un nuevo documento para la salida
        clean_doc = fitz.open()
        
        print(f"DEBUG: Processing PDF with {len(doc)} pages")

        for page_num in range(len(doc)):
            if page_num % 10 == 0:
                print(f"DEBUG: Processing page {page_num}")
                
            page = doc[page_num]
            rect = page.rect
            width = rect.width
            height = rect.height
            
            # Definir Safe Zone (10% de margen superior e inferior)
            margin_top = height * 0.10
            margin_bottom = height * 0.10
            
            # Definir el rectángulo de recorte (Safe Zone)
            clip_rect = fitz.Rect(0, margin_top, width, height - margin_bottom)
            
            # Extraer texto solo de la Safe Zone para análisis de densidad
            text_in_safe_zone = page.get_text("text", clip=clip_rect)
            
            # Lógica de descarte de páginas vacías o separadores
            char_count = len(text_in_safe_zone.strip())
            image_list = page.get_images()
            
            if char_count < 100 and not image_list:
                continue
                
            # Si la página es válida, la copiamos al nuevo documento.
            clean_doc.insert_pdf(doc, from_page=page_num, to_page=page_num)
            
            # Aplicar Redactions
            try:
                new_page = clean_doc[-1] # La última página insertada
                
                # Redactar Header (Parte superior)
                header_rect = fitz.Rect(0, 0, width, margin_top)
                new_page.add_redact_annot(header_rect, fill=(1, 1, 1)) # Blanco
                
                # Redactar Footer (Parte inferior)
                footer_rect = fitz.Rect(0, height - margin_bottom, width, height)
                new_page.add_redact_annot(footer_rect, fill=(1, 1, 1)) # Blanco
                
                # Aplicar las redacciones
                new_page.apply_redactions()
            except Exception as e:
                print(f"WARN: Error applying redaction on page {page_num}: {e}")

        # Guardar en buffer
        output_buffer = io.BytesIO()
        clean_doc.save(output_buffer)
        clean_doc.close()
        doc.close()
        
        return output_buffer.getvalue()

    except Exception as e:
        print(f"ERROR: Failed to clean document: {e}")
        raise e
