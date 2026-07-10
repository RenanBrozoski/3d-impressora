# Planejamento e Arquitetura — Sistema de Gestão de Impressão 3D

> Fase 1 do projeto. Documento de referência para as fases seguintes (banco de dados, autenticação, módulos). Stack e local do projeto confirmados com o usuário em 2026-07-09.

## 1. Visão geral do sistema

Um mini ERP/CRM para operação solo (uma pessoa) de impressão 3D sob encomenda. O sistema cobre o ciclo completo do negócio:

`Cliente pede peça → Orçamento → Aprovação → Pedido → Fila de produção → Impressão/Acabamento → Entrega → Pagamento`

com estoque de insumos, custos e lucro calculados automaticamente em cada etapa, e um dashboard que dá visão geral do negócio (faturamento, produção, atrasos, estoque).

Diferente de um ERP genérico, o sistema é desenhado em torno da unidade "peça impressa": cada item de pedido carrega peso, material, tempo de impressão e custos próprios — é isso que alimenta a calculadora de preço, a baixa de estoque e os relatórios de lucratividade por produto/material/impressora.

## 2. Lista final de módulos

1. **Autenticação** (login, sessão, permissões básicas)
2. **Dashboard** (indicadores e gráficos)
3. **Clientes** (CRM básico)
4. **Produtos / Catálogo** (peças reutilizáveis)
5. **Orçamentos** (pré-venda)
6. **Pedidos / Encomendas** (módulo central)
7. **Calculadora de custo/preço** (embutida em orçamentos e itens de pedido, não é uma tela isolada)
8. **Estoque** (filamentos, resinas, embalagens, insumos)
9. **Produção / Fila de impressão**
10. **Impressoras**
11. **Financeiro** (receitas, despesas, pagamentos)
12. **Relatórios**
13. **Configurações**
14. **Anexos** (STL/OBJ/3MF, fotos) — transversal, usado por produtos e itens de pedido
15. **Histórico/Auditoria** — transversal, usado por pedidos e orçamentos

## 3. Fluxo principal de uso

1. Cliente entra em contato → usuário cadastra o **Cliente** (se novo) e cria um **Orçamento**.
2. No orçamento, adiciona itens usando a **Calculadora de custo/preço**: peso, material, tempo de impressão, mão de obra, acabamento, margem → sistema sugere preço.
3. Orçamento é enviado ao cliente (PDF/tela imprimível) → status `enviado`.
4. Cliente aprova → orçamento passa a `aprovado` → botão **"Converter em pedido"** gera o **Pedido** copiando cliente, itens e preços.
5. Pedido nasce com status `Aprovado` e pagamento `Pendente`. Cada item do pedido gera automaticamente uma entrada na **Fila de produção**.
6. Usuário organiza a fila por prioridade/impressora, inicia a impressão → status do item avança (`Na fila` → `Imprimindo` → `Em acabamento` → `Finalizado`).
7. Ao concluir um item, o sistema dá **baixa automática no estoque** (material consumido) e atualiza o status do pedido.
8. Se a impressão falhar: usuário registra a falha, o custo do material perdido é lançado, e pode gerar uma reimpressão (novo ciclo de produção para o mesmo item).
9. Pedido pronto → **Registrar entrega** → status `Entregue`.
10. Pagamento é registrado (total ou parcial) em **Financeiro/Pagamentos** → status de pagamento atualizado (`Pendente`/`Parcial`/`Pago`).
11. Dashboard e Relatórios agregam tudo isso em tempo real (faturamento, lucro, atrasos, estoque baixo).

## 3.1. Ajustes confirmados com o usuário (pós Fase 1)

- **Operação com 2 pessoas**: `users` ganha `valor_hora` próprio (mão de obra usa o valor de quem está atribuído ao item, não um valor global fixo) e `papel` (`admin`/`operador`). `production_queue` ganha `assigned_user_id`.
- **Calculadora usa custo real de estoque**: ao escolher o material de um item, o preço/kg vem de `inventory_items` (permitindo override manual pontual) em vez de digitação livre a cada item — evita orçamento desatualizado quando o preço do filamento muda.
- **Custo de máquina entra na fórmula**: `printers.custo_estimado_hora` (depreciação/manutenção) passa a compor o custo total do item, não só um dado cadastral solto.
- **Portal público do cliente**: nova tabela `client_requests` — formulário sem login onde o cliente informa contato e **sobe o próprio arquivo 3D** (STL/OBJ/3MF) para pedir orçamento. Vira uma "caixa de entrada" que o usuário aprova e converte em `quote`.
- **Link de acompanhamento**: `orders.tracking_token` (UUID) permite uma página pública somente-leitura de status do pedido para o cliente, sem exigir login.

