import os
from PIL import Image

def remove_background(image_path, output_logo_path, output_favicon_path):
    img = Image.open(image_path)
    img = img.convert("RGBA")
    
    # Read image pixels
    data = img.getdata()
    new_data = []
    
    # We key out black pixels (R < 18, G < 18, B < 18) to make the background transparent
    for item in data:
        if item[0] < 18 and item[1] < 18 and item[2] < 18:
            new_data.append((0, 0, 0, 0))  # Transparent alpha channel
        else:
            new_data.append(item)
            
    # Write transparent image
    img.putdata(new_data)
    img.save(output_logo_path, "PNG")
    print(f"Transparent logo saved to {output_logo_path}")
    
    # Resize and save transparent favicon as .ico
    img_fav = img.resize((32, 32), Image.Resampling.LANCZOS)
    img_fav.save(output_favicon_path, format="ICO")
    print(f"Transparent favicon saved to {output_favicon_path}")

# Source path to the generated image
src_logo = r"C:\Users\aswin\.gemini\antigravity-ide\brain\c00ad650-d8d7-4e61-aef6-24f18c622b49\varahi_logo_new_1782198215083.png"
dest_logo = r"f:\Projects\Varahi\apps\owner-dashboard\public\logo.png"
dest_favicon = r"f:\Projects\Varahi\apps\owner-dashboard\src\app\favicon.ico"

def remove_background(image_path, output_logo_path, output_favicon_path):
    img = Image.open(image_path)
    img = img.convert("RGBA")
    
    # Read image pixels
    data = img.getdata()
    new_data = []
    
    # Key out black or dark grey pixels (e.g. background) to make it transparent
    for item in data:
        # If the pixel is very dark (background)
        if item[0] < 35 and item[1] < 35 and item[2] < 35:
            new_data.append((0, 0, 0, 0))  # Transparent
        else:
            new_data.append(item)
            
    # Write transparent image
    img.putdata(new_data)
    img.save(output_logo_path, "PNG")
    print(f"Transparent logo saved to {output_logo_path}")
    
    # Resize and save transparent favicon as .ico
    img_fav = img.resize((32, 32), Image.Resampling.LANCZOS)
    img_fav.save(output_favicon_path, format="ICO")
    print(f"Transparent favicon saved to {output_favicon_path}")

if __name__ == "__main__":
    if os.path.exists(src_logo):
        remove_background(src_logo, dest_logo, dest_favicon)
    else:
        print(f"Source image not found: {src_logo}")

