---
title: Avaliações e Comentários de Cursos
status: todo
---

# Objetivo
Permitir que os alunos avaliem os cursos que estão cursando, gerando prova social e feedback valioso para os professores.

# Requisitos Funcionais

1.  **Backend (Review Model):**
    *   Criar modelo `Review` com:
        *   `courseId` (Ref Curso)
        *   `userId` (Ref Aluno)
        *   `rating` (Number 1-5)
        *   `comment` (String)
        *   `createdAt`
    *   Endpoint `POST /api/courses/:id/reviews` (Apenas alunos matriculados).
    *   Endpoint `GET /api/courses/:id/reviews`.

2.  **Frontend:**
    *   **Componente de Estrelas:** Visualização da média de notas nos Cards de Curso (ex: ⭐ 4.8).
    *   **Formulário de Avaliação:** Na página do curso (ou ao finalizar), permitir enviar nota e texto.
    *   **Lista de Depoimentos:** Exibir comentários públicos na página de detalhes do curso.

3.  **Regras de Negócio:**
    *   Apenas alunos que compraram o curso podem avaliar.
    *   Cada aluno só pode avaliar uma vez por curso (pode editar).

# Benefícios
*   Aumenta a confiança de novos compradores (Prova Social).
*   Feedback direto para melhoria do conteúdo.
