# Story 6.1: Admin Payment Dashboard

## Story Info
- **Epic:** 6 - Admin Enhancements
- **Story ID:** 6.1
- **Title:** Admin Payment Dashboard
- **Status:** ready-for-dev
- **Dependencies:** Epic 1 complete, Story 4.3

## User Story

As an **admin**,
I want **to view all brand claim payments**,
So that **I can track revenue and troubleshoot payment issues**.

## Acceptance Criteria

### AC1: Payment List View
**Given** I am logged in as admin
**When** I visit the payment dashboard
**Then** I see a table of all payments containing:
- Date
- Brand name
- Franchisor email
- Amount
- Status (succeeded, pending, failed)
- Stripe payment ID (linked)

### AC2: Payment Filtering
**Given** I am on the payment dashboard
**When** I apply filters
**Then** I can filter by:
- Date range
- Status
- Search by brand name or email

### AC3: Payment Details
**Given** I click on a payment row
**When** the details modal opens
**Then** I see:
- Full payment details
- Link to Stripe dashboard for this payment
- Associated brand claim information

## Technical Notes

### Files to Create/Modify
- **Create:** `client/src/pages/admin/payments.tsx`
- **Modify:** `server/routes.ts` - Add admin payments endpoint
- **Modify:** `server/storage.ts` - Add payment query methods

### Backend - Admin Payments Endpoint
```typescript
// Add to server/routes.ts

app.get("/api/admin/payments", isAuthenticated, isAdmin, async (req, res) => {
  const { status, startDate, endDate, search, page = "1", limit = "20" } = req.query;

  try {
    const filters = {
      status: status as string | undefined,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      search: search as string | undefined,
    };

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const { payments, total } = await storage.getPaymentsWithDetails(
      filters,
      pageNum,
      limitNum
    );

    res.json({
      payments,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ message: "Failed to fetch payments" });
  }
});

app.get("/api/admin/payments/:id", isAuthenticated, isAdmin, async (req, res) => {
  const paymentId = parseInt(req.params.id);

  try {
    const payment = await storage.getPaymentWithDetails(paymentId);

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.json(payment);
  } catch (error) {
    console.error("Error fetching payment:", error);
    res.status(500).json({ message: "Failed to fetch payment" });
  }
});
```

### Storage Methods
```typescript
// Add to server/storage.ts

interface PaymentFilters {
  status?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

async getPaymentsWithDetails(
  filters: PaymentFilters,
  page: number,
  limit: number
): Promise<{ payments: PaymentWithDetails[]; total: number }> {
  let query = db
    .select({
      payment: payments,
      brand: brands,
      user: {
        id: users.id,
        email: users.email,
        displayName: users.displayName,
      },
    })
    .from(payments)
    .leftJoin(brands, eq(payments.brandId, brands.id))
    .leftJoin(users, eq(payments.userId, users.id));

  // Apply filters
  const conditions = [];

  if (filters.status) {
    conditions.push(eq(payments.status, filters.status));
  }

  if (filters.startDate) {
    conditions.push(gte(payments.createdAt, filters.startDate));
  }

  if (filters.endDate) {
    conditions.push(lte(payments.createdAt, filters.endDate));
  }

  if (filters.search) {
    conditions.push(
      or(
        ilike(brands.name, `%${filters.search}%`),
        ilike(users.email, `%${filters.search}%`)
      )
    );
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(payments);
  const total = countResult[0]?.count || 0;

  // Get paginated results
  const results = await query
    .orderBy(desc(payments.createdAt))
    .limit(limit)
    .offset((page - 1) * limit);

  return {
    payments: results.map((r) => ({
      ...r.payment,
      brand: r.brand,
      user: r.user,
    })),
    total,
  };
}

async getPaymentWithDetails(paymentId: number): Promise<PaymentWithDetails | null> {
  const result = await db
    .select({
      payment: payments,
      brand: brands,
      user: {
        id: users.id,
        email: users.email,
        displayName: users.displayName,
      },
    })
    .from(payments)
    .leftJoin(brands, eq(payments.brandId, brands.id))
    .leftJoin(users, eq(payments.userId, users.id))
    .where(eq(payments.id, paymentId))
    .limit(1);

  if (result.length === 0) return null;

  return {
    ...result[0].payment,
    brand: result[0].brand,
    user: result[0].user,
  };
}
```

