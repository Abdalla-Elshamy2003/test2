const fs = require('fs');
const path = require('path');

const root = process.cwd();
const destRoot = path.join(root, 'public');

async function copyRecursive(src, dest) {
  const srcPath = path.join(root, src);
  const destPath = path.join(destRoot, dest);
  await fs.promises.mkdir(path.dirname(destPath), { recursive: true });

  // Use fs.cp when available (Node 16.7+), fallback otherwise
  if (fs.promises.cp) {
    await fs.promises.cp(srcPath, destPath, { recursive: true });
    return;
  }

  const stats = await fs.promises.stat(srcPath);
  if (stats.isDirectory()) {
    await fs.promises.mkdir(destPath, { recursive: true });
    const items = await fs.promises.readdir(srcPath);
    for (const it of items) {
      await copyRecursive(path.join(src, it), path.join(dest, it));
    }
  } else {
    await fs.promises.copyFile(srcPath, destPath);
  }
}

async function main() {
  const items = ['index.html', 'style.css', 'css', 'images', 'webfonts'];
  try {
    await fs.promises.mkdir(destRoot, { recursive: true });
    for (const it of items) {
      const src = path.join(root, it);
      if (!fs.existsSync(src)) {
        console.warn(`Skipping missing: ${it}`);
        continue;
      }
      console.log(`Copying ${it} -> public/${it}`);
      await copyRecursive(it, it);
    }
    console.log('Static files copied to public/');
  } catch (err) {
    console.error('Error copying static files:', err);
    process.exit(1);
  }
}

main();
