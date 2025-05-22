const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

async function ensureUploadDir() {
  try {
    await fs.access(UPLOAD_DIR);
  } catch (error) {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
}

async function convertBase64ToPng(base64String) {
  await ensureUploadDir();

  const base64Data = base64String.replace(/^data:image\/png;base64,/, "");
  const buffer = Buffer.from(base64Data, 'base64');

  const filename = `${uuidv4()}.png`;
  const filepath = path.join(UPLOAD_DIR, filename);

  await sharp(buffer)
    .png()
    .toFile(filepath);

  // Return the relative path instead of the absolute path
  return `/uploads/${filename}`;
}

module.exports = {
  convertBase64ToPng
};

