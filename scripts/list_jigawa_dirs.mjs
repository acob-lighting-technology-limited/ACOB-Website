import fs from 'fs';
import path from 'path';

const jigawaPath = "C:\\Users\\IT_COMMS\\OneDrive - ACOB Lighting Technology Limited\\ICT\\Projects\\Healthcare Sites\\Jigawa State";

if (fs.existsSync(jigawaPath)) {
  const dirs = fs.readdirSync(jigawaPath);
  console.log("Jigawa dirs:");
  dirs.forEach(d => {
    const fullPath = path.join(jigawaPath, d);
    const stat = fs.statSync(fullPath);
    let fileCount = 0;
    let files = [];
    if (stat.isDirectory()) {
      files = fs.readdirSync(fullPath);
      fileCount = files.length;
    }
    console.log(`- Name: "${d}" (Length: ${d.length}), IsDir: ${stat.isDirectory()}, File Count: ${fileCount}`);
    if (fileCount > 0) {
      console.log("  Files:", files.slice(0, 5));
    }
  });
} else {
  console.log("Jigawa path does not exist");
}
