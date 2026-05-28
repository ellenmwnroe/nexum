const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { 
        folder: 'nexum/avatars',
        transformation: [{ width: 300, height: 300, crop: "fill" }] 
      },
      (error, result) => {
        if (error) {
          return reject(new Error(error.message || "Erro desconhecido no Cloudinary")); 
        }
        resolve(result);
      }
    );
    stream.end(fileBuffer);
  });
};

async function getProfile(req, res) {
  try {
    const lawyerId = req.userId || req.lawyerId || req.user?.id;

    const lawyer = await prisma.lawyer.findUnique({
      where: { id: lawyerId },
      select: { id: true, name: true, email: true, phone: true, avatar_url: true } // Não envia a senha de volta!
    });

    if (!lawyer) return res.status(404).json({ error: "Usuário não encontrado." });
    return res.json(lawyer);
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    return res.status(500).json({ error: "Erro interno ao buscar perfil." });
  }
}

// 2. ATUALIZAR TEXTO + FOTO NO CLOUDINARY
async function updateProfile(req, res) {
  try {
    const lawyerId = req.userId || req.lawyerId || req.user?.id;
    const { name, email, phone } = req.body;
    
    const dataToUpdate = { name, email, phone };

    // Se o usuário selecionou uma foto nova no computador
    if (req.file) {
      const cloudinaryResult = await uploadToCloudinary(req.file.buffer);
      dataToUpdate.avatar_url = cloudinaryResult.secure_url; // Salva o link https seguro do Cloudinary
    }

    const updatedLawyer = await prisma.lawyer.update({
      where: { id: lawyerId },
      data: dataToUpdate
    });

    return res.json({ success: true, message: "Perfil atualizado!", lawyer: updatedLawyer });
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    return res.status(500).json({ error: "Erro interno ao salvar perfil." });
  }
}

module.exports = { getProfile, updateProfile };