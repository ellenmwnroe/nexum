const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { uploadToCloudinary } = require('../services/cloudinary.service');

async function getOffice(req, res) {
  try {
    // Pegamos o ID seguro que veio do Token!
    const officeId = req.officeId;

    const office = await prisma.office.findUnique({
      where: { id: officeId }
    });

    if (!office) {
      return res.status(404).json({ error: "Escritório não encontrado." });
    }

    return res.json(office);
  } catch (error) {
    console.error("Erro ao buscar escritório:", error);
    return res.status(500).json({ error: "Erro interno ao buscar dados do escritório." });
  }
}

async function updateOffice(req, res) {
  try {
    // 1. Pega o ID (do token de segurança ou da URL)
    const officeId = req.officeId || req.params.id; 
    
    // 2. Puxa TODOS os campos vitais do Front-end
    const { name, email, phone, address } = req.body;
    
    // 3. Monta o objeto com tudo para o Prisma
    const dataToUpdate = { name, email, phone, address };

    // 4. SE veio uma foto nova pelo Multer, manda pro Cloudinary!
    if (req.file) {
      const cloudinaryResult = await uploadToCloudinary(req.file.buffer, 'nexum/logos');
      dataToUpdate.logo_url = cloudinaryResult.secure_url;
    }

    // 5. Salva tudo no banco de dados de uma vez só
    const updatedOffice = await prisma.office.update({
      where: { id: officeId },
      data: dataToUpdate
    });

    return res.json({ 
      success: true, 
      message: "Perfil do escritório atualizado com sucesso!", 
      office: updatedOffice 
    });

  } catch (error) {
    console.error("Erro ao atualizar escritório:", error.message);
    return res.status(500).json({ error: "Erro interno ao salvar os dados." });
  }
}
// Função PÚBLICA para a tela de Triagem
async function getPublicProfile(req, res) {
  try {
    const { id } = req.params;

    // Busca o escritório, mas seleciona APENAS nome e logo por segurança
    const office = await prisma.office.findUnique({
      where: { id: id },
      select: { 
        id: true, 
        name: true, 
        logo_url: true 
      }
    });

    if (!office) {
      return res.status(404).json({ error: "Escritório não encontrado." });
    }

    return res.json(office);
  } catch (error) {
    console.error("Erro ao carregar perfil público do escritório:", error);
    return res.status(500).json({ error: "Erro interno do servidor." });
  }
}

// ==========================================
// CONFIGURAÇÕES DO CHATBOT
// ==========================================

// Subtask: GET /public/office/:officeId/chatbot-config
async function getChatbotConfig(req, res) {
  try {
    const { id } = req.params;

    const config = await prisma.office.findUnique({
      where: { id: id },
      select: {
        bot_name: true,
        bot_avatar_url: true,
        bot_welcome_message: true,
        bot_privacy_message: true,
        primary_color: true,
        name: true,
        logo_url: true 
      }
    });

    if (!config) {
      return res.status(404).json({ error: "Escritório não encontrado." });
    }

    return res.json(config);
  } catch (error) {
    console.error("Erro ao carregar configurações do chatbot:", error.message);
    return res.status(500).json({ error: "Erro interno do servidor." });
  }
}

// Subtask: PATCH /office/me/chatbot-config
async function updateChatbotConfig(req, res) {
  try {
    const officeId = req.officeId;
    
    // Pega os textos do Front-end
    const { bot_name, bot_welcome_message, bot_privacy_message, primary_color } = req.body;
    const dataToUpdate = { bot_name, bot_welcome_message, bot_privacy_message, primary_color };

    // Se o admin enviou uma foto específica para o bot, sobe pro Cloudinary!
    if (req.file) {
      const cloudinaryResult = await uploadToCloudinary(req.file.buffer, 'nexum/bots');
      dataToUpdate.bot_avatar_url = cloudinaryResult.secure_url;
    }

    const updatedOffice = await prisma.office.update({
      where: { id: officeId },
      data: dataToUpdate
    });

    return res.json({ 
      success: true, 
      message: "Identidade do chatbot atualizada com sucesso!", 
      config: updatedOffice 
    });
  } catch (error) {
    console.error("Erro ao atualizar chatbot:", error.message);
    return res.status(500).json({ error: "Erro interno ao salvar os dados." });
  }
}

module.exports = {
  getOffice,
  updateOffice,
  getPublicProfile,
  getChatbotConfig,
  updateChatbotConfig
};