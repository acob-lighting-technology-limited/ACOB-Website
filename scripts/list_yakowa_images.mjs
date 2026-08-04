import fs from 'fs';
import path from 'path';

const baseDir = "C:\\Users\\IT_COMMS\\OneDrive - ACOB Lighting Technology Limited\\ICT\\Projects\\Healthcare Sites\\Kaduna State";
const dirs = fs.readdirSync(baseDir);
const yakowaDirName = dirs.find(d => d.includes("Yakowa"));

if (yakowaDirName) {
  const fullPath = path.join(baseDir, yakowaDirName);
  const files = fs.readdirSync(fullPath);
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.heic', '.heif'];
  const images = files.filter(f => imageExtensions.includes(path.extname(f).toLowerCase()));
  
  console.log(`Yakowa image files (${images.length}):`);
  images.forEach(f => {
    const fPath = path.join(fullPath, f);
    const stat = fs.statSync(fPath);
    console.log(`- ${f} (${(stat.size / 1024 / 1024).toFixed(2)} MB)`);
  });
} else {
  console.log("Yakowa folder not found");
}
