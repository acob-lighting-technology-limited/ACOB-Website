import fs from 'fs';
import path from 'path';

// Check if sharp is installed
let sharp;
try {
  const { default: sharpModule } = await import('sharp');
  sharp = sharpModule;
  console.log("sharp module loaded successfully.");
} catch {
  console.log("sharp module not found, falling back to simple file copy.");
}

const sourceDir = "C:\\Users\\IT_COMMS\\.gemini\\antigravity\\brain\\c98f3380-4e98-4297-a3d7-f2f2815de26a";
const targetDir = "C:\\Users\\IT_COMMS\\GitHubProjects\\ACOB-Website\\public\\images\\services";

const filesToCopy = [
  {
    srcPattern: "healthcare_solarization",
    destWebp: "healthcare-solarization.webp",
    destPng: "healthcare-solarization.png"
  },
  {
    srcPattern: "productive_use_of_energy",
    destWebp: "productive-use-of-energy.webp",
    destPng: "productive-use-of-energy.png"
  }
];

async function run() {
  const brainFiles = fs.readdirSync(sourceDir);
  
  for (const item of filesToCopy) {
    // Find the latest file in sourceDir starting with srcPattern and ending with .png
    const matchingFiles = brainFiles
      .filter(f => f.startsWith(item.srcPattern) && f.endsWith('.png'))
      .map(f => ({
        name: f,
        time: fs.statSync(path.join(sourceDir, f)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time);
      
    if (matchingFiles.length === 0) {
      console.log(`Could not find source image for ${item.srcPattern}`);
      continue;
    }
    
    const latestSrcFile = path.join(sourceDir, matchingFiles[0].name);
    const destWebpPath = path.join(targetDir, item.destWebp);
    
    console.log(`Processing: ${latestSrcFile} -> ${destWebpPath}`);
    
    if (sharp) {
      await sharp(latestSrcFile)
        .webp({ quality: 80 })
        .toFile(destWebpPath);
      console.log(`Successfully converted and saved ${item.destWebp}`);
    } else {
      // Fallback: copy as PNG but name it .png, and we can also copy it as .webp just to satisfy the link if we don't have sharp (though next might throw format error if named webp but is actually png)
      const destPngPath = path.join(targetDir, item.destPng);
      fs.copyFileSync(latestSrcFile, destPngPath);
      fs.copyFileSync(latestSrcFile, destWebpPath); // copy png to webp extension as fallback
      console.log(`Fallback: copied ${latestSrcFile} to target folder.`);
    }
  }
}

run().catch(console.error);
