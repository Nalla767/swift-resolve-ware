import { Link, createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { BarSeries } from "@/components/charts";
import { EmptyState, KpiCard, PageHeader, SectionTitle, TableShell, Td, Th } from "@/components/shared";
import { ExceptionBadge, SeverityBadge } from "@/components/status";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fmtRelative } from "@/lib/engine";
import { useStore } from "@/lib/store";
import type { Role } from "@/lib/types";

export const Route = createFileRoute("/exceptions/")({
  head: () => ({
    meta: [
      { title: "Exception Management — SmartFulfill" },
      { name: "description", content: "Every shortage, damage, delay and QC failure with a recommended decision and resolution path." },
      { property: "og:title", content: "Exception Management — SmartFulfill" },
      { property: "og:description", content: "Problem → recommended decision → resolution for every warehouse exception." },
    ],
  }),
  component: ExceptionsRoute,
});

function ExceptionsRoute() {
  const { user } = useStore();
  const role: Role[] = user?.role === "worker" ? ["worker"] : ["admin", "manager"];
  return (
    <AppShell role={role}>
      <Exceptions />
    </AppShell>
  );
}

function Exceptions() {
  const { exceptions } = useStore();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");

  const rows = useMemo(
    () =>
      exceptions.filter((e) => {
        const hay = `${e.id} ${e.type} ${e.orderId ?? ""} ${e.sku ?? ""} ${e.problem}`.toLowerCase();
        if (q && !hay.includes(q.toLowerCase())) return false;
        if (status !== "all" && e.status !== status) return false;
        if (type !== "all" && e.type !== type) return false;
        return true;
      }),
    [exceptions, q, status, type],
  );

  const byType = Object.entries(
    exceptions.reduce<Record<string, number>>((acc, e) => ({ ...acc, [e.type]: (acc[e.type] ?? 0) + 1 }), {}),
  ).map(([name, count]) => ({ name, count }));

  const open = exceptions.filter((e) => e.status !== "resolved");

  return (
    <>
      <PageHeader
        eyebrow="Resolution"
        title="Exception management"
        description="Every exception carries the problem, the system's recommended decision and the resolution that was applied."
        icon={AlertTriangle}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Active exceptions" value={open.length} tone="warning" icon={AlertTriangle} />
        <KpiCard label="Critical" value={exceptions.filter((e) => e.severity === "critical" && e.status !== "resolved").length} tone="critical" icon={AlertTriangle} />
        <KpiCard label="Escalated" value={exceptions.filter((e) => e.status === "escalated").length} tone="critical" icon={AlertTriangle} />
        <KpiCard label="Resolved" value={exceptions.filter((e) => e.status === "resolved").length} tone="success" icon={AlertTriangle} />
      </div>

      <Card className="p-5">
        <SectionTitle title="Exceptions by category" hint="Where the operation loses time" />
        <BarSeries data={byType} x="name" bars={[{ key: "count", name: "Exceptions", color: "var(--color-chart-4)" }]} height={240} layout="vertical" />
      </Card>

      <Card className="gap-3 p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search exception ID, order, SKU or description…" className="pl-9" />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="md:w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="investigating">Investigating</SelectItem>
              <SelectItem value="action_required">Action required</SelectItem>
              <SelectItem value="escalated">Escalated</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="md:w-[190px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {[...new Set(exceptions.map((e) => e.type))].map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p className="text-xs text-muted-foreground">Showing {rows.length} of {exceptions.length} exceptions</p>
      </Card>

      {rows.length === 0 ? (
        <EmptyState title="No exceptions match" description="Adjust the filters to see exceptions again." />
      ) : (
        <TableShell>
          <thead className="border-b border-border bg-surface">
            <tr>
              <Th>Exception</Th>
              <Th>Type</Th>
              <Th>Order</Th>
              <Th>Severity</Th>
              <Th>Detected</Th>
              <Th>Status</Th>
              <Th>Recommendation</Th>
              <Th>Owner</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((e) => (
              <tr key={e.id} className="transition-colors hover:bg-accent/40">
                <Td className="font-mono font-semibold">{e.id}</Td>
                <Td>{e.type}</Td>
                <Td>
                  {e.orderId ? (
                    <Link to="/orders/$orderId" params={{ orderId: e.orderId }} className="font-mono hover:text-primary">
                      {e.orderId}
                    </Link>
                  ) : (
                    <span className="text-muted-foreground">Floor-wide</span>
                  )}
                </Td>
                <Td><SeverityBadge s={e.severity} /></Td>
                <Td className="text-xs text-muted-foreground">{fmtRelative(e.detectedAt)}</Td>
                <Td><ExceptionBadge s={e.status} /></Td>
                <Td className="max-w-[280px] text-xs text-muted-foreground">{e.recommendation}</Td>
                <Td className="text-xs">{e.owner}</Td>
                <Td className="text-right">
                  <Button asChild size="sm" variant="outline">
                    <Link to="/exceptions/$exceptionId" params={{ exceptionId: e.id }}>Resolve</Link>
                  </Button>
                </Td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      )}
    </>
  );
}
