import { createFileRoute } from "@tanstack/react-router";
import { User } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { PageHeader, SectionTitle, StatLine } from "@/components/shared";
import { Card } from "@/components/ui/card";
import { useCustomerOrders, useStore } from "@/lib/store";

export const Route = createFileRoute("/customer/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — SmartFulfill" },
      { name: "description", content: "Your delivery address, contact details and account summary for SmartFulfill." },
      { property: "og:title", content: "My Profile — SmartFulfill" },
      { property: "og:description", content: "Account details and delivery preferences." },
    ],
  }),
  component: () => (
    <AppShell role="customer">
      <CustomerProfile />
    </AppShell>
  ),
});

function CustomerProfile() {
  const { user } = useStore();
  const orders = useCustomerOrders();

  return (
    <>
      <PageHeader eyebrow="Account" title="My profile" description="Contact and delivery details we use for your orders." icon={User} />
      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="p-5">
          <SectionTitle title="Account" />
          <StatLine label="Name" value={user?.name ?? "—"} />
          <StatLine label="Email" value={user?.email ?? "—"} />
          <StatLine label="Account type" value="Business customer" />
          <StatLine label="Priority tier" value="Standard" />
        </Card>
        <Card className="p-5">
          <SectionTitle title="Delivery" />
          <StatLine label="Default address" value={orders[0]?.destination ?? "Amsterdam, NL"} />
          <StatLine label="Preferred carrier" value="Express Logistics" />
          <StatLine label="Orders placed" value={orders.length} />
          <StatLine label="Delivered" value={orders.filter((o) => o.stage === "delivered").length} />
        </Card>
      </div>
    </>
  );
}
