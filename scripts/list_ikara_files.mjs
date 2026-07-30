import fs from 'fs';
import path from 'path';

const baseDir = "C:\\Users\\IT_COMMS\\OneDrive - ACOB Lighting Technology Limited\\ICT\\Projects\\Healthcare Sites\\Kaduna State";

const dirs = fs.readdirSync(baseDir);
const ikaraDirName = dirs.find(d => d.includes("Ikara"));

if (ikaraDirName) {
  const fullPath = path.join(baseDir, ikaraDirName);
  const files = fs.readdirSync(fullPath);
  console.log(`Ikara folder found: "${ikaraDirName}"`);
  console.log(`Total files: ${files.length}`);
  console.log("First 10 files:", files.slice(0, 10));
} else {
  console.log("Ikara folder not found in Kaduna State");
}
