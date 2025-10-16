// api/read-exif.js
import exifr from 'exifr';

export const config = {
  api: {
    bodyParser: false, // penting! agar body tetap dalam bentuk Buffer
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Ambil buffer dari stream request
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const fileBuffer = Buffer.concat(chunks);

    // Baca metadata EXIF
    const exif = await exifr.parse(fileBuffer);
    const photoTimestamp = exif?.DateTimeOriginal || null;
    let isRecent = false;

    if (photoTimestamp) {
      const sixtySecondsAgo = new Date(Date.now() - 60000);
      if (photoTimestamp >= sixtySecondsAgo) {
        isRecent = true;
      }
    }

    res.status(200).json({
      isPhotoRecent: isRecent,
      photoTakenAt: photoTimestamp,
    });

  } catch (error) {
    console.error(error);
    res.status(200).json({
      isPhotoRecent: false,
      photoTakenAt: null,
      error: 'No EXIF data found or file is corrupted.',
    });
  }
}
