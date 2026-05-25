const fs = require('fs');

async function searchGithub() {
  try {
    // Let's search DavidHaz/react-bits or query GitHub API for BorderGlow files
    console.log("Searching for BorderGlow files in DavidHaz/react-bits...");
    
    // We can fetch the repository tree recursively to see the paths
    const treeUrl = "https://api.github.com/repos/DavidHaz/react-bits/git/trees/main?recursive=1";
    const res = await fetch(treeUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch tree: ${res.statusText}`);
    }
    
    const data = await res.json();
    const borderGlowFiles = data.tree.filter(file => file.path.includes("BorderGlow"));
    console.log("Found files:", JSON.stringify(borderGlowFiles, null, 2));
    
    // For each file, print its raw download URL
    for (const file of borderGlowFiles) {
      if (file.type === "blob") {
        const rawUrl = `https://raw.githubusercontent.com/DavidHaz/react-bits/main/${file.path}`;
        console.log(`Raw URL for ${file.path}: ${rawUrl}`);
      }
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

searchGithub();
