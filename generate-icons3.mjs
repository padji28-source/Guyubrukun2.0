import { Jimp } from 'jimp';
import path from 'path';

async function generateIcons() {
  try {
    const sourcePath = path.join(process.cwd(), 'public', 'guyubrukun.png');
    console.log(`Reading source image from ${sourcePath}...`);
    
    const sourceImage = await Jimp.read(sourcePath);
    const bgColor = sourceImage.getPixelColor(0, 0);
    const origWidth = sourceImage.bitmap.width;
    const origHeight = sourceImage.bitmap.height;
    
    // Target configurations
    const configs = [
      { name: 'icon-192.png', size: 192 },
      { name: 'icon-512.png', size: 512 },
      { name: 'apple-touch-icon.png', size: 180 },
      { name: 'splash-logo.png', size: 1024 } // High-res for splash screen
    ];
    
    for (const config of configs) {
      const outputPath = path.join(process.cwd(), 'public', config.name);
      console.log(`Generating ${config.name} (${config.size}x${config.size})...`);
      
      const canvas = new Jimp({
          width: config.size,
          height: config.size,
          color: bgColor
      });
      
      // We want the logo to take up 70% of the container to act as a safe zone for rounded masking
      const paddingFactor = 0.70;
      const targetMaxDim = Math.floor(config.size * paddingFactor);
      
      // Calculate aspect-ratio-preserving dimensions
      let newWidth, newHeight;
      if (origWidth > origHeight) {
          newWidth = targetMaxDim;
          newHeight = Math.floor((origHeight / origWidth) * targetMaxDim);
      } else {
          newHeight = targetMaxDim;
          newWidth = Math.floor((origWidth / origHeight) * targetMaxDim);
      }
      
      const offsetX = Math.floor((config.size - newWidth) / 2);
      const offsetY = Math.floor((config.size - newHeight) / 2);
      
      const resized = sourceImage.clone();
      resized.resize({ w: newWidth, h: newHeight });
      
      canvas.composite(resized, offsetX, offsetY);
      
      await canvas.write(outputPath);
      console.log(`Successfully generated ${config.name}`);
    }
    
    console.log('Icons generated successfully.');
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}
generateIcons();
