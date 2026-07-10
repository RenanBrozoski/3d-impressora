import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/dal";
import { db } from "@/lib/db";

export async function GET() {
  await requireAdmin();

  const [
    users,
    customers,
    products,
    quotes,
    quoteItems,
    orders,
    orderItems,
    inventoryItems,
    inventoryMovements,
    printers,
    productionQueue,
    payments,
    expenses,
    settings,
    attachments,
    auditLogs,
    clientRequests,
  ] = await Promise.all([
    db.user.findMany(),
    db.customer.findMany(),
    db.product.findMany(),
    db.quote.findMany(),
    db.quoteItem.findMany(),
    db.order.findMany(),
    db.orderItem.findMany(),
    db.inventoryItem.findMany(),
    db.inventoryMovement.findMany(),
    db.printer.findMany(),
    db.productionQueue.findMany(),
    db.payment.findMany(),
    db.expense.findMany(),
    db.settings.findMany(),
    db.attachment.findMany(),
    db.auditLog.findMany(),
    db.clientRequest.findMany(),
  ]);

  const backup = {
    geradoEm: new Date().toISOString(),
    users,
    customers,
    products,
    quotes,
    quoteItems,
    orders,
    orderItems,
    inventoryItems,
    inventoryMovements,
    printers,
    productionQueue,
    payments,
    expenses,
    settings,
    attachments,
    auditLogs,
    clientRequests,
  };

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

  return NextResponse.json(backup, {
    headers: {
      "Content-Disposition": `attachment; filename="backup-${timestamp}.json"`,
    },
  });
}
