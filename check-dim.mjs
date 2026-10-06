import { Jimp } from 'jimp';
async function run() {
  const img = await Jimp.read('public/guyubrukun.png');
  console.log("Width:", img.bitmap.width);
  console.log("Height:", img.bitmap.height);
}
run();
