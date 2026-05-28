const multer = require('multer');

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,  // Trava 1: Arquivo não pode passar de 5MB
    fieldSize: 2 * 1024 * 1024, // Trava 2: Textos normais não podem passar de 2MB
    files: 1,                   // Trava 3: Só aceita 1 arquivo por vez
    parts: 10                   // Trava 4: Limita o número máximo de pedaços da requisição
  }
});

module.exports = upload;