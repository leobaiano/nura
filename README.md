# Nura - Gestão de Medicamentos 💊

> Um aplicativo web moderno, privado e *offline-first* focado em auxiliar no controlo de medicamentos, gestão de estoque e alertas para cuidadores e pacientes.

[![Deploy Next.js PWA to GitHub Pages](https://github.com/leobaiano/nura/actions/workflows/deploy.yml/badge.svg)](https://github.com/leobaiano/nura/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-teal.svg)](https://opensource.org/licenses/MIT)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-0D9488.svg)](https://web.dev/progressive-web-apps/)

---

## 🚀 Sobre o Projeto

O **Nura** nasceu com o objetivo de descomplicar a rotina de administração de medicamentos. Desenvolvido com tecnologias web modernas, ele funciona de forma totalmente descentralizada e privada (com dados salvos localmente via IndexedDB), permitindo que cuidadores e familiares gerenciem horários, estoques e recebam notificações em segundo plano sem depender de servidores centralizados de rastreamento.

---

## ✨ Principais Funcionalidades

* 📱 **Progressive Web App (PWA):** Instalável tanto em dispositivos móveis (Android/iOS) quanto em desktops, funcionando como um aplicativo nativo.
* 🔔 **Sistema de Alertas Inteligentes:** Notificações locais agendadas para os horários de toma, com suporte a *Quick Actions* (ações rápidas direto na notificação para confirmar a dose ou adiar o alarme).
* 📦 **Controle de Estoque:** Monitoramento automático da quantidade de comprimidos/frascos, com abatimento automático ao confirmar as tomas.
* 🔒 **Privacidade em Primeiro Lugar (*Offline-First*):** Todos os dados pertencem exclusivamente ao usuário e ficam armazenados de forma segura no próprio dispositivo utilizando IndexedDB.
* 👥 **Gestão de Perfis:** Acompanhamento personalizado para diferentes pacientes ou familiares.

---

## 🛠️ Tecnologias Utilizadas

Este projeto foi construído utilizando uma stack moderna focada em performance e DX (Developer Experience):

* **[Next.js](https://nextjs.org/)** (App Router & Exportação Estática)
* **[TypeScript](https://www.typescriptlang.org/)**
* **[Tailwind CSS](https://tailwindcss.com/)** para estilização
* **[IndexedDB](https://developer.mozilla.org/pt-BR/docs/Web/API/IndexedDB_API)** para persistência local
* **Service Workers & Web Push API** para recursos PWA e notificações em background

---

## 📦 Como Rodar o Projeto Localmente

Siga os passos abaixo para configurar o ambiente de desenvolvimento na sua máquina:

1. **Clone o repositório:** `git clone [https://github.com/leobaiano/nura.git](https://github.com/leobaiano/nura.git) && cd nura`
2. **Instale as dependências:** `npm install`
3. **Inicie o servidor de desenvolvimento:** `npm run dev`
4. **Acesse: http://localhost:3000

## 🤝 Como Contribuir
Adoramos contribuições da comunidade! Se você deseja ajudar a tornar o Nura ainda melhor, siga os passos abaixo para enviar a sua contribuição:

1. Faça um fork do repositório
2. Crie sua branch com base na *main*: `git checkout -b feature/minha-nova-feature`
3. Commit suas alterações: `git commit -m "feat: adiciona nova funcionalidade X"`
4. Envie suas branch para o repositório remoto: `git push origin feature/minha-nova-feature`
5. Abra um Pull Request explicando detalhadamente o seu propósito e mudanças.

Por favor, certifique-se de que o seu código segue os padrões de linting e passa nos testes de build (npm run build) antes de submeter o PR.

