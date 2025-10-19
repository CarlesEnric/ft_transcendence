import multer from 'fastify-multer';
import path from 'path';

// Configuració de l'emmagatzematge per a avatars
const storage = multer.diskStorage({
  destination: function (req: any, file: any, cb: any) {
  cb(null, '/app/uploads');
  },
  filename: function (req: any, file: any, cb: any) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Filtre per acceptar només imatges
const fileFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Només es permeten imatges!'), false);
  }
};

const upload = multer({ storage, fileFilter });

export default upload as any;
