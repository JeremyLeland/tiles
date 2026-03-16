from PIL import Image
from pathlib import Path

folder = '/home/iggames/Downloads/kenney/kenney_sketch-desert/Tiles/'
# output_path = '/home/iggames/Downloads/kenney_sketch-desert_combined_ADAPTIVE_optimize9.png'
# output_path = '/home/iggames/Downloads/kenney_sketch-desert_combined_optimize9.png'
output_path = '/home/iggames/Downloads/kenney_sketch-desert_combined.png'

# files = [ f for f in os.listdir( folder ) if f.endswith( '.png' ) ]
files = list( Path( folder ).glob( '*png' ) )
files.sort()

# Load all images
imgs = [ Image.open( f ) for f in files ]

# Calculate total width and max height
max_width = max( img.width for img in imgs )
max_height = max( img.height for img in imgs )

cols = int( len( imgs ) / 4 )

# Create new blank image
combined = Image.new( 'RGBA', ( cols * max_width, 4 * max_height ) )

# Paste each image
x_offset = 0
y_offset = 0
for img in imgs:
  print( img, 'colors: ', len( img.getcolors(maxcolors=10_000_000) ) )
  combined.paste( img, ( x_offset * img.width, y_offset * img.height ) )
  y_offset += 1
  if y_offset == 4:
    x_offset += 1
    y_offset = 0


# combined = combined.convert("P", palette=Image.ADAPTIVE)  # lossy
# combined.save( output_path, optimize=True, compress_level=9 ) # slower
combined.save( output_path )

print( 'Combined colors: ', len( combined.getcolors(maxcolors=10_000_000) ) )

# If colors <= 256, can use this
# palette_img = combined.quantize(colors=256, method=Image.MAXCOVERAGE)

# combined = combined.convert("P", palette=Image.ADAPTIVE)  # lossy
# combined.save( output_path, optimize=True, compress_level=9 ) # slower
# combined.save( output_path )
