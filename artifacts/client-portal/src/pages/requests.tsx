import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useListRequests } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Plus, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Requests() {
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: requests, isLoading } = useListRequests(
    statusFilter !== "all" ? { status: statusFilter } : undefined
  );

  const statusColors: Record<string, string> = {
    new: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500",
    reviewing: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500",
    accepted: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500",
    rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500",
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 flex flex-col h-[calc(100vh-2rem)]">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-3xl font-serif tracking-tight text-foreground">Requests</h1>
          <p className="text-muted-foreground mt-1">Inbound design requests from clients.</p>
        </div>
        <Link href="/requests/new">
          <div className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 cursor-pointer gap-2">
            <Plus className="w-4 h-4" />
            New Request
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] bg-card border-border/50">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="reviewing">Reviewing</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 pb-8 space-y-3">
        {isLoading ? (
          [1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)
        ) : requests && requests.length > 0 ? (
          requests.map(request => (
            <Link key={request.id} href={`/requests/${request.id}`}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer border-border/50 shadow-sm group">
                <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-lg text-foreground truncate group-hover:text-primary transition-colors">{request.title}</h3>
                      <Badge variant="outline" className={cn("border-0 uppercase tracking-wider text-[10px]", statusColors[request.status])}>
                        {request.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground truncate">
                      <span>{request.clientName}</span>
                      {request.requestType && (
                        <>
                          <span>&middot;</span>
                          <span className="capitalize">{request.requestType}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 shrink-0 text-sm text-muted-foreground">
                    {format(new Date(request.createdAt), 'MMM d, yyyy')}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <div className="text-center py-12">
            <Inbox className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground">No requests found</h3>
            <p className="text-muted-foreground mt-1">Adjust your filters or submit a new request.</p>
          </div>
        )}
      </div>
    </div>
  );
}
