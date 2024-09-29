import sys
import io
from transformers import TFAutoModelForSeq2SeqLM, AutoTokenizer

# Configurar la salida estándar para usar UTF-8
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Cargar el modelo preentrenado y el tokenizador
model_name = "t5-small"  # También puedes usar "t5-base" si tienes más recursos
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = TFAutoModelForSeq2SeqLM.from_pretrained(model_name)

# Función para generar respuestas basadas en el contexto
def generar_respuesta(pregunta, contexto):
    entrada = f"question: {pregunta} context: {contexto}"
    inputs = tokenizer(entrada, return_tensors="tf", max_length=512, truncation=True)
    output = model.generate(inputs["input_ids"], max_length=100, num_return_sequences=1)
    respuesta = tokenizer.decode(output[0], skip_special_tokens=True)
    return respuesta

# Capturar la pregunta desde los argumentos de la línea de comandos
if len(sys.argv) > 1:
    pregunta = sys.argv[1]
else:
    print("No se proporcionó ninguna pregunta.")
    sys.exit()

# Definir un contexto específico
contexto = (
    "Francia es un país de Europa con una rica historia y una importante influencia "
    "en la política, cultura y arte globales. La capital de Francia es París, conocida "
    "como la Ciudad de la Luz. Francia es también famosa por su gastronomía y sus "
    "monumentos históricos como la Torre Eiffel y el Museo del Louvre."
)

# Generar una respuesta basada en la pregunta y el contexto
respuesta = generar_respuesta(pregunta, contexto)
print("Respuesta:", respuesta)
