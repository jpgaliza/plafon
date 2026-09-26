<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Diretrizes do Projeto Plafon (AGENTS.md)

Este documento estabelece as regras, convenções arquiteturais e diretrizes de design que qualquer agente de inteligência artificial ou desenvolvedor deve seguir rigorosamente ao trabalhar no repositório **Plafon**.

---

## 1. Visão Geral do Produto

O **Plafon** é uma aplicação web moderna de gestão financeira pessoal inteligente, desenhada com foco prioritário em:
- **Mobile-First UX**: Registro ultrarrápido de despesas e receitas, navegação pelo polegar e uso de drawers inferiores (Vaul).
- **Teto de Gastos (Plafon)**: Acompanhamento em tempo real de quanto resta do orçamento mensal planejado.
- **Radar de Assinaturas**: Rastreamento e antecipação de custos fixos e serviços recorrentes.
- **Visualização Analítica**: Gráficos de categorias limpos e intuitivos, proporcionando clareza financeira imediata.
- **Adaptação Desktop**: Layout responsivo que aproveita telas maiores com sidebars e cards bem distribuídos sem perder a elegância tátil do mobile.

---

## 2. Stack Tecnológica

- **Framework**: Next.js 16 (App Router)
- **UI & Runtime**: React 19, TypeScript (modo estrito)
- **Estilização**: Tailwind CSS v4 (`@tailwindcss/postcss`, `tw-animate-css`) com tokens semânticos baseados no Shadcn UI
- **Animações**: Framer Motion
- **Componentes de Gaveta/Bottom Drawer**: Vaul
- **Gráficos**: Recharts
- **Gráficos 3D**: Three.js, `@react-three/fiber`, `@react-three/drei` (modelo 3D interativo na Landing Page)
- **Internacionalização**: `next-intl` (localização de moedas, números e datas)
- **Backend / Database**: Supabase (`@supabase/supabase-js`, `@supabase/ssr`)
- **Ícones**: Lucide React

---

## 3. Diretrizes de Design & UI/UX

Ao criar ou modificar qualquer componente ou página, siga estritamente estas regras de design:

### 3.1. Estética Dark Premium
- O aplicativo adota uma identidade visual escura moderna e sofisticada.
- **Cores de Fundo**: Utilize `--background` (`#0a0a0a` ou neutros muito escuros).
- **Cards e Superfícies**: Tons escuros ligeiramente elevados (`#121212`, `bg-card`), com bordas sutis (`border-white/10` ou `border-border`).
- **Separadores e Linhas**: Sempre finos e em tons cinza escuro ou com opacidade controlada (`border-[#262626]`, `divide-white/5`).
- **Tipografia**: Fontes limpas e modernas (`Geist Sans`, `Geist Mono`, `Outfit`), respeitando hierarquia visual clara e sem títulos sobrecarregados.
- **Arredondamento**: Cantos harmoniosos (`rounded-xl` a `rounded-2xl` para cards e modais; `rounded-full` para badges e pills).

### 3.2. Prioridade Mobile-First
- Todo fluxo principal (adicionar transação, visualizar saldo, navegar entre abas) deve funcionar perfeitamente em telas compactas (375px a 430px).
- Elementos táteis (botões, seletores, ícones clicáveis) devem ter área de clique mínima confortável (mínimo 44x44px).
- No mobile, priorizar gavetas inferiores (`Vaul Drawer`) em vez de modais flutuantes centralizados.
- Para campos de data em dispositivos móveis, prefira o comportamento nativo com acionamento programático (`input.showPicker()`) para manter o teclado/calendário nativo do sistema operacional rápido e responsivo.

### 3.3. Microinterações
- Use `framer-motion` para transições de entrada, feedback de toque e alternância de abas/filtros.
- Evite animações lentas ou pesadas que prejudiquem a sensação de agilidade.

---

## 4. Estrutura do Código & Convenções

```
plafon/
├── src/
│   ├── app/
│   │   ├── (dashboard)/       # Rotas autenticadas da aplicação
│   │   │   ├── dashboard/     # Visão geral, saldo, teto de gastos e gráficos
│   │   │   ├── transactions/  # Histórico e extrato de transações
│   │   │   ├── categories/    # Gestão e acompanhamento por categoria
│   │   │   ├── subscriptions/ # Radar de assinaturas e despesas recorrentes
│   │   │   ├── settings/      # Configurações do usuário e perfil
│   │   │   ├── actions.ts     # Server Actions do dashboard
│   │   │   └── layout.tsx     # Shell com Sidebar (desktop) e Bottom Bar (mobile)
│   │   ├── globals.css        # Importação do Tailwind v4 e variáveis de tema
│   │   ├── layout.tsx         # Layout raiz da aplicação
│   │   └── page.tsx           # Landing Page com modelo 3D (iPhone showcase)
│   ├── components/
│   │   ├── layout/            # Componentes estruturais (header, sidebar, nav)
│   │   ├── ui/                # Primitivos de UI reutilizáveis
│   │   ├── category-chart.tsx # Componente de gráfico de categorias
│   │   ├── iphone-canvas.tsx  # Renderizador 3D Three.js
│   │   └── transaction-drawer.tsx # Drawer mobile de criação de transações
│   ├── lib/
│   │   ├── supabase/          # Clientes do Supabase (client, server, middleware)
│   │   ├── categories.ts      # Definições, cores e ícones das categorias
│   │   ├── currency.ts        # Utilitários de formatação de moedas
│   │   ├── types.ts           # Interfaces e tipos TypeScript fundamentais
│   │   └── utils.ts           # Função cn() e utilitários gerais
│   └── i18n/                  # Configurações de internacionalização
```

### 4.1. Server Components vs. Client Components
- Adote **Server Components** por padrão em todas as páginas e layouts para maximizar desempenho e SEO.
- Utilize `'use client'` exclusivamente onde houver hooks de estado (`useState`, `useEffect`), eventos do navegador, animações interativas ou manipulação de Canvas/DOM.

### 4.2. TypeScript
- Não utilize tipos `any` desnecessários.
- Defina tipos de dados compartilhados em [types.ts](file:///d:/Pastas%20Windows/Documents/Projetos%20VSCODE/plafon/src/lib/types.ts).
- Centralize constantes de categorias e seus metadados visuais em [categories.ts](file:///d:/Pastas%20Windows/Documents/Projetos%20VSCODE/plafon/src/lib/categories.ts).

---

## 5. Regras para Agentes Autônomos

1. **Preservação de Blocos Gerados**: Jamais remova o bloco `<!-- BEGIN:nextjs-agent-rules -->` deste arquivo, pois ele é regravado automaticamente pelo processo `next dev`.
2. **Sem Placeholders ou Código Incompleto**: Toda implementação deve ser funcional, sem deixar `// TODO: add logic here` para fluxos fundamentais solicitados.
3. **Consistência de Idioma e Tom**: A interface com o usuário final é primariamente em Português do Brasil (pt-BR) com suporte a formatação localizada (BRL `R$`).
4. **Respeito ao Estilo Visual Estabelecido**: Sempre verifique componentes existentes antes de criar novos estilos ad-hoc, mantendo o padrão cinza escuro, bordas finas, tipografia alinhada e tema escuro consistente.
5. **Comandos Locais**: O servidor de desenvolvimento é executado via `npm run dev` na porta local padrão `3000`.
