-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'OPERADOR');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('ATIVO', 'INATIVO');

-- CreateEnum
CREATE TYPE "QuoteStatus" AS ENUM ('RASCUNHO', 'ENVIADO', 'APROVADO', 'RECUSADO', 'EXPIRADO', 'CONVERTIDO');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('AGUARDANDO_APROVACAO', 'APROVADO', 'NA_FILA', 'EM_IMPRESSAO', 'EM_ACABAMENTO', 'PRONTO_PARA_ENTREGA', 'ENTREGUE', 'CANCELADO');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDENTE', 'PARCIAL', 'PAGO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "InventoryItemType" AS ENUM ('FILAMENTO', 'RESINA', 'EMBALAGEM', 'PECA', 'FERRAMENTA', 'OUTRO');

-- CreateEnum
CREATE TYPE "UnidadeMedida" AS ENUM ('KG', 'G', 'UNIDADE', 'LITRO', 'ML');

-- CreateEnum
CREATE TYPE "MovementType" AS ENUM ('ENTRADA', 'SAIDA', 'AJUSTE');

-- CreateEnum
CREATE TYPE "MovementOrigin" AS ENUM ('COMPRA', 'PEDIDO', 'MANUAL', 'AJUSTE');

-- CreateEnum
CREATE TYPE "PrinterType" AS ENUM ('FDM', 'SLA', 'RESINA', 'OUTRO');

-- CreateEnum
CREATE TYPE "PrinterStatus" AS ENUM ('ATIVA', 'MANUTENCAO', 'PARADA');

-- CreateEnum
CREATE TYPE "ProductionStatus" AS ENUM ('NA_FILA', 'PREPARANDO_ARQUIVO', 'IMPRIMINDO', 'PAUSADO', 'FALHOU', 'REIMPRIMIR', 'EM_ACABAMENTO', 'FINALIZADO');

-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('MANUTENCAO', 'MATERIAL', 'EMBALAGEM', 'ENERGIA', 'MARKETING', 'OUTRO');

