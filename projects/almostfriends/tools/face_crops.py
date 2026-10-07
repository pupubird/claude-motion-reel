# Portraits → web JPEGs + where the face is, for drawPhoto's circle crop (src/assets.js PEOPLE: [file, fx, fy, crop]).
#   python3 tools/face_crops.py assets/people/raw/prompts-v6.tsv --model <yunet.onnx> [--sheet out/v6/faces-sheet.jpg]
#     → assets/people/<key>.jpg, assets/people/crops.json, the sheet (the circle crops, to check)
# Face from OpenCV's YuNet detector (OpenCV 5 dropped the Haar cascades; the model is opencv_zoo's
# face_detection_yunet_2023mar.onnx, kept out of the repo); the crop is 2.4 face widths, centred a little below the
# eyes so the chin and some hair fit. No face found → a centred default, flagged red on the sheet.
import sys, os, json
import cv2
import numpy as np
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, '..')
PEO = os.path.join(ROOT, 'assets', 'people')
tsv = sys.argv[1]
model = sys.argv[sys.argv.index('--model') + 1]
keys = [l.split('\t', 1)[0] for l in open(tsv) if l.strip()]
det = cv2.FaceDetectorYN.create(model, '', (320, 320), 0.7, 0.3, 50)
out = {}
tiles = []
for k in keys:
    src = os.path.join(PEO, 'raw', f'{k}.png')
    im = Image.open(src).convert('RGB')
    im.save(os.path.join(PEO, f'{k}.jpg'), quality=88)
    bgr = cv2.cvtColor(np.array(im), cv2.COLOR_RGB2BGR)
    H, W = bgr.shape[:2]
    # detect on a ≤ 1024 px copy: on a 2k portrait YuNet misses the big face in front and finds a small one behind
    # (v6: Hana's crop centred on her mother); the box is scaled back to full size
    k_det = min(1.0, 1024 / max(W, H))
    small = cv2.resize(bgr, (round(W * k_det), round(H * k_det)), interpolation=cv2.INTER_AREA) if k_det < 1 else bgr
    det.setInputSize((small.shape[1], small.shape[0]))
    _, f = det.detect(small)
    face, how = None, 'default'
    if f is not None and len(f):
        best = max(f, key=lambda r: r[2] * r[3])
        face = best[:4] / k_det; how = f'yunet {best[14]:.2f}'
    if face is not None:
        x, y, w, h = face
        fx, fy = (x + w / 2) / W, (y + h * 0.55) / H
        cs = min(0.9, max(0.3, 2.4 * w / min(W, H)))
    else:
        fx, fy, cs = 0.5, 0.42, 0.6
    # keep the crop inside the image
    half = cs / 2
    fx = min(max(fx, half), 1 - half); fy = min(max(fy, half), 1 - half)
    out[k] = [f'people/{k}.jpg', round(float(fx), 3), round(float(fy), 3), round(float(cs), 3)]
    s = min(W, H) * cs
    crop = im.crop((int(W * fx - s / 2), int(H * fy - s / 2), int(W * fx + s / 2), int(H * fy + s / 2))).resize((200, 200), Image.LANCZOS)
    m = Image.new('L', (200, 200), 0); ImageDraw.Draw(m).ellipse((0, 0, 199, 199), fill=255)
    t = Image.new('RGB', (200, 224), (24, 24, 28)); t.paste(crop, (0, 0), m)
    ImageDraw.Draw(t).text((6, 204), f'{k} {how}', fill=(255, 220, 80) if how != 'default' else (255, 90, 90))
    tiles.append(t)
json.dump(out, open(os.path.join(PEO, 'crops.json'), 'w'), indent=0)
cols = 8
sheet = Image.new('RGB', (cols * 204, ((len(tiles) + cols - 1) // cols) * 228), (24, 24, 28))
for i, t in enumerate(tiles): sheet.paste(t, ((i % cols) * 204, (i // cols) * 228))
sheet_path = sys.argv[sys.argv.index('--sheet') + 1] if '--sheet' in sys.argv else os.path.join(ROOT, 'out', 'v4', 'faces-sheet.jpg')
os.makedirs(os.path.dirname(os.path.abspath(sheet_path)), exist_ok=True)
sheet.save(sheet_path, quality=88)
print(f'{len(out)} faces, {sum(1 for t in tiles)} tiles; defaults: {[k for k in keys if out[k][1:] == [0.5, 0.42, 0.6]]}')