## 4. Modelo de banco de dados

Descrição conceitual (o schema Prisma completo, com tipos exatos, será escrito na Fase 2). Banco inicial: **SQLite** (arquivo local, zero configuração); Prisma permite migrar para PostgreSQL depois sem reescrever a lógica.

| Tabela | Propósito | Principais campos | Relacionamentos |
|---|---|---|---|
| `users` | Login e permissões de quem opera o sistema (2 pessoas) | nome, e-mail, senha (hash), papel (admin/operador), **valor_hora** (mão de obra própria) | 1:N `audit_logs`, 1:N `production_queue` (atribuído) |
| `customers` | Cadastro de clientes | nome, telefone/whatsapp, e-mail, cpf_cnpj, endereço, cidade, uf, observações | 1:N `orders`, 1:N `quotes` |
| `products` | Catálogo de peças reutilizáveis (não é obrigatório usar em todo pedido) | nome, categoria, descrição, peso médio, tempo médio, material recomendado, custo médio, preço sugerido, status | 1:N `order_items`, 1:N `quote_items`, 1:N `attachments` |
| `quotes` | Orçamento antes de virar pedido | número, cliente_id, validade, status, valor sugerido, valor final | 1:N `quote_items`, 1:1 `orders` (quando convertido) |
| `quote_items` | Itens do orçamento (mesma estrutura de custo que item de pedido) | produto_id (opcional), nome da peça, quantidade, material, cor, peso, tempo, custos, valor unitário, valor total | N:1 `quotes`, N:1 `products` |
| `orders` | Pedido/encomenda — módulo central | número automático, cliente_id, data do pedido, prazo, status do pedido, status do pagamento, forma de pagamento, valor total/pago/pendente, observações, quote_id (origem), **tracking_token (UUID p/ link público de acompanhamento)** | 1:N `order_items`, 1:N `payments`, N:1 `customers` |
| `order_items` | Itens do pedido, com todos os custos e o resultado (lucro) | produto_id (opcional), nome da peça, quantidade, material, cor, peso/un, tempo/un, custo material/energia/mão de obra/acabamento/outros, valor unitário, valor total, lucro estimado, observações | N:1 `orders`, N:1 `products`, 1:N `attachments`, 1:N `production_queue` |
| `inventory_items` | Insumos em estoque (filamento, resina, embalagem, etc.) | nome, tipo, marca, material, cor, unidade, quantidade atual, quantidade mínima, preço de compra, preço/kg, fornecedor | 1:N `inventory_movements` |
| `inventory_movements` | Histórico de entradas/saídas de estoque | item_id, tipo (entrada/saída/ajuste), quantidade, motivo, origem (compra/pedido/manual), order_item_id (opcional), data | N:1 `inventory_items`, N:1 `order_items` (quando é baixa automática) |
| `printers` | Impressoras cadastradas | nome, modelo, tipo (FDM/SLA/resina), potência (W), área de impressão, status, **custo_estimado_hora (agora usado na fórmula de custo, ver seção 6)** | 1:N `production_queue` |
| `production_queue` | Fila de produção — 1 linha por item em produção | order_item_id, printer_id, **assigned_user_id**, status, prioridade, data prevista de início/fim, motivo de falha, é_reimpressão | N:1 `order_items`, N:1 `printers`, N:1 `users` |
| `client_requests` | **Solicitação pública** feita pelo próprio cliente (sem login), com upload do arquivo 3D | nome/contato informado, descrição do que precisa, status (novo/em análise/convertido/descartado), customer_id (vinculado se já é cliente cadastrado, ou criado a partir daqui) | 1:N `attachments`, 1:1 `quotes` (quando convertido) |
| `payments` | Pagamentos recebidos de um pedido (permite parcelado) | order_id, valor, data, forma de pagamento, observações | N:1 `orders` |
| `expenses` | Despesas gerais do negócio (não ligadas a um pedido específico: manutenção, compra de insumo, energia fixa etc.) | categoria, descrição, valor, data, fornecedor | — |
| `settings` | Configurações globais (chave/valor) do negócio | nome da loja, logo, contato, valor padrão kWh, potência padrão, valor/hora padrão, margem padrão, taxa mínima, % desperdício padrão | — |
| `attachments` | Arquivos anexados (STL/OBJ/3MF, fotos) | nome do arquivo, caminho, tipo, tamanho, entidade relacionada (product_id / order_item_id / quote_item_id / **client_request_id**) | N:1 `products`/`order_items`/`quote_items`/`client_requests` (polimórfico simples) |
| `audit_logs` | Histórico de alterações (quem mudou o quê e quando) | user_id, entidade, entidade_id, ação, dados antes/depois, data | N:1 `users` |

