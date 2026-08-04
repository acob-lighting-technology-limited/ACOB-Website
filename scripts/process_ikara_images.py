import os
import sys
from PIL import Image
import pillow_heif

# Register HEIF opener with PIL
pillow_heif.register_heif_opener()

def process_ikara_images(source_dir, dest_dir, watermark_path, count=6, max_dimension=1920, quality=80, opacity=0.44, size_percentage=20):
    if not os.path.exists(source_dir):
        print(f"Error: Source directory {source_dir} not found.")
        sys.exit(1)
        
    if not os.path.exists(watermark_path):
        print(f"Error: Watermark path {watermark_path} not found.")
        sys.exit(1)
        
    os.makedirs(dest_dir, exist_ok=True)
    
    # List all image files
    supported_extensions = ('.jpg', '.jpeg', '.png', '.heic', '.heif')
    files = [f for f in os.listdir(source_dir) if f.lower().endswith(supported_extensions)]
    files.sort()
    
    if not files:
        print("No images found to process.")
        return
        
    print(f"Total image files found: {len(files)}")
    
    # Let's select a representative subset of 'count' files
    # We want a spread across the images, but let's filter out very small files (less than 100KB) just in case
    valid_files = []
    for f in files:
        f_path = os.path.join(source_dir, f)
        if os.path.getsize(f_path) > 100 * 1024: # > 100KB
            valid_files.append(f)
            
    if len(valid_files) < count:
        valid_files = files
        
    # Pick dispersed files
    step = max(1, len(valid_files) // count)
    selected_files = [valid_files[i * step] for i in range(count)]
    # Ensure uniqueness
    selected_files = list(dict.fromkeys(selected_files))[:count]
    
    # If not enough, append others
    for f in valid_files:
        if len(selected_files) >= count:
            break
        if f not in selected_files:
            selected_files.append(f)
            
    print(f"Selected {len(selected_files)} images for processing:")
    for f in selected_files:
        print(f"  - {f}")
        
    print(f"Loading watermark: {watermark_path}")
    watermark_orig = Image.open(watermark_path).convert('RGBA')
    
    for idx, filename in enumerate(selected_files):
        input_path = os.path.join(source_dir, filename)
        output_filename = f"ikara_{idx + 1}_{os.path.splitext(filename)[0]}.webp"
        output_path = os.path.join(dest_dir, output_filename)
        
        try:
            print(f"Processing image {idx + 1}/{len(selected_files)}: {filename}...")
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
    dest = "C:\\Users\\IT_COMMS\\Pictures\\New folder\\Ikara_Processed"
    watermark = "C:\\Users\\IT_COMMS\\GitHubProjects\\ACOB-Website\\public\\images\\acob-logo-dark.png"
    process_ikara_images(source, dest, watermark)
