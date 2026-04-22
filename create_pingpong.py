import cv2
import sys
import os
import numpy as np

input_path = "public/assets/Animate_image_keep_202604061951.mp4"
output_path = "public/assets/hero_pingpong.mp4"

if not os.path.exists(input_path):
    print(f"Error: {input_path} no encontrado.")
    sys.exit(1)

print("Cargando video original para Chroma Keying...")
cap = cv2.VideoCapture(input_path)

width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
original_fps = cap.get(cv2.CAP_PROP_FPS)

target_width = int(width * 0.6)
target_height = int(height * 0.6)

# Velocidad al 70% (30% más lenta). Rebajamos los fps que se escriben en el archivo de salida
target_fps = original_fps * 0.70

print(f"FPS Original: {original_fps:.2f} | FPS Objetivo (Ralentización): {target_fps:.2f}")

fourcc = cv2.VideoWriter_fourcc(*'avc1')
out = cv2.VideoWriter(output_path, fourcc, target_fps, (target_width, target_height))

if not out.isOpened():
    print("Reintentando con mp4v...")
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_path, fourcc, target_fps, (target_width, target_height))

# Límites del chroma key verde en HSV
# OpenCV usa rango H:0-179, S:0-255, V:0-255
lower_green = np.array([35, 40, 40])
upper_green = np.array([85, 255, 255])

target_hue = 96 # Hue desplazado hacia el AZUL (96 = 192°). Evita el residuo verde.

frames = []
count = 0

while True:
    ret, frame = cap.read()
    if not ret:
        break
    
    frame = cv2.resize(frame, (target_width, target_height), interpolation=cv2.INTER_AREA)

    # 1. Transformar a HSV
    hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
    
    # 2. Generar máscara del color verde
    mask = cv2.inRange(hsv, lower_green, upper_green)
    
    # 3. Desenfoque Gaussiano sobre la máscara para un difuminado perfecto de bordes (Anti-Aliasing)
    mask_blur = cv2.GaussianBlur(mask, (5, 5), 0)
    mask_norm = mask_blur.astype(np.float32) / 255.0
    mask_3d = mask_norm[:, :, np.newaxis]
    
    # 4. Crear clon para la tonalidad cian
    hsv_cyan = hsv.copy()
    
    # Imponer Hue=88 dejando S y V intactos para textura realista
    hsv_cyan[:, :, 0] = target_hue
    # Aumentar ligeramente la saturación solo si es muy apagada, pero dejemos el V intacto
    # Evito distorsionar S para que luzca hiper-realista.
    
    frame_cyan = cv2.cvtColor(hsv_cyan, cv2.COLOR_HSV2BGR)
    
    # 5. Fusión Alfa Lineal utilizando la máscara procesada
    frame_final = frame * (1 - mask_3d) + frame_cyan * mask_3d
    frame_final = frame_final.astype(np.uint8)

    frames.append(frame_final)
    out.write(frame_final)
    
    count += 1
    if count % 50 == 0:
        print(f"[{count}] Procesado con máscara cian...")

print(f"Generación de viaje de IDA exitosa. Entrando en reversa interpolada...")

# Ping pong inverso (sin el primero ni el último para suavidad de frame loop puro)
reverse_count = 0
for frame in reversed(frames[1:-1]):
    out.write(frame)
    reverse_count += 1

cap.release()
out.release()
print(f"¡Éxito total! Guardado en {output_path}")
