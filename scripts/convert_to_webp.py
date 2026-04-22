import os
from PIL import Image
from concurrent.futures import ThreadPoolExecutor

# CONFIGURACIÓN INTELIGENTE
# Detecta la ubicación del script y sube un nivel para encontrar /public
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INPUT_FOLDER = os.path.join(BASE_DIR, 'public', 'assets', 'products')
OUTPUT_FOLDER = INPUT_FOLDER 
QUALITY = 82 

def convert_image(filename):
    if not filename.lower().endswith(('.jpg', '.jpeg')):
        return

    input_path = os.path.join(INPUT_FOLDER, filename)
    output_filename = os.path.splitext(filename)[0] + '.webp'
    output_path = os.path.join(OUTPUT_FOLDER, output_filename)

    try:
        with Image.open(input_path) as img:
            if img.mode != 'RGB':
                img = img.convert('RGB')
            img.save(output_path, 'WEBP', quality=QUALITY, method=6)
            print(f"✅ OK: {filename} -> {output_filename}")
    except Exception as e:
        print(f"❌ ERROR en {filename}: {e}")

def main():
    print(f"📁 Buscando imágenes en: {INPUT_FOLDER}")
    if not os.path.exists(INPUT_FOLDER):
        print(f"❌ ERROR: No se encontró la carpeta de productos. Verifica la ruta.")
        return

    files = [f for f in os.listdir(INPUT_FOLDER) if os.path.isfile(os.path.join(INPUT_FOLDER, f))]
    print(f"🚀 Iniciando conversión de {len(files)} imágenes...")

    with ThreadPoolExecutor(max_workers=10) as executor:
        executor.map(convert_image, files)

    print("\n✨ ¡PROCESO COMPLETADO!")

if __name__ == "__main__":
    main()