**Por que separar `quotes`/`quote_items` de `orders`/`order_items`** em vez de usar só um status "orçamento" dentro de pedido: orçamento tem regras próprias (validade, pode ser recusado/expirar sem nunca virar pedido, não deve contar em faturamento nem gerar baixa de estoque/produção). Manter tabelas separadas evita `if` espalhado por todo o sistema para "isso é orçamento ou pedido de verdade".

**Por que `inventory_movements` é uma tabela própria** e não só um campo em `inventory_items`: sem histórico de movimentação não é possível gerar "relatório de consumo por período" nem auditar uma baixa automática incorreta — é a tabela que sustenta os relatórios de estoque.

**Por que `production_queue` é separada de `order_items`**: um item pode falhar e ser reimpresso (2ª linha na fila para o mesmo item), e pode usar impressoras diferentes em tentativas diferentes. Modelar como tabela própria permite histórico de falhas por impressora sem sujar o item do pedido.

## 5. Regras de negócio

- **Numeração automática**: `orders.numero` e `quotes.numero` são sequenciais (ex. `PED-0001`, `ORC-0001`), gerados no banco, nunca reaproveitados mesmo se o pedido for cancelado.
- **Máquina de estados do pedido**: `Orçamento → Aguardando aprovação → Aprovado → Na fila → Em impressão → Em acabamento → Pronto para entrega → Entregue`, com `Cancelado` acessível a partir de qualquer estado anterior a `Entregue`. Transições fora dessa ordem exigem confirmação explícita (ex. voltar status).
- **Pagamento é independente do status de produção**: um pedido pode estar `Entregue` e pagamento `Pendente` (ou vice-versa) — são duas máquinas de estado separadas.
- **Valor pendente é sempre calculado**, nunca digitado: `valor_pendente = valor_total - soma(payments.valor)`.
- **Conversão de orçamento em pedido** copia os itens (com os custos e preços já calculados) para `order_items`; o orçamento original fica marcado como `convertido` e vinculado ao pedido gerado. Orçamento convertido não pode ser reaberto para edição.
- **Orçamento expira automaticamente** (job/checagem na leitura) quando a data atual passa da validade e o status ainda é `enviado` — passa para `expirado`.
- **Baixa de estoque é automática** quando um item de pedido é marcado `Finalizado` na fila de produção: o sistema deduz `peso_unidade * quantidade` (+ % de desperdício configurado) do insumo de material correspondente e cria um `inventory_movements` de saída referenciando o item.
- **Falha de impressão não devolve estoque**: material gasto em uma tentativa falha é considerado perda (fica registrado como custo perdido no item/queue), e uma reimpressão gera **novo consumo de estoque**, não reaproveita a baixa anterior.
- **Alerta de estoque baixo**: quando `quantidade_atual <= quantidade_minima` de um insumo, aparece no dashboard e pode bloquear (com aviso, não bloqueio duro) o início de produção de um item que dependa daquele material.
- **Cliente com pedidos vinculados não pode ser excluído** (soft delete/inativação, não exclusão física) — preserva histórico e relatórios.
- **Produto usado em pedidos não pode ser excluído fisicamente**, apenas marcado `inativo` (mesma razão).
- **Toda alteração relevante em pedido/orçamento gera `audit_log`** (mudança de status, edição de valores, cancelamento).
- **Configurações (`settings`) são os valores padrão** usados pela calculadora quando o item não sobrescreve (ex. valor do kWh, valor/hora, margem padrão, % de desperdício) — sempre editáveis por item.

## 6. Fórmulas de cálculo

Valores de entrada por item (a maioria vem preenchida automaticamente e pode ser sobrescrita manualmente):

