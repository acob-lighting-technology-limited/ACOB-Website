import os
import sys
from PIL import Image
import pillow_heif

pillow_heif.register_heif_opener()

def process_yakowa_images(source_dir, dest_dir, mapping, watermark_path, max_dimension=1920, quality=80, opacity=0.44, size_percentage=20):
    if not os.path.exists(source_dir):
        print(f"Error: Source directory {source_dir} not found.")
        sys.exit(1)
    if not os.path.exists(watermark_path):
        print(f"Error: Watermark {watermark_path} not found.")
        sys.exit(1)
        
    os.makedirs(dest_dir, exist_ok=True)
    watermark_orig = Image.open(watermark_path).convert('RGBA')
    
    for filename, output_filename in mapping.items():
        input_path = os.path.join(source_dir, filename)
        output_path = os.path.join(dest_dir, output_filename)
        
        try:
            print(f"Processing {filename} -> {output_filename}...")
            with Image.open(input_path) as img:
                width, height = img.size
                if width > max_dimension or height > max_dimension:
                    if width > height:
                        new_width = max_dimension
                        new_height = int(height * (max_dimension / width))
                    else:
                        new_height = max_dimension
                        new_width = int(width * (max_dimension / height))
                    img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
                
                img = img.convert('RGBA')
                img_w, img_h = img.size
                
                # Resize watermark
                wm_w = int((img_w * size_percentage) / 100)
                wm_h = int((watermark_orig.height * wm_w) / watermark_orig.width)
                wm_resized = watermark_orig.resize((wm_w, wm_h), Image.Resampling.LANCZOS)
                
                # Apply opacity
                r, g, b, a = wm_resized.split()
                a = a.point(lambda p: int(p * opacity))
                wm_final = Image.merge('RGBA', (r, g, b, a))
                
                # Position Center Down 25%
                x = int((img_w - wm_w) / 2)
                y = int((img_h - wm_h) / 2 + img_h * 0.25)
                
                y = max(0, min(y, img_h - wm_h))
                x = max(0, min(x, img_w - wm_w))
                
                img.paste(wm_final, (x, y), wm_final)
                img.convert('RGB').save(output_path, 'WEBP', quality=quality)
                print(f"  Successfully saved: {output_path}")
        except Exception as e:
            print(f"  Failed: {e}")

if __name__ == '__main__':
    source = "C:\\Users\\IT_COMMS\\OneDrive - ACOB Lighting Technology Limited\\ICT\\Projects\\Healthcare Sites\\Kaduna State\\⁠Sir Patrick Yakowa Hospital, Kafanchan"
    dest = "C:\\Users\\IT_COMMS\\Pictures\\New folder\\Yakowa_Project_Named"
    watermark = "C:\\Users\\IT_COMMS\\GitHubProjects\\ACOB-Website\\public\\images\\acob-logo-dark.png"
    
    mapping = {
        "20260603_102058000_iOS.jpg": "sir-patrick-yakowa-zonal-hospital-1.webp",
        "20260603_102158000_iOS.jpg": "sir-patrick-yakowa-zonal-hospital-2.webp",
        "20260603_095214775_iOS.heic": "sir-patrick-yakowa-zonal-hospital-3.webp",
        "20260603_095248206_iOS.heic": "sir-patrick-yakowa-zonal-hospital-4.webp",
        "20260603_101950000_iOS.jpg": "sir-patrick-yakowa-zonal-hospital-5.webp"
    }
    process_yakowa_images(source, dest, mapping, watermark)
