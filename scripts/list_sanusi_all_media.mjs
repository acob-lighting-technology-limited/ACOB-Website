import fs from 'fs';
import path from 'path';

const baseDir = "C:\\Users\\IT_COMMS\\OneDrive - ACOB Lighting Technology Limited\\ICT\\Projects\\Healthcare Sites\\Kano State";
const dirs = fs.readdirSync(baseDir);
const sanusiDirName = dirs.find(d => d.includes("Sanusi"));
const fullPath = path.join(baseDir, sanusiDirName);

const files = fs.readdirSync(fullPath);
const images = files.filter(f => ['.jpg', '.jpeg', '.png', '.heic', '.heif'].includes(path.extname(f).toLowerCase()));
const videos = files.filter(f => ['.mp4', '.mov'].includes(path.extname(f).toLowerCase()));

console.log(`Directory: "${fullPath}"`);
console.log(`\n--- Images (${images.length}) ---`);
images.forEach((f, i) => {
  const stat = fs.statSync(path.join(fullPath, f));
  console.log(`${i + 1}. ${f} (${(stat.size / 1024 / 1024).toFixed(2)} MB)`);
});

console.log(`\n--- Videos (${videos.length}) ---`);
videos.forEach((f, i) => {
  const stat = fs.statSync(path.join(fullPath, f));
  console.log(`${i + 1}. ${f} (${(stat.size / 1024 / 1024).toFixed(2)} MB)`);
});
