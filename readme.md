# ⚖️ Nexum - Legal Tech Platform

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Railway](https://img.shields.io/badge/Railway-131415?style=for-the-badge&logo=railway&logoColor=white)

> **Nexum** é uma plataforma SaaS Full-Stack desenvolvida para modernizar o setor jurídico. O sistema atua como um painel administrativo inteligente para escritórios de advocacia, centralizando a gestão de processos, controle de advogados e automação de triagens, conectando o cliente final à estrutura do escritório de forma ágil e segura.

## ✨ Principais Funcionalidades

* 🏢 **Gestão de Escritórios e Advogados:** Controle de acessos e perfis profissionais integrados ao escritório titular.
* 📁 **Acompanhamento de Processos (Cases):** Dashboard intuitivo para visualizar novos casos, atualizar status e níveis de prioridade.
* 🤖 **Triagem Automatizada:** Módulo de recepção e captação de dados iniciais do cliente.
* ☁️ **Armazenamento em Nuvem:** Upload seguro de PDFs e documentos legais integrados ao sistema.
* 🔒 **Segurança Avançada:** Rotas privadas, senhas criptografadas e autenticação via JWT.

## 🛠️ Tecnologias Utilizadas

### Front-end
* **React + Vite:** Para uma interface rápida, responsiva e otimizada.
* **React Router Dom:** Gerenciamento de rotas e proteção de páginas administrativas.
* **Context API:** Controle global de estados e persistência de sessão de usuário.

### Back-end
* **Node.js + Express:** Construção da API RESTful de alta performance.
* **Prisma ORM:** Modelagem de dados, migrações e consultas tipadas.
* **JWT & Bcrypt.js:** Autenticação, autorização e hash de senhas.
* **Multer & Cloudinary:** Gerenciamento, upload e armazenamento definitivo de arquivos e mídias.

### Infraestrutura e Banco de Dados
* **MySQL:** Banco de dados relacional hospedado na nuvem.
* **Railway:** Deploy do Back-end e Banco de Dados operando em rede privada interna, com arquitetura otimizada para baixa latência.
* **Vercel:** Deploy contínuo e hospedagem do Front-end.

## 🚀 Como executar o projeto localmente

### Pré-requisitos
Certifique-se de ter o **Node.js** e o **Git** instalados na sua máquina.

### Passo a Passo

1. **Clone o repositório:**
```bash
git clone [https://github.com/ellenmwnroe/nexum.git](https://github.com/ellenmwnroe/nexum.git)

```
 2. **Configuração do Back-end:**
```bash
cd nexum/nexum-backend
npm install

```
 3. **Crie o arquivo .env no Back-end com as seguintes variáveis:**
```env
DATABASE_URL="mysql://usuario:senha@localhost:3306/nexum"
JWT_SECRET="sua_chave_secreta"
CLOUDINARY_CLOUD_NAME="seu_cloud_name"
CLOUDINARY_API_KEY="sua_api_key"
CLOUDINARY_API_SECRET="seu_api_secret"
FRONTEND_URL="http://localhost:5173"

```
 4. **Inicie o Banco de Dados (Prisma) e o Servidor:**
```bash
npx prisma db push
npm run dev

```
 5. **Configuração do Front-end:**
   Abra um novo terminal e navegue até a pasta do front-end:
```bash
cd nexum/nexum-frontend
npm install

```
 6. **Crie o arquivo .env no Front-end:**
```env
VITE_API_URL="http://localhost:3000"

```
 7. **Inicie a Interface:**
```bash
npm run dev

```
O sistema estará disponível em http://localhost:5173 e a API em http://localhost:3000.

## 👩‍💻 Autora
Desenvolvido com dedicação e foco em arquitetura limpa e infraestrutura escalável por **Ellen Monroe**.
 * **GitHub:** https://www.github.com/ellenmwnroe
 * **LinkedIn:** https://www.linkedin.com/in/ellenmonroediniz
   
```

```
