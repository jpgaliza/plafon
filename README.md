# Plafon

Plafon e uma aplicacao web de gestao financeira inteligente projetada com uma abordagem mobile-first, que foca na facilidade e rapidez do registro de transacoes.

## Proposito do Projeto

O objetivo do Plafon e simplificar o controle financeiro pessoal. Ele oferece aos usuarios uma interface muito intuitiva para:
- Registro rapido e facil de receitas e despesas.
- Visao detalhada e categorizada de todos os gastos mensais atraves de dashboards e graficos.
- Radar de assinaturas, permitindo um controle eficaz de servicos recorrentes sem surpresas na fatura.
- Acompanhamento do orcamento restante (teto de gastos) em tempo real, informando o quanto de dinheiro ainda pode ser gasto.

O sistema foi desenhado para ser extremamente agil no celular (seu habitat principal) e se adaptar elegantemente em versoes desktop (com suporte a sidebars e paineis amplos), proporcionando uma experiencia imersiva e fluida em qualquer dispositivo.

## Tecnologias Utilizadas

Este projeto foi construido utilizando as mais modernas tecnologias do ecossistema web:

- **Next.js (App Router)**: Framework React para roteamento, renderizacao e otimizacao.
- **React**: Biblioteca de interface de usuario.
- **Tailwind CSS**: Framework utilitario para estilizacao e layouts responsivos.
- **Framer Motion**: Biblioteca para animacoes de transicao suaves.
- **Recharts**: Criacao de graficos interativos de categorias.
- **Vaul**: Componentes de Drawer acessiveis para interacoes mobile.
- **Lucide React**: Iconografia moderna.
- **Next-Intl**: Internacionalizacao e localizacao de formatacao (datas, moedas).
- **Three.js / React Three Fiber**: Renderizacao do modelo 3D interativo na Landing Page.

## Como Rodar Localmente

Siga os passos abaixo para executar a aplicacao em seu ambiente de desenvolvimento.

### Pre-requisitos

Certifique-se de ter instalado em sua maquina:
- Node.js (versao 18 ou superior recomendada)
- NPM, Yarn, pnpm ou bun.

### Instalacao e Execucao

1. Clone o repositorio e instale as dependencias do projeto:
```bash
npm install
```

2. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

3. Abra o seu navegador e acesse:
```
http://localhost:3000
```

O servidor de desenvolvimento recarregara a pagina automaticamente sempre que voce realizar edicoes nos arquivos.
