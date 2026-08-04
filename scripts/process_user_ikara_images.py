import os
import sys
from PIL import Image
import pillow_heif

# Register HEIF opener with PIL
pillow_heif.register_heif_opener()

def process_specific_images(source_dir, dest_dir, file_list, watermark_path, prefix="ikara", max_dimension=1920, quality=80, opacity=0.44, size_percentage=20):
    if not os.path.exists(source_dir):
        print(f"Error: Source directory {source_dir} not found.")
        sys.exit(1)
        
    if not os.path.exists(watermark_path):
        print(f"Error: Watermark path {watermark_path} not found.")
        sys.exit(1)
        
    os.makedirs(dest_dir, exist_ok=True)
    
    print(f"Loading watermark: {watermark_path}")
    watermark_orig = Image.open(watermark_path).convert('RGBA')
    
    for idx, filename in enumerate(file_list):
        input_path = os.path.join(source_dir, filename)
        output_filename = f"{prefix}_user_{idx + 1}_{os.path.splitext(filename)[0]}.webp"
        output_path = os.path.join(dest_dir, output_filename)
        
        try:
            print(f"Processing image {idx + 1}/{len(file_list)}: {filename}...")
            with Image.open(input_path) as img:
                # 1. Resize if larger than max_dimension
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
                
                # 2. Resize watermark based on image width
                wm_w = int((img_w * size_percentage) / 100)
                wm_h = int((watermark_orig.height * wm_w) / watermark_orig.width)
                wm_resized = watermark_orig.resize((wm_w, wm_h), Image.Resampling.LANCZOS)
                
                # 3. Apply opacity
                r, g, b, a = wm_resized.split()
                a = a.point(lambda p: int(p * opacity))
                wm_final = Image.merge('RGBA', (r, g, b, a))
                
                # 4. Position: Center Down 25%
                x = int((img_w - wm_w) / 2)
                y = int((img_h - wm_h) / 2 + img_h * 0.25)
                
                # Boundary check
                y = max(0, min(y, img_h - wm_h))
                x = max(0, min(x, img_w - wm_w))
                
                # Paste watermark
                img.paste(wm_final, (x, y), wm_final)
                
                # Save as WebP
                img.convert('RGB').save(output_path, 'WEBP', quality=quality)
                print(f"  Saved watermarked WebP to: {output_path}")
                
        except Exception as e:
            print(f"  Failed to process {filename}: {e}")

if __name__ == '__main__':
    source = "C:\\Users\\IT_COMMS\\OneDrive - ACOB Lighting Technology Limited\\ICT\\Projects\\Healthcare Sites\\Kaduna State\\⁠Ikara General Hospital, Ikara"
    dest = "C:\\Users\\IT_COMMS\\Pictures\\New folder\\Ikara_User_Processed"
    watermark = "C:\\Users\\IT_COMMS\\GitHubProjects\\ACOB-Website\\public\\images\\acob-logo-dark.png"
    
    images_to_process = [
        "20260604_083048000_iOS.jpg",
        "20260603_210814000_iOS.jpg",
        "20260603_211622000_iOS.jpg",
        "20260604_080226591_iOS.heic",
        "20260604_082326000_iOS.jpg",
        "20260604_082912000_iOS.jpg"
    ]
    
    process_specific_images(source, dest, images_to_process, watermark)
