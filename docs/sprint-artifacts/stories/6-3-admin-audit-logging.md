# Story 6.3: Admin Audit Logging

## Story Info
- **Epic:** 6 - Admin Enhancements
- **Story ID:** 6.3
- **Title:** Admin Audit Logging
- **Status:** ready-for-dev
- **Dependencies:** Epic 1 complete, Epic 2 complete

## User Story

As a **platform operator**,
I want **all admin actions to be logged**,
So that **I have an audit trail for security and compliance**.

## Acceptance Criteria

### AC1: Actions Logged
**Given** an admin performs any of these actions:
- Approve/reject review
- Reset user password
- Delete user account
- Modify brand claim status
**When** the action completes
**Then** an audit log entry is created with:
- Admin user ID and email
- Action type
- Target entity (user/review/brand)
- Timestamp
- IP address (if available)

### AC2: Audit Log Viewer
**Given** I am logged in as admin
**When** I visit the audit log page
**Then** I see a chronological list of admin actions
**And** I can filter by action type, admin, or date range

### AC3: Log Retention
**Given** audit logs are stored
**When** logs are older than 1 year
**Then** they remain accessible (no automatic deletion)

## Technical Notes

### Files to Create/Modify
- **Create:** `shared/schema.ts` - Add audit_logs table
- **Create:** `client/src/pages/admin/audit-logs.tsx`
- **Modify:** `server/routes.ts` - Add audit logging to admin actions
- **Modify:** `server/storage.ts` - Add audit log methods

### Database Schema
```typescript
// Add to shared/schema.ts

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  adminId: integer("admin_id").notNull().references(() => users.id),
  adminEmail: varchar("admin_email", { length: 255 }).notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entity_type", { length: 50 }), // 'user', 'review', 'brand', 'payment'
  entityId: integer("entity_id"),
  targetUserEmail: varchar("target_user_email", { length: 255 }),
  details: jsonb("details"),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Index for efficient querying
// CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
// CREATE INDEX idx_audit_logs_admin_id ON audit_logs(admin_id);
// CREATE INDEX idx_audit_logs_action ON audit_logs(action);
```

### Audit Action Types
```typescript
// server/services/audit.ts

export const AUDIT_ACTIONS = {
  // Review moderation
  REVIEW_APPROVED: "review_approved",
  REVIEW_REJECTED: "review_rejected",

  // User management
  PASSWORD_RESET_INITIATED: "password_reset_initiated",
  USER_DELETED: "user_deleted",
  USER_ROLE_CHANGED: "user_role_changed",

  // Brand management
  BRAND_CLAIM_APPROVED: "brand_claim_approved",
  BRAND_CLAIM_REVOKED: "brand_claim_revoked",

  // Payment
  PAYMENT_REFUNDED: "payment_refunded",
} as const;

export type AuditAction = typeof AUDIT_ACTIONS[keyof typeof AUDIT_ACTIONS];
```

### Audit Service
```typescript
// server/services/audit.ts

import { Request } from "express";
import { storage } from "../storage";

interface AuditLogData {
  adminId: number;
  adminEmail: string;
  action: string;
  entityType?: "user" | "review" | "brand" | "payment";
  entityId?: number;
  targetUserEmail?: string;
  details?: Record<string, any>;
}

export async function logAdminAction(
  req: Request,
  data: AuditLogData
): Promise<void> {
  try {
    await storage.createAuditLog({
      ...data,
      ipAddress: req.ip || req.headers["x-forwarded-for"]?.toString(),
      userAgent: req.headers["user-agent"],
    });
  } catch (error) {
    // Log error but don't fail the request
    console.error("Failed to create audit log:", error);
  }
}
```

