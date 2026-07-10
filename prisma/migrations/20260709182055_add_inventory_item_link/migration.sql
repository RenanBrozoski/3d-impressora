-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_order_items" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderId" INTEGER NOT NULL,
    "productId" INTEGER,
    "inventoryItemId" INTEGER,
    "nomePeca" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL DEFAULT 1,
    "material" TEXT,
    "cor" TEXT,
    "pesoUnidadeG" REAL,
    "tempoImpressaoH" REAL,
    "precoKgMaterial" REAL NOT NULL DEFAULT 0,
    "percentualDesperdicio" REAL NOT NULL DEFAULT 0,
    "potenciaImpressoraW" REAL NOT NULL DEFAULT 0,
    "valorKwh" REAL NOT NULL DEFAULT 0,
    "custoHoraMaquina" REAL NOT NULL DEFAULT 0,
    "tempoMaoObraH" REAL NOT NULL DEFAULT 0,
    "valorHoraMaoObra" REAL NOT NULL DEFAULT 0,
    "taxaMinima" REAL NOT NULL DEFAULT 0,
    "margemLucroPercent" REAL NOT NULL DEFAULT 0,
    "desconto" REAL NOT NULL DEFAULT 0,
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
    CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "order_items_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "inventory_items" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_order_items" ("cor", "custoAcabamento", "custoEmbalagem", "custoEnergia", "custoHoraMaquina", "custoMaoObra", "custoMaquina", "custoMaterial", "desconto", "id", "lucroEstimado", "margemLucroPercent", "material", "nomePeca", "observacoes", "orderId", "outrosCustos", "percentualDesperdicio", "pesoUnidadeG", "potenciaImpressoraW", "precoKgMaterial", "productId", "quantidade", "taxaMinima", "tempoImpressaoH", "tempoMaoObraH", "valorHoraMaoObra", "valorKwh", "valorTotal", "valorUnitario") SELECT "cor", "custoAcabamento", "custoEmbalagem", "custoEnergia", "custoHoraMaquina", "custoMaoObra", "custoMaquina", "custoMaterial", "desconto", "id", "lucroEstimado", "margemLucroPercent", "material", "nomePeca", "observacoes", "orderId", "outrosCustos", "percentualDesperdicio", "pesoUnidadeG", "potenciaImpressoraW", "precoKgMaterial", "productId", "quantidade", "taxaMinima", "tempoImpressaoH", "tempoMaoObraH", "valorHoraMaoObra", "valorKwh", "valorTotal", "valorUnitario" FROM "order_items";
DROP TABLE "order_items";
ALTER TABLE "new_order_items" RENAME TO "order_items";
CREATE TABLE "new_quote_items" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "quoteId" INTEGER NOT NULL,
    "productId" INTEGER,
    "inventoryItemId" INTEGER,
    "nomePeca" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL DEFAULT 1,
    "material" TEXT,
    "cor" TEXT,
    "pesoUnidadeG" REAL,
    "tempoImpressaoH" REAL,
    "precoKgMaterial" REAL NOT NULL DEFAULT 0,
    "percentualDesperdicio" REAL NOT NULL DEFAULT 0,
    "potenciaImpressoraW" REAL NOT NULL DEFAULT 0,
    "valorKwh" REAL NOT NULL DEFAULT 0,
    "custoHoraMaquina" REAL NOT NULL DEFAULT 0,
    "tempoMaoObraH" REAL NOT NULL DEFAULT 0,
    "valorHoraMaoObra" REAL NOT NULL DEFAULT 0,
    "taxaMinima" REAL NOT NULL DEFAULT 0,
    "margemLucroPercent" REAL NOT NULL DEFAULT 0,
    "desconto" REAL NOT NULL DEFAULT 0,
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
    CONSTRAINT "quote_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "quote_items_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "inventory_items" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_quote_items" ("cor", "custoAcabamento", "custoEmbalagem", "custoEnergia", "custoHoraMaquina", "custoMaoObra", "custoMaquina", "custoMaterial", "desconto", "id", "lucroEstimado", "margemLucroPercent", "material", "nomePeca", "observacoes", "outrosCustos", "percentualDesperdicio", "pesoUnidadeG", "potenciaImpressoraW", "precoKgMaterial", "productId", "quantidade", "quoteId", "taxaMinima", "tempoImpressaoH", "tempoMaoObraH", "valorHoraMaoObra", "valorKwh", "valorTotal", "valorUnitario") SELECT "cor", "custoAcabamento", "custoEmbalagem", "custoEnergia", "custoHoraMaquina", "custoMaoObra", "custoMaquina", "custoMaterial", "desconto", "id", "lucroEstimado", "margemLucroPercent", "material", "nomePeca", "observacoes", "outrosCustos", "percentualDesperdicio", "pesoUnidadeG", "potenciaImpressoraW", "precoKgMaterial", "productId", "quantidade", "quoteId", "taxaMinima", "tempoImpressaoH", "tempoMaoObraH", "valorHoraMaoObra", "valorKwh", "valorTotal", "valorUnitario" FROM "quote_items";
DROP TABLE "quote_items";
ALTER TABLE "new_quote_items" RENAME TO "quote_items";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
