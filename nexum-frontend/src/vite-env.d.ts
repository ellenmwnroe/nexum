/// <reference types="vite/client" />

/// <reference types="vite/client" />

// Define quais variáveis de ambiente existem no seu projeto
interface ImportMetaEnv {
    readonly VITE_API_URL: string;
    // Você pode adicionar outras aqui no futuro, como:
    // readonly VITE_CHAVE_SECRETA: string;
}

// Diz para o TypeScript juntar isso com o ImportMeta padrão do Vite
interface ImportMeta {
    readonly env: ImportMetaEnv;
}