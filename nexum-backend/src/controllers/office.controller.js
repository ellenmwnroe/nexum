const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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
    const officeId = req.officeId;
    
    // Pegamos apenas os campos que o admin tem permissão para alterar
    const { name, phone, email, address, logo_url } = req.body;

    const updatedOffice = await prisma.office.update({
      where: { id: officeId },
      data: {
        name,
        phone,
        email,
        // Se você tiver endereço ou logo no seu schema do Prisma, já pode colocar aqui!
      }
    });

    return res.json({ 
      success: true, 
      message: "Escritório atualizado com sucesso!", 
      office: updatedOffice 
    });
  } catch (error) {
    console.error("Erro ao atualizar escritório:", error);
    return res.status(500).json({ error: "Erro interno ao atualizar escritório." });
  }
}

module.exports = {
  getOffice,
  updateOffice
};