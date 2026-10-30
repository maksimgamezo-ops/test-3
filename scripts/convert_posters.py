"""Convert original Blender renders into browser-ready WebP posters."""
from pathlib import Path
from PIL import Image
root = Path(__file__).resolve().parents[1]
for name in ['architecture-desktop', 'architecture-mobile']:
    source = root / 'public' / 'images' / f'{name}.png'
    with Image.open(source) as image:
        image.save(source.with_suffix('.webp'), quality=91, method=6)
        print(f'{name}: {image.width}×{image.height}')
