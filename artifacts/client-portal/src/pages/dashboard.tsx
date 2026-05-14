import { useGetDashboardSummary, getGetDashboardSummaryQueryKey, useGetRecentActivity, getGetRecentActivityQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FolderKanban, Inbox, CheckCircle2, Clock, Activity } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";

export default function Dashboard() {
  const { data: summary, isLoading: loadingSummary } = useGetDashboardSummary();
  const { data: activity, isLoading: loadingActivity } = useGetRecentActivity();

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-serif tracking-tight text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your design studio.</p>
      </div>

      {loadingSummary ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
        </div>
      ) : summary ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Active Projects" value={summary.activeProjects} icon={FolderKanban} />
          <StatCard title="Pending Requests" value={summary.pendingRequests} icon={Inbox} />
          <StatCard title="Completed Projects" value={summary.completedProjects} icon={CheckCircle2} />
          <StatCard title="New This Week" value={summary.newRequestsThisWeek} icon={Clock} />
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Activity className="w-4 h-4 text-muted-foreground" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loadingActivity ? (
                <div className="p-6 space-y-4">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : activity && activity.length > 0 ? (
                <div className="divide-y divide-border/50">
                  {activity.map(item => (
                    <div key={item.id} className="p-4 px-6 flex items-start gap-4 hover:bg-muted/50 transition-colors">
                      <div className="mt-1 w-2 h-2 rounded-full bg-primary/40 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">{item.description}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span>{format(new Date(item.createdAt), 'MMM d, h:mm a')}</span>
                          {item.projectTitle && (
                            <>
                              <span>&middot;</span>
                              <Link href={`/projects/${item.projectId}`} className="hover:text-primary hover:underline transition-colors">
                                {item.projectTitle}
                              </Link>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center text-muted-foreground text-sm">
                  No recent activity to show.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-medium">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/requests/new">
                <div className="w-full text-left px-4 py-3 rounded-md bg-secondary/50 hover:bg-secondary text-sm font-medium transition-colors cursor-pointer text-secondary-foreground">
                  Create New Request
                </div>
              </Link>
              <Link href="/projects/new">
                <div className="w-full text-left px-4 py-3 rounded-md bg-secondary/50 hover:bg-secondary text-sm font-medium transition-colors cursor-pointer text-secondary-foreground">
                  Start New Project
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon }: { title: string, value: number, icon: any }) {
  return (
    <Card className="border-border/50 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <Icon className="w-4 h-4 text-muted-foreground/50" />
        </div>
        <p className="text-3xl font-serif mt-4 text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}
