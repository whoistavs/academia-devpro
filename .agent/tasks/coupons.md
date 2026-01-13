---
title: Cupons de Desconto
status: todo
---

# Objetivo
Criar um sistema de cupons promocionais para impulsionar vendas em campanhas de marketing.

# Requisitos Funcionais

1.  **Backend (Coupon Model):**
    *   Criar modelo `Coupon` com:
        *   `code` (String, único, ex: "DEVPRO10")
        *   `discountPercentage` (Number, ex: 10)
        *   `validUntil` (Date)
        *   `maxUses` (Number, opcional)
        *   `usedCount` (Number)
    *   Endpoint `POST /api/admin/coupons` (Criar cupom).
    *   Endpoint `POST /api/checkout/validate-coupon` (Verificar validade e retornar desconto).

2.  **Frontend (Checkout):**
    *   Adicionar campo "Possui um cupom?" na tela de pagamento.
    *   Validar código e atualizar o valor total em tempo real antes de enviar para o gateway de pagamento (Mercado Pago).

3.  **Gestão (Admin Dashboard):**
    *   Tela simples para Admin criar e excluir cupons.

# Benefícios
*   Ferramenta essencial para campanhas de e-mail e redes sociais.
*   Acelera a decisão de compra do cliente.
