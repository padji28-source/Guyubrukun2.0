import { Jimp } from 'jimp';
import path from 'path';

async function generateIcons() {
  try {
    const sourcePath = path.join(process.cwd(), 'public', 'guyubrukun.png');
    console.log(`Reading source image from ${sourcePath}...`);
    
    // Read the source image
    const sourceImage = await Jimp.read(sourcePath);
    
    // Target configurations
    const configs = [
      { name: 'icon-192.png', size: 192 },
      { name: 'icon-512.png', size: 512 },
      { name: 'apple-touch-icon.png', size: 180 }
    ];
    
    for (const config of configs) {
      const outputPath = path.join(process.cwd(), 'public', config.name);
      console.log(`Generating ${config.name} (${config.size}x${config.size})...`);
      
      // Clone the source image and resize it
      const resized = sourceImage.clone();
      resized.resize({ w: config.size, h: config.size });
      
      // Save the resized image
      await resized.write(outputPath);
      console.log(`Successfully generated ${config.name}`);
    }
    
    console.log('Icons generated successfully using guyubrukun.png');
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();
