import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { formatCurrency, formatDate } from "@/lib/utils";

const ACCENT = "#7c3aed";
const TEXT_DARK = "#18181b";
const TEXT_GRAY = "#71717a";
const BORDER = "#e4e4e7";
const BG_SOFT = "#faf9fc";

const styles = StyleSheet.create({
  page: { paddingHorizontal: 40, paddingVertical: 36, fontSize: 10, color: TEXT_DARK, fontFamily: "Helvetica" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  logo: { width: 44, height: 44, marginBottom: 6, borderRadius: 8 },
  storeName: { fontSize: 16, fontWeight: 700, color: ACCENT },
  storeContact: { fontSize: 8.5, color: TEXT_GRAY, marginTop: 2 },
  docTitleBox: { alignItems: "flex-end" },
  docTitle: { fontSize: 18, fontWeight: 700, color: TEXT_DARK, textTransform: "uppercase", letterSpacing: 0.5 },
  docNumero: { fontSize: 11, color: ACCENT, fontWeight: 700, marginTop: 2 },
  docData: { fontSize: 8.5, color: TEXT_GRAY, marginTop: 2 },
  statusBadge: {
    marginTop: 6,
    alignSelf: "flex-end",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    fontSize: 8,
    fontWeight: 700,
    textTransform: "uppercase",
  },
  divider: { borderBottomWidth: 1, borderBottomColor: BORDER, marginBottom: 16 },
  section: { marginBottom: 16 },
  sectionLabel: { fontSize: 8.5, fontWeight: 700, color: TEXT_GRAY, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 },
  clienteNome: { fontSize: 12, fontWeight: 700, color: TEXT_DARK },
  clienteLinha: { fontSize: 9, color: TEXT_GRAY, marginTop: 2 },
  table: { borderWidth: 1, borderColor: BORDER, borderRadius: 6, overflow: "hidden" },
  tableHeaderRow: { flexDirection: "row", backgroundColor: BG_SOFT, borderBottomWidth: 1, borderBottomColor: BORDER },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: BORDER },
  tableRowLast: { flexDirection: "row" },
  th: { padding: 8, fontSize: 8.5, fontWeight: 700, color: TEXT_GRAY, textTransform: "uppercase" },
  td: { padding: 8, fontSize: 9.5, color: TEXT_DARK },
  tdSub: { fontSize: 8, color: TEXT_GRAY, marginTop: 1 },
  colPeca: { width: "40%" },
  colMaterial: { width: "24%" },
  colQtd: { width: "10%", textAlign: "center" },
  colValor: { width: "13%", textAlign: "right" },
  totalsBox: { marginTop: 16, alignItems: "flex-end" },
  totalsRow: { flexDirection: "row", justifyContent: "space-between", width: 220, marginBottom: 4 },
  totalsLabel: { fontSize: 9.5, color: TEXT_GRAY },
  totalsValue: { fontSize: 9.5, color: TEXT_DARK, fontWeight: 700 },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 220,
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  grandTotalLabel: { fontSize: 11, color: TEXT_DARK, fontWeight: 700 },
  grandTotalValue: { fontSize: 13, color: ACCENT, fontWeight: 700 },
  observacoesBox: { marginTop: 20, padding: 10, backgroundColor: BG_SOFT, borderRadius: 6 },
  observacoesText: { fontSize: 9, color: TEXT_DARK, lineHeight: 1.4 },
  trackingBox: {
    marginTop: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: ACCENT,
    borderStyle: "dashed",
    borderRadius: 6,
  },
  trackingLabel: { fontSize: 8.5, color: TEXT_GRAY, marginBottom: 2 },
  trackingUrl: { fontSize: 9.5, color: ACCENT, fontWeight: 700 },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: { fontSize: 7.5, color: TEXT_GRAY },
});

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  AGUARDANDO_APROVACAO: { bg: "#fef9c3", text: "#854d0e" },
  APROVADO: { bg: "#dbeafe", text: "#1e40af" },
  NA_FILA: { bg: "#f4f4f5", text: "#3f3f46" },
  EM_IMPRESSAO: { bg: "#ede9fe", text: "#6d28d9" },
  EM_ACABAMENTO: { bg: "#ede9fe", text: "#6d28d9" },
  PRONTO_PARA_ENTREGA: { bg: "#ffedd5", text: "#9a3412" },
  ENTREGUE: { bg: "#dcfce7", text: "#166534" },
  CANCELADO: { bg: "#fee2e2", text: "#991b1b" },
  RASCUNHO: { bg: "#f4f4f5", text: "#3f3f46" },
  ENVIADO: { bg: "#dbeafe", text: "#1e40af" },
  RECUSADO: { bg: "#fee2e2", text: "#991b1b" },
  EXPIRADO: { bg: "#ffedd5", text: "#9a3412" },
  CONVERTIDO: { bg: "#ede9fe", text: "#6d28d9" },
};

export type DocumentoItem = {
  nomePeca: string;
  material: string | null;
  cor: string | null;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
};

