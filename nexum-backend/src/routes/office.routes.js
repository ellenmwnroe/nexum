const express = require('express');
const router = express.Router();
const officeController = require('../controllers/office.controller');
const { ensureAuthenticated } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

// Rota pública para acessar o perfil do escritório sem precisar de token 
router.get('/:id/public', officeController.getPublicProfile);

//  Rota pública para a tela de triagem ler o nome e a cor do robô
router.get('/:id/chatbot-config', officeController.getChatbotConfig);

//  BARREIRA DE SEGURANÇA
router.use(ensureAuthenticated);

// ROTAS PRIVADAS
router.get('/me', officeController.getOffice);

// Rota única de atualização 
router.patch('/me', upload.single('logo'), officeController.updateOffice);

//  Rota para atualizar as configurações do chatbot
router.patch('/me/chatbot-config', upload.single('bot_avatar'), officeController.updateChatbotConfig);

module.exports = router;