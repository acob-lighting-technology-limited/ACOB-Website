import fs from 'fs';
import path from 'path';

const rootPath = "C:\\Users\\IT_COMMS\\OneDrive - ACOB Lighting Technology Limited";

function search(dir) {
  try {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      let stat;
      try {
        stat = fs.statSync(fullPath);
      } catch (e) {
        continue;
      }
      if (stat.isDirectory()) {
        if (item.includes("Jigawa") || item.includes("Babura") || item.includes("Hadejia") || item.includes("Kazaure") || item.includes("Rasheed")) {
          console.log(`[DIR] Match: ${fullPath}`);
          console.log(`      Contents:`, fs.readdirSync(fullPath).slice(0, 10));
        }
        search(fullPath);
      } else {
        if (item.includes("Jigawa") || item.includes("Babura") || item.includes("Hadejia") || item.includes("Kazaure") || item.includes("Rasheed")) {
          console.log(`[FILE] Match: ${fullPath}`);
        }
      }
    }
  } catch (e) {
    // ignore
  }
}

search(rootPath);
console.log("Search finished.");