- `peso_g`, `preco_kg_material` (**puxado de `inventory_items` pelo material/cor selecionado**, override manual permitido), `percentual_desperdicio`
- `tempo_impressao_h`, `potencia_impressora_kw` (do cadastro da impressora escolhida), `valor_kwh`
- `custo_hora_maquina` (**novo — de `printers.custo_estimado_hora`**, cobre depreciação/manutenção)
- `tempo_mao_obra_h`, `valor_hora_mao_obra` (**puxado de `users.valor_hora` do operador atribuído**, override manual permitido)
- `custo_acabamento`, `custo_embalagem`, `outros_custos`
- `taxa_fixa_minima`, `margem_lucro_percentual` (margem **sobre o preço de venda**, não sobre o custo), `desconto`

Fórmulas:

```
custo_material   = (peso_g / 1000) * preco_kg_material * (1 + percentual_desperdicio / 100)
custo_energia    = potencia_impressora_kw * tempo_impressao_h * valor_kwh
custo_maquina    = custo_hora_maquina * tempo_impressao_h            # depreciação/manutenção da impressora
custo_mao_obra   = tempo_mao_obra_h * valor_hora_mao_obra            # valor/hora de quem está atribuído ao item

custo_total       = custo_material + custo_energia + custo_maquina + custo_mao_obra
                  + custo_acabamento + custo_embalagem + outros_custos

custo_total_final = max(custo_total, taxa_fixa_minima)   # taxa mínima garante piso de cobrança

preco_venda_sugerido = custo_total_final / (1 - margem_lucro_percentual / 100)
preco_final           = preco_venda_sugerido - desconto

lucro           = preco_final - custo_total_final
margem_real_pct = (lucro / preco_final) * 100
```

> Nota de negócio importante: a margem é definida **sobre o preço de venda** (ex. "quero 30% de margem" = 30% do preço final é lucro), não sobre o custo — é a mesma convenção usada na fórmula de margem percentual que você descreveu (`lucro / preço de venda * 100`). Por isso a divisão `custo / (1 - margem)` em vez de multiplicação `custo * (1 + margem)`. Vou deixar isso configurável/claro na tela da calculadora para não gerar confusão na hora de digitar a margem desejada.

Esses campos e resultados ficam salvos no próprio `order_item`/`quote_item` (não em uma tabela de "cálculos" separada) — é o que a seção "Permitir salvar os cálculos dentro de um pedido" pede.

## 7. Arquitetura recomendada

**Decisão confirmada com o usuário:** Next.js full-stack (frontend + API no mesmo projeto, sem backend separado em NestJS/Express) — reduz de dois códigos para manter para um só, o que importa numa operação solo.

- **Framework**: Next.js 14+ (App Router), TypeScript.
- **UI**: Tailwind CSS + shadcn/ui (componentes copiados para o projeto, não uma dependência externa de runtime) + Recharts para os gráficos do dashboard.
- **Formulários/validação**: Server Actions nativas do Next.js (`useActionState` + `<form action={...}>`) com Zod validando no servidor — dispensa uma lib de formulário no client para os formulários simples (cliente, produto, login). Para listas dinâmicas de itens (orçamento/pedido) as actions são chamadas diretamente com um objeto tipado, sem depender de `FormData`.
- **Banco/ORM**: SQLite (arquivo `dev.db` na raiz do projeto) + Prisma 7. Migração futura para PostgreSQL é só trocar o `provider` do datasource — o resto do código não muda. Prisma 7 exige um *driver adapter* explícito (`@prisma/adapter-better-sqlite3` para SQLite).
- **Autenticação**: solução própria e leve, no padrão recomendado pela própria documentação do Next.js para App Router — `bcryptjs` para hash de senha, `jose` para sessão assinada (JWT) em cookie `httpOnly`, e um DAL (`src/lib/dal.ts`) centralizando a verificação de sessão. Mais simples de manter que uma lib de auth completa para 2 usuários fixos.
- **Uploads (STL/OBJ/3MF/fotos)**: salvos em disco local (`/storage/uploads`), servidos por uma rota própria — sem dependência de serviço externo agora; trocar por S3/Blob depois é só trocar a camada de storage.
- **PDF (orçamento/recibo)**: `@react-pdf/renderer` (gera PDF no server, sem depender de serviço externo).
- **Execução local**: `npm run dev` para desenvolvimento; `npm run build && npm run start` para "produção local" — pode inclusive ser empacotado num `.bat` (`start.bat`) que roda `npm run start`, no mesmo espírito do launcher do Inventário.
- **Hospedagem futura**: o mesmo projeto sobe em Vercel, VPS com Docker, ou qualquer host Node — só troca variável de ambiente do banco (SQLite → Postgres) quando for multiusuário/online.

## 8. Estrutura de pastas

