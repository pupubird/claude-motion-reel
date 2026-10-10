# The skies: eleven CC0 HDRIs from Poly Haven (https://polyhaven.com/license), fetched at 4k into assets/hdri/.
# The repo keeps only their names and the measured sun position of each (assets/hdri/hdri_info.json).
#   python3 projects/almostfriends-apple/film/tools/fetch_hdris.py
import json, os, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
HDRI = os.path.abspath(os.path.join(HERE, '..', '..', 'assets', 'hdri'))
for name in json.load(open(os.path.join(HDRI, 'hdri_info.json'))):
    dst = os.path.join(HDRI, name + '.hdr')
    if os.path.exists(dst):
        continue
    url = f'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/4k/{name}_4k.hdr'
    print('fetching', url, flush=True)
    urllib.request.urlretrieve(url, dst + '.part'); os.replace(dst + '.part', dst)
print('skies ready in', HDRI)
