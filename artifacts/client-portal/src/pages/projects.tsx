import { useState } from "react";
import { Link } from "wouter";
import { useListProjects } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Search, Plus, CalendarIcon, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Projects() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const { data: projects, isLoading } = useListProjects(
    statusFilter !== "all" ? { status: statusFilter } : undefined
  );

  const filteredProjects = projects?.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) || 
    p.clientName.toLowerCase().includes(search.toLowerCase())
  );

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500",
    in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500",
    review: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-500",
    completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500",
  };

  const priorityColors: Record<string, string> = {
    low: "text-muted-foreground",
    medium: "text-blue-600 dark:text-blue-400",
    high: "text-red-600 dark:text-red-400 font-medium",
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 flex flex-col h-[calc(100vh-2rem)]">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-3xl font-serif tracking-tight text-foreground">Projects</h1>
          <p className="text-muted-foreground mt-1">Manage active and past engagements.</p>
        </div>
        <Link href="/projects/new">
          <div className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 cursor-pointer gap-2">
            <Plus className="w-4 h-4" />
            New Project
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search projects or clients..." 
            className="pl-9 bg-card border-border/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] bg-card border-border/50">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="review">Under Review</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 pb-8 space-y-3">
        {isLoading ? (
          [1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)
        ) : filteredProjects && filteredProjects.length > 0 ? (
          filteredProjects.map(project => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer border-border/50 shadow-sm group">
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-lg text-foreground truncate group-hover:text-primary transition-colors">{project.title}</h3>
                      <Badge variant="outline" className={cn("border-0 uppercase tracking-wider text-[10px]", statusColors[project.status])}>
                        {project.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{project.clientName}</p>
                  </div>
                  
                  <div className="flex items-center gap-8 shrink-0 text-sm">
                    {project.dueDate && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CalendarIcon className="w-4 h-4" />
                        {format(new Date(project.dueDate), 'MMM d, yyyy')}
                      </div>
                    )}
                    {project.priority && (
                      <div className={cn("flex items-center gap-1.5 w-24", priorityColors[project.priority])}>
                        <AlertCircle className="w-4 h-4" />
                        <span className="capitalize">{project.priority}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <div className="text-center py-12">
            <FolderKanban className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground">No projects found</h3>
            <p className="text-muted-foreground mt-1">Adjust your filters or create a new project.</p>
          </div>
        )}
      </div>
    </div>
  );
}