### Storage Methods
```typescript
// Add to server/storage.ts

interface AuditLogFilters {
  action?: string;
  adminId?: number;
  entityType?: string;
  startDate?: Date;
  endDate?: Date;
}

async createAuditLog(data: {
  adminId: number;
  adminEmail: string;
  action: string;
  entityType?: string;
  entityId?: number;
  targetUserEmail?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}): Promise<AuditLog> {
  const [log] = await db
    .insert(auditLogs)
    .values(data)
    .returning();
  return log;
}

async getAuditLogs(
  filters: AuditLogFilters,
  page: number,
  limit: number
): Promise<{ logs: AuditLog[]; total: number }> {
  let query = db
    .select()
    .from(auditLogs);

  const conditions = [];

  if (filters.action) {
    conditions.push(eq(auditLogs.action, filters.action));
  }

  if (filters.adminId) {
    conditions.push(eq(auditLogs.adminId, filters.adminId));
  }

  if (filters.entityType) {
    conditions.push(eq(auditLogs.entityType, filters.entityType));
  }

  if (filters.startDate) {
    conditions.push(gte(auditLogs.createdAt, filters.startDate));
  }

  if (filters.endDate) {
    conditions.push(lte(auditLogs.createdAt, filters.endDate));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(auditLogs)
    .where(conditions.length > 0 ? and(...conditions) : undefined);
  const total = countResult[0]?.count || 0;

  // Get paginated results
  const logs = await query
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit)
    .offset((page - 1) * limit);

  return { logs, total };
}

async getAuditLogStats(): Promise<{
  totalLogs: number;
  actionCounts: Record<string, number>;
  recentAdmins: Array<{ adminEmail: string; count: number }>;
}> {
  // Total logs
  const totalResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(auditLogs);

  // Action counts
  const actionCountsResult = await db
    .select({
      action: auditLogs.action,
      count: sql<number>`count(*)`,
    })
    .from(auditLogs)
    .groupBy(auditLogs.action);

  // Recent active admins (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentAdminsResult = await db
    .select({
      adminEmail: auditLogs.adminEmail,
      count: sql<number>`count(*)`,
    })
    .from(auditLogs)
    .where(gte(auditLogs.createdAt, thirtyDaysAgo))
    .groupBy(auditLogs.adminEmail)
    .orderBy(desc(sql`count(*)`))
    .limit(10);

  return {
    totalLogs: totalResult[0]?.count || 0,
    actionCounts: Object.fromEntries(
      actionCountsResult.map((r) => [r.action, r.count])
    ),
    recentAdmins: recentAdminsResult,
  };
}
```

### Backend - Audit Log Endpoint
```typescript
// Add to server/routes.ts

app.get("/api/admin/audit-logs", isAuthenticated, isAdmin, async (req, res) => {
  const { action, adminId, entityType, startDate, endDate, page = "1", limit = "50" } = req.query;

  try {
    const filters: AuditLogFilters = {
      action: action as string | undefined,
      adminId: adminId ? parseInt(adminId as string) : undefined,
      entityType: entityType as string | undefined,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    };

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const { logs, total } = await storage.getAuditLogs(filters, pageNum, limitNum);

    res.json({
      logs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    res.status(500).json({ message: "Failed to fetch audit logs" });
  }
});

app.get("/api/admin/audit-logs/stats", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const stats = await storage.getAuditLogStats();
    res.json(stats);
  } catch (error) {
    console.error("Error fetching audit stats:", error);
    res.status(500).json({ message: "Failed to fetch audit stats" });
  }
});
```

### Integration Examples
```typescript
// Example: Adding audit logging to review approval

app.post("/api/admin/reviews/:id/approve", isAuthenticated, isAdmin, async (req, res) => {
  const reviewId = parseInt(req.params.id);
  const admin = req.user!;

  try {
    const review = await storage.getReview(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    await storage.approveReview(reviewId);

    // Audit log
    await logAdminAction(req, {
      adminId: admin.id,
      adminEmail: admin.email,
      action: AUDIT_ACTIONS.REVIEW_APPROVED,
      entityType: "review",
      entityId: reviewId,
      details: {
        brandId: review.brandId,
        reviewRating: review.overallRating,
      },
    });

    // ... rest of notification logic

    res.json({ message: "Review approved" });
  } catch (error) {
    console.error("Error approving review:", error);
    res.status(500).json({ message: "Failed to approve review" });
  }
});
```