-- CreateEnum
CREATE TYPE "ClientRequestStatus" AS ENUM ('NOVO', 'EM_ANALISE', 'CONVERTIDO', 'DESCARTADO');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "papel" "Role" NOT NULL DEFAULT 'OPERADOR',
    "valorHora" DOUBLE PRECISION,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT,
    "email" TEXT,
    "cpfCnpj" TEXT,
    "endereco" TEXT,
    "cidade" TEXT,
    "estado" TEXT,
    "observacoes" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "categoria" TEXT,
    "descricao" TEXT,
    "fotoPath" TEXT,
    "pesoMedioG" DOUBLE PRECISION,
    "tempoMedioH" DOUBLE PRECISION,
    "materialRecomendado" TEXT,
    "custoMedio" DOUBLE PRECISION,
    "precoSugerido" DOUBLE PRECISION,
    "margemSugeridaPercent" DOUBLE PRECISION,
    "observacoesImpressao" TEXT,
    "status" "ProductStatus" NOT NULL DEFAULT 'ATIVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotes" (
    "id" SERIAL NOT NULL,
    "numero" TEXT NOT NULL,
    "customerId" INTEGER NOT NULL,
    "clientRequestId" INTEGER,
    "validade" TIMESTAMP(3),
    "status" "QuoteStatus" NOT NULL DEFAULT 'RASCUNHO',
    "valorSugerido" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "valorFinal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quote_items" (
    "id" SERIAL NOT NULL,
    "quoteId" INTEGER NOT NULL,
    "productId" INTEGER,
    "inventoryItemId" INTEGER,
    "nomePeca" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL DEFAULT 1,
    "material" TEXT,
    "cor" TEXT,
    "pesoUnidadeG" DOUBLE PRECISION,
    "tempoImpressaoH" DOUBLE PRECISION,
    "precoKgMaterial" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "percentualDesperdicio" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "potenciaImpressoraW" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "valorKwh" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "custoHoraMaquina" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tempoMaoObraH" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "valorHoraMaoObra" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxaMinima" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "margemLucroPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "desconto" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "custoMaterial" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "custoEnergia" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "custoMaquina" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "custoMaoObra" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "custoAcabamento" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "custoEmbalagem" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "outrosCustos" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "valorUnitario" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "valorTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lucroEstimado" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "observacoes" TEXT,

    CONSTRAINT "quote_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" SERIAL NOT NULL,
    "numero" TEXT NOT NULL,
    "customerId" INTEGER NOT NULL,
    "quoteId" INTEGER,
    "dataPedido" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "prazoEntrega" TIMESTAMP(3),
    "dataEntrega" TIMESTAMP(3),
    "status" "OrderStatus" NOT NULL DEFAULT 'APROVADO',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDENTE',
    "formaPagamento" TEXT,
    "valorTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "observacoes" TEXT,
    "trackingToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "productId" INTEGER,
    "inventoryItemId" INTEGER,
    "nomePeca" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL DEFAULT 1,
    "material" TEXT,
    "cor" TEXT,
    "pesoUnidadeG" DOUBLE PRECISION,
    "tempoImpressaoH" DOUBLE PRECISION,
    "precoKgMaterial" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "percentualDesperdicio" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "potenciaImpressoraW" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "valorKwh" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "custoHoraMaquina" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tempoMaoObraH" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "valorHoraMaoObra" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxaMinima" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "margemLucroPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "desconto" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "custoMaterial" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "custoEnergia" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "custoMaquina" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "custoMaoObra" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "custoAcabamento" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "custoEmbalagem" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "outrosCustos" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "valorUnitario" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "valorTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lucroEstimado" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "observacoes" TEXT,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_items" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" "InventoryItemType" NOT NULL,
    "marca" TEXT,
    "material" TEXT,
    "cor" TEXT,
    "unidade" "UnidadeMedida" NOT NULL,
    "quantidadeAtual" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "quantidadeMinima" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "precoCompra" DOUBLE PRECISION,
    "precoPorUnidade" DOUBLE PRECISION NOT NULL,
    "fornecedor" TEXT,
    "dataCompra" TIMESTAMP(3),
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_movements" (
    "id" SERIAL NOT NULL,
    "inventoryItemId" INTEGER NOT NULL,
    "tipo" "MovementType" NOT NULL,
    "origem" "MovementOrigin" NOT NULL,
    "quantidade" DOUBLE PRECISION NOT NULL,
    "motivo" TEXT,
    "orderItemId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "printers" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "modelo" TEXT,
    "tipo" "PrinterType" NOT NULL DEFAULT 'FDM',
    "potenciaW" DOUBLE PRECISION NOT NULL,
    "areaImpressao" TEXT,
    "status" "PrinterStatus" NOT NULL DEFAULT 'ATIVA',
    "custoEstimadoHora" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "printers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "production_queue" (
    "id" SERIAL NOT NULL,
    "orderItemId" INTEGER NOT NULL,
    "printerId" INTEGER,
    "assignedUserId" INTEGER,
    "status" "ProductionStatus" NOT NULL DEFAULT 'NA_FILA',
    "prioridade" INTEGER NOT NULL DEFAULT 0,
    "dataPrevistaInicio" TIMESTAMP(3),
    "dataPrevistaFim" TIMESTAMP(3),
    "dataInicioReal" TIMESTAMP(3),
    "dataFimReal" TIMESTAMP(3),
    "motivoFalha" TEXT,
    "custoPerdido" DOUBLE PRECISION,
    "isReimpressao" BOOLEAN NOT NULL DEFAULT false,
    "estoqueBaixado" BOOLEAN NOT NULL DEFAULT false,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "production_queue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "formaPagamento" TEXT,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expenses" (
    "id" SERIAL NOT NULL,
    "categoria" "ExpenseCategory" NOT NULL,
    "descricao" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fornecedor" TEXT,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "nomeLoja" TEXT NOT NULL DEFAULT 'Minha Impressão 3D',
    "logoPath" TEXT,
    "contatoTelefone" TEXT,
    "contatoEmail" TEXT,
    "enderecoOrcamento" TEXT,
    "valorPadraoKwh" DOUBLE PRECISION NOT NULL DEFAULT 0.95,
    "potenciaPadraoW" DOUBLE PRECISION NOT NULL DEFAULT 200,
    "valorHoraPadraoMaoDeObra" DOUBLE PRECISION NOT NULL DEFAULT 20,
    "margemLucroPadraoPercent" DOUBLE PRECISION NOT NULL DEFAULT 30,
    "taxaMinimaPedido" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "percentualDesperdicioPadrao" DOUBLE PRECISION NOT NULL DEFAULT 5,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attachments" (
    "id" SERIAL NOT NULL,
    "nomeArquivo" TEXT NOT NULL,
    "caminho" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "tamanhoBytes" INTEGER NOT NULL,
    "productId" INTEGER,
    "orderItemId" INTEGER,
    "quoteItemId" INTEGER,
    "clientRequestId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "entidade" TEXT NOT NULL,
    "entidadeId" INTEGER NOT NULL,
    "acao" TEXT NOT NULL,
    "dadosAntes" TEXT,
    "dadosDepois" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_requests" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT,
    "email" TEXT,
    "descricao" TEXT NOT NULL,
    "status" "ClientRequestStatus" NOT NULL DEFAULT 'NOVO',
    "customerId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_requests_pkey" PRIMARY KEY ("id")
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

-- AddForeignKey
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_clientRequestId_fkey" FOREIGN KEY ("clientRequestId") REFERENCES "client_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote_items" ADD CONSTRAINT "quote_items_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "quotes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote_items" ADD CONSTRAINT "quote_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote_items" ADD CONSTRAINT "quote_items_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "inventory_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "quotes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "inventory_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "inventory_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "order_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_queue" ADD CONSTRAINT "production_queue_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "order_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_queue" ADD CONSTRAINT "production_queue_printerId_fkey" FOREIGN KEY ("printerId") REFERENCES "printers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_queue" ADD CONSTRAINT "production_queue_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "order_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_quoteItemId_fkey" FOREIGN KEY ("quoteItemId") REFERENCES "quote_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_clientRequestId_fkey" FOREIGN KEY ("clientRequestId") REFERENCES "client_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_requests" ADD CONSTRAINT "client_requests_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
