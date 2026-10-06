import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  Package,
  FileText,
  ClipboardList,
  Boxes,
  Disc3,
  Factory,
  Printer,
  Wallet,
  BarChart3,
  Inbox,
  Lightbulb,
  Settings,
  BookOpen,
  ShoppingBag,
  FileDown,
  Layers,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
  section?: string;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/produtos", label: "Produtos", icon: Package },
  { href: "/orcamentos", label: "Orçamentos", icon: FileText },
  { href: "/pedidos", label: "Pedidos", icon: ClipboardList },
  { href: "/solicitacoes", label: "Solicitações", icon: Inbox },
  { href: "/estoque", label: "Estoque", icon: Boxes },
  { href: "/estoque/filamentos", label: "Filamentos", icon: Disc3 },
  { href: "/producao", label: "Produção", icon: Factory },
  { href: "/impressoras", label: "Impressoras", icon: Printer },
  { href: "/financeiro", label: "Financeiro", icon: Wallet, adminOnly: true },
  { href: "/relatorios", label: "Relatórios", icon: BarChart3 },
  { href: "/recomendacoes", label: "Recomendações", icon: Lightbulb, adminOnly: true },
  // ---------- Catálogos ----------
  { href: "/catalogos", label: "Catálogos", icon: BookOpen, section: "Catálogos" },
  { href: "/catalogo-produtos", label: "Produtos do Catálogo", icon: ShoppingBag, section: "Catálogos" },
  { href: "/catalogo-atributos", label: "Atributos", icon: Layers, section: "Catálogos" },
  { href: "/pdf-catalogo", label: "Gerar PDF", icon: FileDown, section: "Catálogos" },
  { href: "/configuracoes", label: "Configurações", icon: Settings, adminOnly: true },
];
