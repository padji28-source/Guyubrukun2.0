import { Jimp, rgbaToInt } from 'jimp';

async function run() {
  const img = await Jimp.read('public/guyubrukun.png');
  // Get color at 0,0
  const color = img.getPixelColor(0, 0);
  console.log("Edge color (int):", color);
  console.log("Edge color (hex):", color.toString(16));
}
run();
