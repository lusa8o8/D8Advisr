const sharp = require("sharp");
const path = require("path");

const src = path.join(__dirname, "../public/icons/icon.svg");
const dest = path.join(__dirname, "../public/icons");

async function main() {
  await sharp(src).resize(192, 192).png().toFile(path.join(dest, "icon-192.png"));
  console.log("icon-192.png generated");
  await sharp(src).resize(512, 512).png().toFile(path.join(dest, "icon-512.png"));
  console.log("icon-512.png generated");
}

main().catch((err) => { console.error(err); process.exit(1); });