### Frontend Implementation
```typescript
// client/src/pages/admin/payments.tsx

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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Search } from "lucide-react";

export default function AdminPaymentsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("");
  const [page, setPage] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["/api/admin/payments", { search, status, page }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (status) params.set("status", status);
      params.set("page", page.toString());

      const res = await fetch(`/api/admin/payments?${params}`);
      if (!res.ok) throw new Error("Failed to fetch payments");
      return res.json();
    },
  });

  const { data: paymentDetails } = useQuery({
    queryKey: ["/api/admin/payments", selectedPayment],
    queryFn: async () => {
      const res = await fetch(`/api/admin/payments/${selectedPayment}`);
      if (!res.ok) throw new Error("Failed to fetch payment");
      return res.json();
    },
    enabled: !!selectedPayment,
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      succeeded: "default",
      pending: "secondary",
      failed: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Payment Dashboard</h1>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search brand or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All statuses</SelectItem>
            <SelectItem value="succeeded">Succeeded</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Franchisor</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Stripe ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : data?.payments?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No payments found
                </TableCell>
              </TableRow>
            ) : (
              data?.payments?.map((payment: any) => (
                <TableRow
                  key={payment.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedPayment(payment.id)}
                >
                  <TableCell>
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{payment.brand?.name || "Unknown"}</TableCell>
                  <TableCell>{payment.user?.email || "Unknown"}</TableCell>
                  <TableCell>{formatCurrency(payment.amount)}</TableCell>
                  <TableCell>{getStatusBadge(payment.status)}</TableCell>
                  <TableCell>
                    <a
                      href={`https://dashboard.stripe.com/payments/${payment.stripePaymentIntentId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {payment.stripePaymentIntentId?.slice(-8)}
                      <ExternalLink className="h-3 w-3" />
                    </a>
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
            Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, data.pagination.total)} of {data.pagination.total}
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

      {/* Payment Details Modal */}
      <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
          </DialogHeader>
          {paymentDetails && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Brand</p>
                  <p className="font-medium">{paymentDetails.brand?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="font-medium">{formatCurrency(paymentDetails.amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p>{getStatusBadge(paymentDetails.status)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {new Date(paymentDetails.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Franchisor</p>
                  <p className="font-medium">{paymentDetails.user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Type</p>
                  <p className="font-medium">{paymentDetails.type}</p>
                </div>
              </div>
              <Button asChild className="w-full">
                <a
                  href={`https://dashboard.stripe.com/payments/${paymentDetails.stripePaymentIntentId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View in Stripe Dashboard
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

## Definition of Done
- [ ] `GET /api/admin/payments` endpoint created
- [ ] `GET /api/admin/payments/:id` endpoint created
- [ ] Storage methods for payment queries added
- [ ] Admin payments page created
- [ ] Payment table displays all required fields
- [ ] Filtering by status and search works
- [ ] Pagination works correctly
- [ ] Payment details modal shows full information
- [ ] Links to Stripe dashboard work
- [ ] Only admins can access
- [ ] TypeScript compiles without errors

## Test Scenarios
1. **View Payments:** Admin sees list of all payments
2. **Filter by Status:** Only matching payments shown
3. **Search:** Finds payments by brand or email
4. **Pagination:** Navigates through pages
5. **Payment Details:** Modal shows full details
6. **Stripe Link:** Opens correct Stripe dashboard page
7. **Non-Admin Access:** Returns 403 forbidden
