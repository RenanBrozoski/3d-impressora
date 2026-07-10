-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_production_queue" (
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
    "estoqueBaixado" BOOLEAN NOT NULL DEFAULT false,
    "observacoes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "production_queue_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "order_items" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "production_queue_printerId_fkey" FOREIGN KEY ("printerId") REFERENCES "printers" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "production_queue_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_production_queue" ("assignedUserId", "createdAt", "custoPerdido", "dataFimReal", "dataInicioReal", "dataPrevistaFim", "dataPrevistaInicio", "id", "isReimpressao", "motivoFalha", "observacoes", "orderItemId", "printerId", "prioridade", "status", "updatedAt") SELECT "assignedUserId", "createdAt", "custoPerdido", "dataFimReal", "dataInicioReal", "dataPrevistaFim", "dataPrevistaInicio", "id", "isReimpressao", "motivoFalha", "observacoes", "orderItemId", "printerId", "prioridade", "status", "updatedAt" FROM "production_queue";
DROP TABLE "production_queue";
ALTER TABLE "new_production_queue" RENAME TO "production_queue";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
