import { Jimp } from 'jimp';
import path from 'path';

async function generateIcons() {
  try {
    const sourcePath = path.join(process.cwd(), 'public', 'guyubrukun.png');
    console.log(`Reading source image from ${sourcePath}...`);
    
    // Read the source image
    const sourceImage = await Jimp.read(sourcePath);
    const bgColor = sourceImage.getPixelColor(0, 0);
    
    // Target configurations
    const configs = [
      { name: 'icon-192.png', size: 192 },
      { name: 'icon-512.png', size: 512 },
      { name: 'apple-touch-icon.png', size: 180 }
    ];
    
    for (const config of configs) {
      const outputPath = path.join(process.cwd(), 'public', config.name);
      console.log(`Generating ${config.name} (${config.size}x${config.size})...`);
      
      // Create new canvas filled with background color
      const canvas = new Jimp({
          width: config.size,
          height: config.size,
          color: bgColor
      });
      
      // Calculate scaled size for the logo (e.g., 75% of container)
      const targetLogoSize = Math.floor(config.size * 0.70);
      const offset = Math.floor((config.size - targetLogoSize) / 2);
      
      // Clone and resize original
      const resized = sourceImage.clone();
      resized.resize({ w: targetLogoSize, h: targetLogoSize });
      
      // Composite
      canvas.composite(resized, offset, offset);
      
      // Save
      await canvas.write(outputPath);
      console.log(`Successfully generated ${config.name}`);
    }
    
    console.log('Icons generated successfully using guyubrukun.png');
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}
generateIcons();
