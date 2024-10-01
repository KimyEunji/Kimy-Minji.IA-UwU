import sys
import io
import torch
from transformers import T5ForConditionalGeneration, T5Tokenizer

# Configurar la salida estándar para usar UTF-8
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Cargar el modelo T5 y el tokenizador
modelo = "t5-large"
tokenizador = T5Tokenizer.from_pretrained(modelo)
modelo_t5 = T5ForConditionalGeneration.from_pretrained(modelo)

# Contexto mejorado sobre Corea del Sur
contexto = (
    "Corea del Sur es un país ubicado en la península de Corea, en Asia Oriental. "
    "Su capital es Seúl, una metrópoli vibrante conocida por su mezcla de modernidad y tradición. "
    "Seúl es famosa por su cultura pop, incluidos K-Pop y dramas de televisión, que han ganado popularidad en todo el mundo. "
    "Los lugares icónicos de Seúl incluyen el Palacio Gyeongbokgung y la Torre Namsan. "
    "La comida coreana es diversa y deliciosa, con platos emblemáticos como el kimchi, el bulgogi y el bibimbap. "
    "El idioma oficial es el coreano, y la economía de Corea del Sur es una de las más avanzadas del mundo, "
    "con industrias en tecnología, automóviles y electrónica. "
    "La gente en Seúl es muy amable y acogedora, y las tradiciones culturales se celebran en festivales a lo largo del año."
)

# Capturar la pregunta desde los argumentos de la línea de comandos
if len(sys.argv) > 1:
    pregunta = sys.argv[1]
else:
    print("No se proporcionó ninguna pregunta.")
    sys.exit()

# Procesar la pregunta
input_text = f"responde: {pregunta} contexto: {contexto}"
inputs = tokenizador.encode(input_text, return_tensors="pt")

# Generar la respuesta
with torch.no_grad():
    outputs = modelo_t5.generate(inputs, max_length=200, num_beams=5, early_stopping=True)

respuesta = tokenizador.decode(outputs[0], skip_special_tokens=True)

# Reemplazar "Sel" por "Seúl" para corregir la respuesta
respuesta = respuesta.replace("Sel", "Seúl").replace("responde:", "").strip()

# Imprimir la respuesta final
print(respuesta)
