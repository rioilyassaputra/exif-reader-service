// api/read-exif.js
const exifParser = require('exif-reader');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send({ error: 'Method Not Allowed' });
  }

  // Vercel secara otomatis mem-parsing body menjadi buffer
  const fileBuffer = req.body;

  try {
    const exif = exifParser(fileBuffer);
    const photoTimestamp = exif?.exif?.DateTimeOriginal || null;
    let isRecent = false;

    if (photoTimestamp) {
      const sixtySecondsAgo = new Date(Date.now() - 60000);
      if (photoTimestamp >= sixtySecondsAgo) {
        isRecent = true;
      }
    }

    // Kirim kembali hasil yang terstruktur
    res.status(200).json({
      isPhotoRecent: isRecent,
      photoTakenAt: photoTimestamp,
    });

  } catch (error) {
    // Jika tidak ada EXIF atau error lain, kirim hasil negatif
    res.status(200).json({
      isPhotoRecent: false,
      photoTakenAt: null,
      error: 'No EXIF data found or file is corrupted.',
    });
  }
}