### Frontend Implementation
```typescript
// client/src/pages/admin/audit-logs.tsx

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Users, FileText, Clock } from "lucide-react";

const ACTION_LABELS: Record<string, string> = {
  review_approved: "Review Approved",
  review_rejected: "Review Rejected",
  password_reset_initiated: "Password Reset",
  user_deleted: "User Deleted",
  user_role_changed: "Role Changed",
  brand_claim_approved: "Claim Approved",
  brand_claim_revoked: "Claim Revoked",
  payment_refunded: "Payment Refunded",
};

const ACTION_COLORS: Record<string, string> = {
  review_approved: "bg-green-100 text-green-800",
  review_rejected: "bg-red-100 text-red-800",
  password_reset_initiated: "bg-yellow-100 text-yellow-800",
  user_deleted: "bg-red-100 text-red-800",
  brand_claim_approved: "bg-green-100 text-green-800",
  brand_claim_revoked: "bg-red-100 text-red-800",
};

export default function AdminAuditLogsPage() {
  const [action, setAction] = useState<string>("");
  const [entityType, setEntityType] = useState<string>("");
  const [page, setPage] = useState(1);

  const { data: stats } = useQuery({
    queryKey: ["/api/admin/audit-logs/stats"],
  });

  const { data, isLoading } = useQuery({
    queryKey: ["/api/admin/audit-logs", { action, entityType, page }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (action) params.set("action", action);
      if (entityType) params.set("entityType", entityType);
      params.set("page", page.toString());

      const res = await fetch(`/api/admin/audit-logs?${params}`);
      if (!res.ok) throw new Error("Failed to fetch logs");
      return res.json();
    },
  });

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Audit Logs</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Actions</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalLogs || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Reviews Moderated</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats?.actionCounts?.review_approved || 0) + (stats?.actionCounts?.review_rejected || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Password Resets</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.actionCounts?.password_reset_initiated || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Admins (30d)</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.recentAdmins?.length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <Select value={action} onValueChange={setAction}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All actions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All actions</SelectItem>
            {Object.entries(ACTION_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={entityType} onValueChange={setEntityType}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All entities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All entities</SelectItem>
            <SelectItem value="user">Users</SelectItem>
            <SelectItem value="review">Reviews</SelectItem>
            <SelectItem value="brand">Brands</SelectItem>
            <SelectItem value="payment">Payments</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Logs Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Admin</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>IP Address</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : data?.logs?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No audit logs found
                </TableCell>
              </TableRow>
            ) : (
              data?.logs?.map((log: any) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-sm">
                    {new Date(log.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>{log.adminEmail}</TableCell>
                  <TableCell>
                    <Badge className={ACTION_COLORS[log.action] || ""}>
                      {ACTION_LABELS[log.action] || log.action}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {log.entityType && (
                      <span className="capitalize">{log.entityType} #{log.entityId}</span>
                    )}
                  </TableCell>
                  <TableCell>{log.targetUserEmail || "-"}</TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {log.ipAddress || "-"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {data?.pagination && (
        <div className="flex justify-between items-center mt-4">
          <p className="text-sm text-muted-foreground">
            Showing {((page - 1) * 50) + 1} to {Math.min(page * 50, data.pagination.total)} of {data.pagination.total}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= data.pagination.pages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
```

## Definition of Done
- [ ] `audit_logs` table created in database
- [ ] `createAuditLog()` storage method implemented
- [ ] `getAuditLogs()` with filtering implemented
- [ ] `getAuditLogStats()` implemented
- [ ] All admin actions updated to create audit logs:
  - [ ] Review approval
  - [ ] Review rejection
  - [ ] Password reset
  - [ ] User deletion
  - [ ] Brand claim modifications
- [ ] `GET /api/admin/audit-logs` endpoint created
- [ ] `GET /api/admin/audit-logs/stats` endpoint created
- [ ] Admin audit logs page created
- [ ] Filtering by action and entity type works
- [ ] Pagination works correctly
- [ ] Stats cards display correctly
- [ ] IP addresses captured when available
- [ ] TypeScript compiles without errors

## Test Scenarios
1. **Review Approval Logged:** Audit entry created with correct data
2. **Password Reset Logged:** Admin ID, target email captured
3. **Filter by Action:** Only matching logs shown
4. **Filter by Entity:** Only matching logs shown
5. **Pagination:** Navigates through pages correctly
6. **Stats Accurate:** Counts match actual log entries
7. **IP Capture:** IP address recorded when available
8. **No Deletion:** Old logs remain accessible
9. **Non-Admin Access:** Returns 403 forbidden
