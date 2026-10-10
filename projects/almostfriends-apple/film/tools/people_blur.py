# The frost: every cast portrait pre-blurred (Gaussian, sigma = 5% of a 1024 px side), so no face can be read
# through the glass until the reveal melts it. The sharp photos stay in ../almostfriends/assets/people.
#   python3 projects/almostfriends-apple/film/tools/people_blur.py
import glob, os
from PIL import Image, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
PROJECT = os.path.abspath(os.path.join(HERE, '..', '..'))
SRC = os.path.abspath(os.path.join(PROJECT, '..', 'almostfriends', 'assets', 'people'))
OUT = os.path.join(PROJECT, 'assets', 'people_blur')
os.makedirs(OUT, exist_ok=True)
for path in sorted(glob.glob(os.path.join(SRC, '*.jpg'))):
    im = Image.open(path).convert('RGB').resize((1024, 1024), Image.LANCZOS)
    im.filter(ImageFilter.GaussianBlur(0.05 * 1024)).save(os.path.join(OUT, os.path.basename(path)), quality=90)
print('blurred', len(glob.glob(os.path.join(OUT, '*.jpg'))), 'portraits into', OUT)