```
Impressao3D/
├── docs/                        # planejamento, decisões de arquitetura
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── storage/
│   └── uploads/                 # STL/OBJ/3MF, fotos (fora do /public, servido por rota)
├── public/                      # assets estáticos (logo, ícones)
├── src/
│   ├── app/
│   │   ├── (auth)/login/
│   │   ├── (app)/                       # área logada, com layout de menu lateral
│   │   │   ├── dashboard/
│   │   │   ├── clientes/
│   │   │   ├── produtos/
│   │   │   ├── orcamentos/
│   │   │   ├── pedidos/
│   │   │   ├── estoque/
│   │   │   ├── producao/
│   │   │   ├── impressoras/
│   │   │   ├── financeiro/
│   │   │   ├── relatorios/
│   │   │   └── configuracoes/
│   │   └── api/                         # rotas de API (uploads, pdf, webhooks futuros)
│   ├── components/
│   │   ├── ui/                          # shadcn (botão, modal, tabela, etc.)
│   │   └── shared/                      # componentes de negócio reaproveitados
│   ├── lib/
│   │   ├── db.ts                        # cliente Prisma
│   │   ├── auth.ts                      # config NextAuth
│   │   ├── calculadora.ts               # fórmulas de custo/preço (fonte única)
│   │   └── validations/                 # schemas Zod
│   ├── server/
│   │   └── actions/                     # server actions por módulo (clientes.ts, pedidos.ts, ...)
│   └── types/
├── .env                          # DATABASE_URL, AUTH_SECRET
├── package.json
└── start.bat                     # launcher local (npm run build && npm run start)
```

## 9. Plano de desenvolvimento por etapas

| Fase | Entrega | Escopo MVP |
|---|---|---|
| 1 | Planejamento e arquitetura | ✅ este documento |
| 2 | Banco de dados e models | Schema Prisma completo (todas as tabelas da seção 4), migrations, seed inicial (usuário admin, settings padrão) |
| 3 | Autenticação e layout base | Login, proteção de rotas, layout com menu lateral, modo claro/escuro, shell responsivo |
| 4 | Clientes e produtos | CRUD completo dos dois módulos, busca/filtros |
| 5 | Pedidos e orçamentos | Módulo central: itens, status, conversão orçamento→pedido, geração de PDF simples |
| 6 | Calculadora de custos e lucro | `lib/calculadora.ts` com as fórmulas da seção 6, integrada ao formulário de item |
| 7 | Estoque | CRUD de insumos, movimentações, baixa automática ao finalizar item, alerta de estoque baixo |
| 8 | Produção e impressoras | Fila de produção, cadastro de impressoras, fluxo de falha/reimpressão |
| 9 | Financeiro e relatórios | Pagamentos, despesas, dashboard com gráficos, relatórios listados na seção de relatórios do pedido original |
| 10 | Melhorias finais | Validações finas, exportação CSV/Excel, ajustes visuais, botão WhatsApp, busca global |

MVP funcional = fases 1–7 (cliente pede, orçamento, pedido, cálculo de preço, produção básica, estoque). Fases 8–10 tornam o sistema completo conforme pedido original, sem exigir retrabalho do que já foi construído — o schema da fase 2 já contempla todas as tabelas para não gerar migração destrutiva depois.

## 10. Ideias adicionais recomendadas (implementadas ou reservadas para depois)

- **Visualizador 3D no navegador** (three.js, self-hosted, sem CDN): pré-visualizar o STL/OBJ enviado pelo cliente ou pelo produto direto na tela, sem precisar abrir outro programa. Alto valor para conferir o arquivo antes de orçar. Planejado para a fase de Produtos/Pedidos.
- **Validação de upload**: extensões permitidas (`.stl`, `.obj`, `.3mf`, `.gcode`, imagens comuns), limite de tamanho, nome de arquivo sanitizado, armazenamento fora da pasta pública servido por rota autenticada/por token.
- **Backup do banco com 1 clique**: como o banco é um arquivo SQLite único, um botão em Configurações copia o arquivo com timestamp para uma pasta de backup local.
- **Dois papéis de acesso** (`admin`/`operador`): operador opera clientes, pedidos, produção e estoque; admin também acessa financeiro e configurações. Ajustável depois se a divisão não fizer sentido na prática.
- **Notificação simples de atraso/estoque baixo** na própria tela (sem e-mail/SMS por enquanto, para não depender de serviço externo) — evolutivo para e-mail/WhatsApp Business API se um dia fizer sentido.
