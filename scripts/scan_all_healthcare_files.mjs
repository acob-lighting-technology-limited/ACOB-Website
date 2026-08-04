import fs from 'fs';
import path from 'path';

const rootPath = "C:\\Users\\IT_COMMS\\OneDrive - ACOB Lighting Technology Limited\\ICT\\Projects\\Healthcare Sites";

function scanDir(dir) {
  if (!fs.existsSync(dir)) return;
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      scanDir(fullPath);
    } else {
      console.log(fullPath.replace(rootPath, ""));
    }
  }
}

console.log("Scanning files:");
scanDir(rootPath);
