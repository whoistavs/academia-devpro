---
title: Sistema de Gamificação (XP e Ranking)
status: todo
---

# Objetivo
Implementar um sistema de gamificação para aumentar o engajamento dos alunos, recompensando ações com XP (pontos de experiência) e exibindo um ranking global.

# Requisitos Funcionais

1.  **Sistema de XP (Backend):**
    *   Adicionar campo `xp` e `level` ao modelo de `User`.
    *   Criar lógica para adicionar XP quando:
        *   Aluno conclui uma aula (+10 XP).
        *   Aluno acerta um Quiz (+50 XP).
        *   Aluno completa um curso (+500 XP).
    *   Definir fórmula de níveis (ex: Nível 1 = 0-100 XP, Nível 2 = 101-300 XP).

2.  **Interface do Aluno (Frontend):**
    *   **Barra de Progresso/Nível:** Exibir no topo da Dashboard ou na Sidebar o nível atual do aluno e quanto falta para o próximo.
    *   **Notificações Visuais:** "Toast" ou animação quando ganhar XP.

3.  **Ranking (Leaderboard):**
    *   Criar componente de Ranking na Dashboard.
    *   Mostrar os Top 10 alunos com mais XP na semana/mês ou geral.
    *   Backend endpoint: `/api/leaderboard`.

# Benefícios
*   Aumenta a retenção de alunos.
*   Estimula a competição saudável.
*   Torna a plataforma mais divertida.
