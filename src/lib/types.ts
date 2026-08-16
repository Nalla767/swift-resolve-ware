export type Role = "admin" | "worker" | "customer";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  /** for customer role: the customer name used on orders */
  customer?: string;
};

export type Stage =
  | "created"
  | "prioritized"
  | "allocated"
  | "picking"
  | "packing"
  | "qc"
  | "dispatch"
  | "completed";

export const STAGES: Stage[] = [
  "created",
  "prioritized",
  "allocated",
  "picking",
  "packing",
  "qc",
  "dispatch",
  "completed",
];

export const STAGE_LABEL: Record<Stage, string> = {
  created: "Created",
  prioritized: "Prioritized",
  allocated: "Allocated",
  picking: "Picking",
  packing: "Packing",
  qc: "Quality Check",
  dispatch: "Dispatch",
  completed: "Completed",
};

export type PriorityLevel = "critical" | "high" | "normal" | "low";

export type InventoryStatus = "healthy" | "low" | "out" | "reserved" | "damaged";

export type StockMovement = {
  id: string;
  at: string;
  type: "inbound" | "outbound" | "reserve" | "release" | "damage" | "adjust";
  qty: number;
  note: string;
};

export type InventoryItem = {
  sku: string;
  name: string;
  category: string;
  zone: string;
  bin: string;
  available: number;
  reserved: number;
  damaged: number;
  reorderLevel: number;
  unitPrice: number;
  movements: StockMovement[];
};

export type OrderItem = {
  sku: string;
  name: string;
  qty: number;
  allocated: number;
};

export type TimelineEvent = {
  id: string;
  at: string;
  title: string;
  detail: string;
};

export type Order = {
  id: string;
  customer: string;
  customerEmail: string;
  items: OrderItem[];
  value: number;
  createdAt: string;
  slaDeadline: string;
  stage: Stage;
  score: number;
  priority: PriorityLevel;
  reasons: string[];
  customerTier: "platinum" | "gold" | "standard";
  allocationStatus: "pending" | "accepted" | "partial" | "hold" | "rejected";
  picker?: string;
  pickStatus: "queued" | "in_progress" | "done";
  packChecks: string[];
  qcChecks: string[];
  carrier?: string;
  trackingId?: string;
  dispatchPriority: boolean;
  timeline: TimelineEvent[];
  delivered?: boolean;
};

export type ExceptionType =
  | "Stock Shortage"
  | "Damaged Item"
  | "Missing Item"
  | "Wrong SKU"
  | "Quantity Mismatch"
  | "Picking Delay"
  | "Packing Delay"
  | "QC Failure"
  | "Dispatch Delay";

export type ExceptionStatus =
  | "open"
  | "investigating"
  | "action_required"
  | "resolved"
  | "escalated";

export type WarehouseException = {
  id: string;
  type: ExceptionType;
  orderId?: string;
  sku?: string;
  severity: "critical" | "high" | "medium" | "low";
  detectedAt: string;
  status: ExceptionStatus;
  problem: string;
  recommendation: string;
  resolution?: string;
  owner: string;
};

export type DecisionKind = "allocation" | "damage" | "dispatch" | "replenishment" | "qc";

export type PendingDecision = {
  id: string;
  kind: DecisionKind;
  title: string;
  orderId?: string;
  sku?: string;
  severity: "critical" | "high" | "medium";
  context: string[];
  recommendation: string;
  createdAt: string;
};

export type DecisionRecord = {
  id: string;
  decision: string;
  reason: string;
  operator: string;
  at: string;
  result: string;
  outcome: "accepted" | "modified" | "rejected";
};

export type AppNotification = {
  id: string;
  title: string;
  body: string;
  severity: "critical" | "warning" | "info" | "success";
  at: string;
  read: boolean;
  href: string;
};

export type ActivityEvent = {
  id: string;
  at: string;
  actor: string;
  event: string;
  detail: string;
};

export type Worker = {
  id: string;
  name: string;
  zone: string;
  shift: string;
  tasksToday: number;
  avgPickMin: number;
};
