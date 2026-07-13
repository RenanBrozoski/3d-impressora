-- CreateTable
CREATE TABLE "item_materials" (
    "id" SERIAL NOT NULL,
    "quoteItemId" INTEGER,
    "orderItemId" INTEGER,
    "inventoryItemId" INTEGER NOT NULL,
    "pesoG" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "item_materials_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "item_materials" ADD CONSTRAINT "item_materials_quoteItemId_fkey" FOREIGN KEY ("quoteItemId") REFERENCES "quote_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_materials" ADD CONSTRAINT "item_materials_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "order_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_materials" ADD CONSTRAINT "item_materials_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "inventory_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
