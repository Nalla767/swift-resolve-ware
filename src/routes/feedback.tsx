import { Link, createFileRoute } from "@tanstack/react-router";
import { MessageSquare, Star, ThumbsDown, ThumbsUp } from "lucide-react";
import { useMemo, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { ColoredBars, Donut } from "@/components/charts";
import { EmptyState, Insight, KpiCard, PageHeader, SectionTitle } from "@/components/shared";
import { Pill } from "@/components/status";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { fmtRelative } from "@/lib/engine";
import { feedbackStats } from "@/lib/ops";
import { useStore } from "@/lib/store";
import type { FeedbackStatus } from "@/lib/types";

export const Route = createFileRoute("/feedback")({
  head: () => ({
    meta: [
      { title: "Feedback Management — SmartFulfill" },
      { name: "description", content: "Customer and worker feedback in one queue: ratings, categories, sentiment and the operational response to each report." },
      { property: "og:title", content: "Feedback Management — SmartFulfill" },
      { property: "og:description", content: "Turn customer and floor feedback into operational fixes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <AppShell role={["admin", "manager"]}>
      <FeedbackPage />
    </AppShell>
  ),
});

const STATUSES: FeedbackStatus[] = ["new", "reviewing", "in_progress", "resolved", "closed"];

function FeedbackPage() {
  const { feedback, updateFeedback } = useStore();
  const [source, setSource] = useState("all");
  const [status, setStatus] = useState("all");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [reply, setReply] = useState("");

  const stats = useMemo(() => feedbackStats(feedback), [feedback]);

  const rows = feedback.filter(
    (f) => (source === "all" || f.source === source) && (status === "all" || f.status === status),
  );

  const topCategory = stats.byCategory[0];

  return (
    <>
      <PageHeader
        eyebrow="Voice of the operation"
        title="Feedback management"
        description="Customers report on delivery and quality; workers report on stock accuracy, layout and equipment. Both land here and both drive fixes."
        icon={MessageSquare}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Average rating" value={`${stats.average}/5`} hint={`${stats.total} submissions`} tone={stats.average >= 4 ? "success" : "warning"} icon={Star} />
        <KpiCard label="Positive" value={stats.positive} hint="4★ and above" tone="success" icon={ThumbsUp} />
        <KpiCard label="Negative" value={stats.negative} hint="2★ and below" tone="critical" icon={ThumbsDown} />
        <KpiCard label="Open items" value={stats.open} hint="Awaiting a response" tone="warning" icon={MessageSquare} />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="p-5">
          <SectionTitle title="Rating distribution" hint="Where sentiment sits" />
          <ColoredBars data={stats.distribution.map((d, i) => ({ ...d, color: `var(--color-chart-${(i % 6) + 1})` }))} x="name" y="value" height={220} />
        </Card>

        <Card className="p-5">
          <SectionTitle title="Feedback by category" hint="Recurring themes" />
          <Donut data={stats.byCategory.map((c, i) => ({ ...c, color: `var(--color-chart-${(i % 6) + 1})` }))} height={220} />
        </Card>

        <Card className="p-5">
          <SectionTitle title="What this tells us" hint="Feedback converted into an operational signal" />
          <div className="space-y-2">
            {topCategory && <Insight text={`${topCategory.name} is the most reported theme with ${topCategory.value} submission(s) — worth a process review.`} to="/warehouse-operations" />}
            <Insight text={`${feedback.filter((f) => f.source === "worker").length} worker report(s) come from the floor; these usually predict exceptions before customers notice.`} to="/exceptions" />
            <Insight text={`${stats.open} item(s) are still open. Responding closes the loop and is logged in the activity trail.`} to="/activity" />
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <SectionTitle
          title="Feedback queue"
          hint="Update the status or send a response — every change is recorded"
          right={
            <div className="flex flex-wrap gap-2">
              <Tabs value={source} onValueChange={setSource}>
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="customer">Customer</TabsTrigger>
                  <TabsTrigger value="worker">Worker</TabsTrigger>
                </TabsList>
              </Tabs>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="h-9 w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          }
        />

        {rows.length === 0 ? (
          <EmptyState title="No feedback here" description="Nothing matches the current filters." />
        ) : (
          <div className="grid gap-3 xl:grid-cols-2">
            {rows.map((f) => (
              <div key={f.id} className="rounded-2xl border border-border bg-surface p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Pill t={f.source === "customer" ? "info" : "warning"}>{f.source}</Pill>
                  <Pill t={f.status === "resolved" || f.status === "closed" ? "success" : f.status === "new" ? "critical" : "warning"}>{f.status.replace("_", " ")}</Pill>
                  <span className="text-xs text-muted-foreground">{f.category}</span>
                  {typeof f.rating === "number" && (
                    <span className="flex items-center gap-0.5 text-warning">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={i < f.rating! ? "size-3.5 fill-current" : "size-3.5 opacity-25"} />
                      ))}
                    </span>
                  )}
                  <span className="ml-auto font-mono text-[11px] text-muted-foreground">{f.id}</span>
                </div>

                <p className="mt-2 text-sm">{f.comment}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {f.author} · {fmtRelative(f.at)}
                  {f.orderId && (
                    <>
                      {" · "}
                      <Link to="/orders/$orderId" params={{ orderId: f.orderId }} className="text-primary hover:underline">{f.orderId}</Link>
                    </>
                  )}
                  {f.sku && (
                    <>
                      {" · "}
                      <Link to="/inventory/$sku" params={{ sku: f.sku }} className="text-primary hover:underline">{f.sku}</Link>
                    </>
                  )}
                </p>

                {f.response && (
                  <p className="mt-2 rounded-lg border border-success/30 bg-success/10 p-2 text-xs">
                    <span className="font-semibold">Response:</span> {f.response}
                  </p>
                )}

                {replyTo === f.id ? (
                  <div className="mt-3 space-y-2">
                    <Textarea value={reply} onChange={(e) => setReply(e.target.value)} rows={3} placeholder="Write the response…" />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          updateFeedback(f.id, "resolved", reply || "Acknowledged and actioned by the operations team.");
                          setReplyTo(null);
                          setReply("");
                        }}
                      >
                        Send and resolve
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setReplyTo(null)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Button size="sm" onClick={() => { setReplyTo(f.id); setReply(f.response ?? ""); }}>Respond</Button>
                    <Select value={f.status} onValueChange={(v) => updateFeedback(f.id, v as FeedbackStatus)}>
                      <SelectTrigger className="h-8 w-36"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  );
}