export type DocumentoProps = {
  tipo: "pedido" | "orcamento";
  numero: string;
  data: Date;
  statusLabel: string;
  statusKey: string;
  cliente: {
    nome: string;
    telefone: string | null;
    email: string | null;
    cpfCnpj: string | null;
  };
  itens: DocumentoItem[];
  valorTotal: number;
  valorPago?: number;
  valorPendente?: number;
  validade?: Date | null;
  observacoes: string | null;
  trackingUrl?: string;
  loja: {
    nomeLoja: string;
    contatoTelefone: string | null;
    contatoEmail: string | null;
    enderecoOrcamento: string | null;
  };
  logoDataUri?: string | null;
};

export function OrderQuoteDocument(props: DocumentoProps) {
  const { tipo, numero, data, statusLabel, statusKey, cliente, itens, valorTotal, valorPago, valorPendente, validade, observacoes, trackingUrl, loja, logoDataUri } = props;
  const cor = STATUS_COLORS[statusKey] ?? { bg: "#f4f4f5", text: "#3f3f46" };

  return (
    <Document title={`${tipo === "pedido" ? "Pedido" : "Orçamento"} ${numero}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            {logoDataUri && <Image src={logoDataUri} style={styles.logo} />}
            <Text style={styles.storeName}>{loja.nomeLoja}</Text>
            {(loja.contatoTelefone || loja.contatoEmail) && (
              <Text style={styles.storeContact}>{[loja.contatoTelefone, loja.contatoEmail].filter(Boolean).join(" · ")}</Text>
            )}
            {loja.enderecoOrcamento && <Text style={styles.storeContact}>{loja.enderecoOrcamento}</Text>}
          </View>
          <View style={styles.docTitleBox}>
            <Text style={styles.docTitle}>{tipo === "pedido" ? "Pedido" : "Orçamento"}</Text>
            <Text style={styles.docNumero}>{numero}</Text>
            <Text style={styles.docData}>{formatDate(data)}</Text>
            <Text style={[styles.statusBadge, { backgroundColor: cor.bg, color: cor.text }]}>{statusLabel}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Cliente</Text>
          <Text style={styles.clienteNome}>{cliente.nome}</Text>
          {(cliente.telefone || cliente.email) && (
            <Text style={styles.clienteLinha}>{[cliente.telefone, cliente.email].filter(Boolean).join(" · ")}</Text>
          )}
          {cliente.cpfCnpj && <Text style={styles.clienteLinha}>CPF/CNPJ: {cliente.cpfCnpj}</Text>}
          {tipo === "orcamento" && validade && (
            <Text style={styles.clienteLinha}>Válido até {formatDate(validade)}</Text>
          )}
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.th, styles.colPeca]}>Peça</Text>
            <Text style={[styles.th, styles.colMaterial]}>Material/Cor</Text>
            <Text style={[styles.th, styles.colQtd]}>Qtd</Text>
            <Text style={[styles.th, styles.colValor]}>Unit.</Text>
            <Text style={[styles.th, styles.colValor]}>Total</Text>
          </View>
          {itens.map((item, i) => (
            <View key={i} style={i === itens.length - 1 ? styles.tableRowLast : styles.tableRow}>
              <Text style={[styles.td, styles.colPeca]}>{item.nomePeca}</Text>
              <Text style={[styles.td, styles.colMaterial]}>{[item.material, item.cor].filter(Boolean).join(" / ") || "-"}</Text>
              <Text style={[styles.td, styles.colQtd]}>{item.quantidade}</Text>
              <Text style={[styles.td, styles.colValor]}>{formatCurrency(item.valorUnitario)}</Text>
              <Text style={[styles.td, styles.colValor]}>{formatCurrency(item.valorTotal)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsBox}>
          {tipo === "pedido" && valorPago != null && (
            <>
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Valor pago</Text>
                <Text style={styles.totalsValue}>{formatCurrency(valorPago)}</Text>
              </View>
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Valor pendente</Text>
                <Text style={styles.totalsValue}>{formatCurrency(valorPendente ?? 0)}</Text>
              </View>
            </>
          )}
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Valor total</Text>
            <Text style={styles.grandTotalValue}>{formatCurrency(valorTotal)}</Text>
          </View>
        </View>

        {observacoes && (
          <View style={styles.observacoesBox}>
            <Text style={styles.sectionLabel}>Observações</Text>
            <Text style={styles.observacoesText}>{observacoes}</Text>
          </View>
        )}

        {trackingUrl && (
          <View style={styles.trackingBox}>
            <Text style={styles.trackingLabel}>Acompanhe seu pedido em tempo real:</Text>
            <Text style={styles.trackingUrl}>{trackingUrl}</Text>
          </View>
        )}

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>{loja.nomeLoja} · Obrigado pela preferência!</Text>
          <Text style={styles.footerText}>{[loja.contatoTelefone, loja.contatoEmail].filter(Boolean).join(" · ")}</Text>
        </View>
      </Page>
    </Document>
  );
}
