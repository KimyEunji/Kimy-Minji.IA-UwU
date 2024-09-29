import sys
import io
from transformers import pipeline

# Configurar la salida estándar para usar UTF-8
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Inicializar el pipeline de preguntas y respuestas con un modelo adecuado
qa_pipeline = pipeline("question-answering", model="distilbert-base-uncased-distilled-squad")

# Función para buscar en la base de datos
def buscar_en_base_datos(pregunta, base_datos):
    for entry in base_datos:
        if entry["pregunta"].lower() in pregunta.lower():
            return entry["respuesta"]
    return None

# Base de datos de preguntas y respuestas
base_datos = [
    {"pregunta": "¿Cuál es la capital de Francia?", "respuesta": "La capital de Francia es París."},
    {"pregunta": "¿Quién es Elon Musk?", "respuesta": "Elon Musk es el CEO de SpaceX y Tesla."},
    # Agrega más preguntas y respuestas según sea necesario
]

# Capturar la pregunta desde los argumentos de la línea de comandos
if len(sys.argv) > 1:
    pregunta = sys.argv[1]
else:
    print("No se proporcionó ninguna pregunta.")
    sys.exit()

# Buscar en la base de datos
respuesta = buscar_en_base_datos(pregunta, base_datos)

if respuesta:
    print(respuesta)
else:
    # Si no está en la base de datos, usar el modelo preentrenado
    contexto = (
        "No tengo la respuesta a eso. No entendi tu pregunta. Vuelve a intentarlo. Se mas espesifico. Esa pregunta no esta en mi base de datos."
    )
    respuesta_ia = qa_pipeline(question=pregunta, context=contexto)
    print(respuesta_ia['answer'] if 'answer' in respuesta_ia else "Lo siento, no tengo la respuesta a eso.")

