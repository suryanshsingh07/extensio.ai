const fs = require('fs');

async function downloadGrainient() {
  try {
    const rawJsUrl = "https://raw.githubusercontent.com/DavidHDev/react-bits/main/src/content/Backgrounds/Grainient/Grainient.jsx";
    const rawCssUrl = "https://raw.githubusercontent.com/DavidHDev/react-bits/main/src/content/Backgrounds/Grainient/Grainient.css";
    
    console.log("Downloading Grainient.jsx...");
    const jsRes = await fetch(rawJsUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!jsRes.ok) throw new Error(`Failed to fetch JS: ${jsRes.statusText}`);
    const jsContent = await jsRes.text();
    fs.writeFileSync("src/components/Grainient.jsx", jsContent);
    
    console.log("Downloading Grainient.css...");
    const cssRes = await fetch(rawCssUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!cssRes.ok) throw new Error(`Failed to fetch CSS: ${cssRes.statusText}`);
    const cssContent = await cssRes.text();
    fs.writeFileSync("src/components/Grainient.css", cssContent);
    
    console.log("Downloaded successfully!");
  } catch (err) {
    console.error("Error:", err);
  }
}

downloadGrainient();
