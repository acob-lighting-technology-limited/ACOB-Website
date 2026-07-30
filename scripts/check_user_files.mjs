import fs from 'fs';
import path from 'path';

const baseDir = "C:\\Users\\IT_COMMS\\OneDrive - ACOB Lighting Technology Limited\\ICT\\Projects\\Healthcare Sites\\Kaduna State";
const dirs = fs.readdirSync(baseDir);
const ikaraDirName = dirs.find(d => d.includes("Ikara"));
const fullDir = path.join(baseDir, ikaraDirName);

const userFiles = [
  "20260604_083048000_iOS.jpg",
  "20260604_085310000_iOS.MOV",
  "20260603_210814000_iOS.jpg",
  "20260603_211622000_iOS.jpg",
  "20260604_080226591_iOS.heic",
  "20260604_082326000_iOS.jpg",
  "20260604_082912000_iOS.jpg"
];

console.log(`Directory: "${fullDir}"`);
for (const file of userFiles) {
  const fPath = path.join(fullDir, file);
  const exists = fs.existsSync(fPath);
  console.log(`File: "${file}" - Exists: ${exists}`);
  if (exists) {
    const stat = fs.statSync(fPath);
    console.log(`  Size: ${(stat.size / 1024 / 1024).toFixed(2)} MB`);
  }
}
