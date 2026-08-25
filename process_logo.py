from PIL import Image

def process_logo(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()
    
    newData = []
    for item in datas:
        # Get RGB values
        r, g, b, a = item
        
        # Calculate perceived brightness (luminance)
        luminance = (0.299*r + 0.587*g + 0.114*b)
        
        # If the pixel is pure black or very close to black (the background)
        if r < 15 and g < 15 and b < 15:
            # Make it transparent
            newData.append((255, 255, 255, 0))
        else:
            # The text is too dark to be seen on a white background.
            # Let's boost the brightness/contrast of the text.
            # If it's the very dark blue text, let's make it black or a solid dark blue.
            if luminance < 50:
                # Dark text -> make it bold dark blue or black
                newData.append((10, 20, 50, 255))
            else:
                # Keep bright blue "AI" text exactly as it is
                newData.append((r, g, b, a))
                
    img.putdata(newData)
    img.save(output_path, "PNG")

process_logo("public/images/logo-full.png", "public/images/logo-transparent.png")
