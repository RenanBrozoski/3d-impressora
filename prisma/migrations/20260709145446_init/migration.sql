-- CreateTable
CREATE TABLE "users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "papel" TEXT NOT NULL DEFAULT 'OPERADOR',
    "valorHora" REAL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "customers" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "telefone" TEXT,
    "email" TEXT,
    "cpfCnpj" TEXT,
    "endereco" TEXT,
    "cidade" TEXT,
    "estado" TEXT,
    "observacoes" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "products" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "categoria" TEXT,
    "descricao" TEXT,
    "fotoPath" TEXT,
    "pesoMedioG" REAL,
    "tempoMedioH" REAL,
    "materialRecomendado" TEXT,
    "custoMedio" REAL,
    "precoSugerido" REAL,
    "margemSugeridaPercent" REAL,
    "observacoesImpressao" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ATIVO',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "quotes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "numero" TEXT NOT NULL,
    "customerId" INTEGER NOT NULL,
    "clientRequestId" INTEGER,
    "validade" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'RASCUNHO',
    "valorSugerido" REAL NOT NULL DEFAULT 0,
    "valorFinal" REAL NOT NULL DEFAULT 0,
    "observacoes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "quotes_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "quotes_clientRequestId_fkey" FOREIGN KEY ("clientRequestId") REFERENCES "client_requests" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "quote_items" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "quoteId" INTEGER NOT NULL,
    "productId" INTEGER,
    "nomePeca" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL DEFAULT 1,
    "material" TEXT,
    "cor" TEXT,
    "pesoUnidadeG" REAL,
    "tempoImpressaoH" REAL,
    "custoMaterial" REAL NOT NULL DEFAULT 0,
    "custoEnergia" REAL NOT NULL DEFAULT 0,
    "custoMaquina" REAL NOT NULL DEFAULT 0,
    "custoMaoObra" REAL NOT NULL DEFAULT 0,
    "custoAcabamento" REAL NOT NULL DEFAULT 0,
    "custoEmbalagem" REAL NOT NULL DEFAULT 0,
    "outrosCustos" REAL NOT NULL DEFAULT 0,
    "valorUnitario" REAL NOT NULL DEFAULT 0,
    "valorTotal" REAL NOT NULL DEFAULT 0,
    "lucroEstimado" REAL NOT NULL DEFAULT 0,
    "observacoes" TEXT,
    CONSTRAINT "quote_items_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "quotes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "quote_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "orders" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "numero" TEXT NOT NULL,
    "customerId" INTEGER NOT NULL,
    "quoteId" INTEGER,
    "dataPedido" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "prazoEntrega" DATETIME,
    "dataEntrega" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'APROVADO',
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDENTE',
    "formaPagamento" TEXT,
    "valorTotal" REAL NOT NULL DEFAULT 0,
    "observacoes" TEXT,
    "trackingToken" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "orders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "orders_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "quotes" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderId" INTEGER NOT NULL,
    "productId" INTEGER,
    "nomePeca" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL DEFAULT 1,
    "material" TEXT,
    "cor" TEXT,
    "pesoUnidadeG" REAL,
    "tempoImpressaoH" REAL,
    "custoMaterial" REAL NOT NULL DEFAULT 0,
    "custoEnergia" REAL NOT NULL DEFAULT 0,
    "custoMaquina" REAL NOT NULL DEFAULT 0,
    "custoMaoObra" REAL NOT NULL DEFAULT 0,
    "custoAcabamento" REAL NOT NULL DEFAULT 0,
    "custoEmbalagem" REAL NOT NULL DEFAULT 0,
    "outrosCustos" REAL NOT NULL DEFAULT 0,
    "valorUnitario" REAL NOT NULL DEFAULT 0,
    "valorTotal" REAL NOT NULL DEFAULT 0,
    "lucroEstimado" REAL NOT NULL DEFAULT 0,
    "observacoes" TEXT,
    CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "inventory_items" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "marca" TEXT,
    "material" TEXT,
    "cor" TEXT,
    "unidade" TEXT NOT NULL,
    "quantidadeAtual" REAL NOT NULL DEFAULT 0,
    "quantidadeMinima" REAL NOT NULL DEFAULT 0,
    "precoCompra" REAL,
    "precoPorUnidade" REAL NOT NULL,
    "fornecedor" TEXT,
    "dataCompra" DATETIME,
    "observacoes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "inventory_movements" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "inventoryItemId" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "origem" TEXT NOT NULL,
    "quantidade" REAL NOT NULL,
    "motivo" TEXT,
    "orderItemId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "inventory_movements_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "inventory_items" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "inventory_movements_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "order_items" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "printers" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "modelo" TEXT,
    "tipo" TEXT NOT NULL DEFAULT 'FDM',
    "potenciaW" REAL NOT NULL,
    "areaImpressao" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ATIVA',
    "custoEstimadoHora" REAL NOT NULL DEFAULT 0,
    "observacoes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "production_queue" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderItemId" INTEGER NOT NULL,
    "printerId" INTEGER,
    "assignedUserId" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'NA_FILA',
    "prioridade" INTEGER NOT NULL DEFAULT 0,
    "dataPrevistaInicio" DATETIME,
    "dataPrevistaFim" DATETIME,
    "dataInicioReal" DATETIME,
    "dataFimReal" DATETIME,
    "motivoFalha" TEXT,
    "custoPerdido" REAL,
    "isReimpressao" BOOLEAN NOT NULL DEFAULT false,
    "observacoes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "production_queue_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "order_items" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "production_queue_printerId_fkey" FOREIGN KEY ("printerId") REFERENCES "printers" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "production_queue_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "payments" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderId" INTEGER NOT NULL,
    "valor" REAL NOT NULL,
    "data" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "formaPagamento" TEXT,
    "observacoes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "payments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "expenses" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "categoria" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "valor" REAL NOT NULL,
    "data" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fornecedor" TEXT,
    "observacoes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "settings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "nomeLoja" TEXT NOT NULL DEFAULT 'Minha Impressão 3D',
    "logoPath" TEXT,
    "contatoTelefone" TEXT,
    "contatoEmail" TEXT,
    "enderecoOrcamento" TEXT,
    "valorPadraoKwh" REAL NOT NULL DEFAULT 0.95,
    "potenciaPadraoW" REAL NOT NULL DEFAULT 200,
    "valorHoraPadraoMaoDeObra" REAL NOT NULL DEFAULT 20,
    "margemLucroPadraoPercent" REAL NOT NULL DEFAULT 30,
    "taxaMinimaPedido" REAL NOT NULL DEFAULT 0,
    "percentualDesperdicioPadrao" REAL NOT NULL DEFAULT 5
);

-- CreateTable
CREATE TABLE "attachments" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nomeArquivo" TEXT NOT NULL,
    "caminho" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "tamanhoBytes" INTEGER NOT NULL,
    "productId" INTEGER,
    "orderItemId" INTEGER,
    "quoteItemId" INTEGER,
    "clientRequestId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "attachments_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "attachments_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "order_items" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "attachments_quoteItemId_fkey" FOREIGN KEY ("quoteItemId") REFERENCES "quote_items" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "attachments_clientRequestId_fkey" FOREIGN KEY ("clientRequestId") REFERENCES "client_requests" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER,
    "entidade" TEXT NOT NULL,
    "entidadeId" INTEGER NOT NULL,
    "acao" TEXT NOT NULL,
    "dadosAntes" TEXT,
    "dadosDepois" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "client_requests" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "telefone" TEXT,
    "email" TEXT,
    "descricao" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NOVO',
    "customerId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "client_requests_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "quotes_numero_key" ON "quotes"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "quotes_clientRequestId_key" ON "quotes"("clientRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "orders_numero_key" ON "orders"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "orders_quoteId_key" ON "orders"("quoteId");

-- CreateIndex
CREATE UNIQUE INDEX "orders_trackingToken_key" ON "orders"("trackingToken");
