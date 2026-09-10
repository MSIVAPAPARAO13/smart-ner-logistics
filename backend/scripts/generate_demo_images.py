import os
import struct
import zlib

def create_png(filename: str, width: int, height: int, color_fn):
    """Generates an uncompressed/zlib-compressed valid PNG image."""
    raw_data = bytearray()
    for y in range(height):
        raw_data.append(0)  # filter type 0 (None)
        for x in range(width):
            r, g, b = color_fn(x, y, width, height)
            raw_data.extend([r, g, b])

    compressed = zlib.compress(bytes(raw_data), level=6)

    def chunk(tag: bytes, data: bytes) -> bytes:
        length = struct.pack(">I", len(data))
        crc = struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
        return length + tag + data + crc

    png_header = b"\x89PNG\r\n\x1a\n"
    ihdr = chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0))
    idat = chunk(b"IDAT", compressed)
    iend = chunk(b"IEND", b"")

    with open(filename, "wb") as f:
        f.write(png_header + ihdr + idat + iend)


def generate_all_demo_images(target_dir: str):
    os.makedirs(target_dir, exist_ok=True)
    w, h = 480, 320

    # 1. Flooded Road Demo (Muddy water submerged road with alert banner)
    def flood_pixel(x, y, width, height):
        # Bottom 15% is watermark banner
        if y > height - 40:
            return (15, 23, 42) if (x // 20) % 2 == 0 else (30, 41, 59)
        # Water level in middle/lower half
        if y > height // 2:
            water_depth = (y - height // 2) / (height // 2)
            r = int(50 + water_depth * 30 + ((x * y) % 15))
            g = int(80 + water_depth * 40 + ((x + y) % 20))
            b = int(120 + water_depth * 50)
            return (min(255, r), min(255, g), min(255, b))
        # Sky and hills above
        t = y / (height // 2)
        return (int(100 + t * 40), int(120 + t * 50), int(130 + t * 40))

    # 2. Bridge Damage Demo (Torrential river under truss bridge)
    def bridge_pixel(x, y, width, height):
        if y > height - 40:
            return (20, 30, 50) if (x // 20) % 2 == 0 else (40, 50, 70)
        # Steel truss bridge silhouette in upper half
        if 80 < y < 140 and (x % 40 < 6 or (x + y) % 40 < 6 or (x - y) % 40 < 6):
            return (220, 80, 50)  # Reddish-orange bridge truss
        # Raging river below
        if y > 140:
            turbulence = (x * 7 + y * 13) % 45
            return (160 + turbulence, 110 + turbulence // 2, 70)
        return (140, 160, 180)

    # 3. Landslide Demo (Mud slurry cutting across mountain asphalt)
    def landslide_pixel(x, y, width, height):
        if y > height - 40:
            return (40, 20, 20) if (x // 20) % 2 == 0 else (60, 30, 30)
        # Diagonal mudflow across road
        diag = (x * 0.8 + y)
        if 180 < diag < 360:
            noise = (x * 11 + y * 17) % 30
            return (130 + noise, 80 + noise // 2, 45)  # Brown mud slurry
        if y > 180:
            return (60, 64, 72)  # Gray asphalt
        return (45, 90, 45)  # Green mountain slope

    # 4. Heavy Rainfall Demo (Monsoon storm curtain)
    def rain_pixel(x, y, width, height):
        if y > height - 40:
            return (10, 25, 45) if (x // 20) % 2 == 0 else (20, 35, 60)
        # Rain streaks
        is_streak = ((x * 2 - y * 5) % 37) < 3
        base = int(40 + (y / height) * 60)
        if is_streak:
            return (min(255, base + 90), min(255, base + 110), min(255, base + 150))
        return (base, base + 15, base + 35)

    # 5. Road Debris Demo (Boulders on mountain pass)
    def debris_pixel(x, y, width, height):
        if y > height - 40:
            return (30, 35, 40) if (x // 20) % 2 == 0 else (50, 55, 60)
        # Center boulder cluster
        dx = x - width // 2
        dy = y - (height // 2 + 30)
        dist_sq = dx * dx + dy * dy * 1.8
        if dist_sq < 3600:
            texture = (x * 5 + y * 7) % 40
            return (120 + texture, 115 + texture, 110 + texture)
        if y > 160:
            return (70, 75, 80)
        return (80, 110, 80)

    images = [
        ("flooded_road_demo.png", flood_pixel),
        ("bridge_damage_demo.png", bridge_pixel),
        ("landslide_demo.png", landslide_pixel),
        ("heavy_rainfall_demo.png", rain_pixel),
        ("road_debris_demo.png", debris_pixel),
    ]

    for fname, p_fn in images:
        fpath = os.path.join(target_dir, fname)
        create_png(fpath, w, h, p_fn)
        # Also copy/create .jpg alias for maximum compatibility
        jpg_alias = os.path.join(target_dir, fname.replace(".png", ".jpg"))
        with open(fpath, "rb") as src, open(jpg_alias, "wb") as dst:
            dst.write(src.read())
        print(f"Generated demo evidence image: {fname} and {os.path.basename(jpg_alias)}")


if __name__ == "__main__":
    import sys
    target = sys.argv[1] if len(sys.argv) > 1 else os.path.join("backend", "app", "static", "uploads")
    generate_all_demo_images(target)
