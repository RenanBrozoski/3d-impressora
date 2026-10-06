-- Sistema de Catálogos de Produtos
-- Adiciona: catalogs, catalog_themes, catalog_pdf_themes, catalog_items,
--           catalog_product_relations, catalog_item_images, catalog_tags,
--           catalog_item_tags, catalog_attributes, catalog_attribute_links,
--           catalog_item_attribute_values

-- CreateTable
CREATE TABLE "catalogs" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "descricao" TEXT,
    "icone" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "tipo" TEXT NOT NULL DEFAULT 'catalogo',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "catalogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog_themes" (
    "id" SERIAL NOT NULL,
    "catalogId" INTEGER NOT NULL,
    "corPrimaria" TEXT NOT NULL DEFAULT '#7c3aed',
    "corSecundaria" TEXT NOT NULL DEFAULT '#2563eb',
    "corTexto" TEXT NOT NULL DEFAULT '#ffffff',
    "corFundo" TEXT NOT NULL DEFAULT '#f5f4fb',
    "imagemCapa" TEXT,
    "imagemFundo" TEXT,
    "logoUrl" TEXT,
    "imagemDeco" TEXT,
    "logoPosition" TEXT NOT NULL DEFAULT 'left',
    "fundoOpacidade" DOUBLE PRECISION NOT NULL DEFAULT 0.15,
    "cardStyle" TEXT NOT NULL DEFAULT 'rounded',
    "fontePrimaria" TEXT,
    "fonteSecundaria" TEXT,
    "cabecalhoTexto" TEXT,
    "rodapeTexto" TEXT,
    "extras" JSONB,

    CONSTRAINT "catalog_themes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog_pdf_themes" (
    "id" SERIAL NOT NULL,
    "catalogId" INTEGER NOT NULL,
    "corPrimaria" TEXT NOT NULL DEFAULT '#7c3aed',
    "corSecundaria" TEXT NOT NULL DEFAULT '#2563eb',
    "corTexto" TEXT NOT NULL DEFAULT '#14121f',
    "corFundo" TEXT NOT NULL DEFAULT '#ffffff',
    "imagemCapa" TEXT,
    "imagemCapaSecao" TEXT,
    "imagemFundo" TEXT,
    "logoUrl" TEXT,
    "imagemDeco" TEXT,
    "produtosPorPagina" INTEGER NOT NULL DEFAULT 2,
    "exibirNumeracao" BOOLEAN NOT NULL DEFAULT true,
    "exibirCabecalho" BOOLEAN NOT NULL DEFAULT true,
    "exibirRodape" BOOLEAN NOT NULL DEFAULT true,
    "cabecalhoTexto" TEXT,
    "rodapeTexto" TEXT,
    "fontePrimaria" TEXT,
    "fonteSecundaria" TEXT,
    "extras" JSONB,

    CONSTRAINT "catalog_pdf_themes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog_items" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "sku" TEXT,
    "descricao" TEXT,
    "tamanhoMin" TEXT,
    "tamanhoMax" TEXT,
    "dimensoes" TEXT,
    "material" TEXT,
    "cor" TEXT,
    "peso" TEXT,
    "observacoes" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "ordemGlobal" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "catalog_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog_product_relations" (
    "catalogId" INTEGER NOT NULL,
    "itemId" INTEGER NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "catalog_product_relations_pkey" PRIMARY KEY ("catalogId","itemId")
);

-- CreateTable
CREATE TABLE "catalog_item_images" (
    "id" SERIAL NOT NULL,
    "itemId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "nomeOriginal" TEXT,
    "altText" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "catalog_item_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog_tags" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "catalog_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog_item_tags" (
    "itemId" INTEGER NOT NULL,
    "tagId" INTEGER NOT NULL,

    CONSTRAINT "catalog_item_tags_pkey" PRIMARY KEY ("itemId","tagId")
);

-- CreateTable
CREATE TABLE "catalog_attributes" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'text',
    "opcoes" JSONB,
    "unidade" TEXT,

    CONSTRAINT "catalog_attributes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog_attribute_links" (
    "catalogId" INTEGER NOT NULL,
    "attributeId" INTEGER NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "obrigatorio" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "catalog_attribute_links_pkey" PRIMARY KEY ("catalogId","attributeId")
);

-- CreateTable
CREATE TABLE "catalog_item_attribute_values" (
    "itemId" INTEGER NOT NULL,
    "attributeId" INTEGER NOT NULL,
    "valor" TEXT NOT NULL,

    CONSTRAINT "catalog_item_attribute_values_pkey" PRIMARY KEY ("itemId","attributeId")
);

-- CreateIndex
CREATE UNIQUE INDEX "catalogs_slug_key" ON "catalogs"("slug");
CREATE INDEX "catalogs_ativo_idx" ON "catalogs"("ativo");
CREATE INDEX "catalogs_ordem_idx" ON "catalogs"("ordem");
CREATE INDEX "catalogs_deletedAt_idx" ON "catalogs"("deletedAt");

CREATE UNIQUE INDEX "catalog_themes_catalogId_key" ON "catalog_themes"("catalogId");
CREATE UNIQUE INDEX "catalog_pdf_themes_catalogId_key" ON "catalog_pdf_themes"("catalogId");

CREATE UNIQUE INDEX "catalog_items_sku_key" ON "catalog_items"("sku");
CREATE INDEX "catalog_items_ativo_idx" ON "catalog_items"("ativo");
CREATE INDEX "catalog_items_ordemGlobal_idx" ON "catalog_items"("ordemGlobal");
CREATE INDEX "catalog_items_deletedAt_idx" ON "catalog_items"("deletedAt");

CREATE INDEX "catalog_product_relations_catalogId_ordem_idx" ON "catalog_product_relations"("catalogId", "ordem");
CREATE INDEX "catalog_item_images_itemId_ordem_idx" ON "catalog_item_images"("itemId", "ordem");

CREATE UNIQUE INDEX "catalog_tags_nome_key" ON "catalog_tags"("nome");
CREATE UNIQUE INDEX "catalog_attributes_nome_key" ON "catalog_attributes"("nome");
CREATE INDEX "catalog_attribute_links_catalogId_ordem_idx" ON "catalog_attribute_links"("catalogId", "ordem");

-- AddForeignKey
ALTER TABLE "catalog_themes" ADD CONSTRAINT "catalog_themes_catalogId_fkey"
  FOREIGN KEY ("catalogId") REFERENCES "catalogs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "catalog_pdf_themes" ADD CONSTRAINT "catalog_pdf_themes_catalogId_fkey"
  FOREIGN KEY ("catalogId") REFERENCES "catalogs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "catalog_product_relations" ADD CONSTRAINT "catalog_product_relations_catalogId_fkey"
  FOREIGN KEY ("catalogId") REFERENCES "catalogs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "catalog_product_relations" ADD CONSTRAINT "catalog_product_relations_itemId_fkey"
  FOREIGN KEY ("itemId") REFERENCES "catalog_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "catalog_item_images" ADD CONSTRAINT "catalog_item_images_itemId_fkey"
  FOREIGN KEY ("itemId") REFERENCES "catalog_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "catalog_item_tags" ADD CONSTRAINT "catalog_item_tags_itemId_fkey"
  FOREIGN KEY ("itemId") REFERENCES "catalog_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "catalog_item_tags" ADD CONSTRAINT "catalog_item_tags_tagId_fkey"
  FOREIGN KEY ("tagId") REFERENCES "catalog_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "catalog_attribute_links" ADD CONSTRAINT "catalog_attribute_links_catalogId_fkey"
  FOREIGN KEY ("catalogId") REFERENCES "catalogs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "catalog_attribute_links" ADD CONSTRAINT "catalog_attribute_links_attributeId_fkey"
  FOREIGN KEY ("attributeId") REFERENCES "catalog_attributes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "catalog_item_attribute_values" ADD CONSTRAINT "catalog_item_attribute_values_itemId_fkey"
  FOREIGN KEY ("itemId") REFERENCES "catalog_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "catalog_item_attribute_values" ADD CONSTRAINT "catalog_item_attribute_values_attributeId_fkey"
  FOREIGN KEY ("attributeId") REFERENCES "catalog_attributes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
