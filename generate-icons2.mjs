import sharp from 'sharp';

async function generate() {
  const input = 'public/guyubrukun.png';
  await sharp(input).resize(192, 192, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } }).png().toFile('public/icon-192.png');
  await sharp(input).resize(512, 512, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } }).png().toFile('public/icon-512.png');
  await sharp(input).resize(180, 180, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } }).png().toFile('public/apple-touch-icon.png');
  console.log('Icons generated successfully');
}

generate().catch(console.error);
