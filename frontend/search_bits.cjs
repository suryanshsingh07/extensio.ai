const fs = require('fs');

async function fetchBorderGlow() {
  try {
    const rawUrl = "https://raw.githubusercontent.com/DavidHDev/react-bits/main/src/ts-tailwind/Components/BorderGlow/BorderGlow.tsx";
    console.log("Fetching BorderGlow...");
    const res = await fetch(rawUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch: ${res.statusText}`);
    }
    const content = await res.text();
    fs.writeFileSync("src/components/BorderGlowRaw.tsx", content);
    console.log("Saved full BorderGlowRaw.tsx file!");
  } catch (err) {
    console.error("Error:", err);
  }
}

fetchBorderGlow();
