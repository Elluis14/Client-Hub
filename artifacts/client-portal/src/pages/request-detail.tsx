import { useParams, Link, useLocation } from "wouter";
import { useGetRequest, useUpdateRequest, useCreateProject, getGetRequestQueryKey, getListRequestsQueryKey, getListProjectsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, User, Mail, Calendar, FolderKanban } from "lucide-react";
import { format } from "date-fns";

export default function RequestDetail() {
  const params = useParams();
  const id = Number(params.id);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: request, isLoading } = useGetRequest(id, { query: { enabled: !!id } });
  const updateRequest = useUpdateRequest();
  const createProject = useCreateProject();

  if (isLoading) {
    return <div className="p-8"><Skeleton className="h-64 w-full" /></div>;
  }

  if (!request) {
    return <div className="p-8">Request not found.</div>;
  }

  const handleStatusChange = (newStatus: any) => {
    updateRequest.mutate({ id, data: { status: newStatus } }, {
      onSuccess: () => {
        toast({ title: "Status updated" });
        queryClient.invalidateQueries({ queryKey: getGetRequestQueryKey(id) });
        queryClient.invalidateQueries({ queryKey: getListRequestsQueryKey() });
      }
    });
  };

  const convertToProject = () => {
    createProject.mutate({
      data: {
        title: request.title,
        clientName: request.clientName,
        clientEmail: request.clientEmail || undefined,
        description: request.description,
        status: "pending",
        priority: "medium"
      }
    }, {
      onSuccess: (project) => {
        // Also update request to accepted and link to project
        updateRequest.mutate({ id, data: { status: "accepted", projectId: project.id } }, {
          onSuccess: () => {
            toast({ title: "Converted to project successfully" });
            queryClient.invalidateQueries({ queryKey: getGetRequestQueryKey(id) });
            queryClient.invalidateQueries({ queryKey: getListRequestsQueryKey() });
            queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
            setLocation(`/projects/${project.id}`);
          }
        });
      }
    });
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <Link href="/requests" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Requests
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-serif tracking-tight text-foreground">{request.title}</h1>
          <Badge variant="outline" className="text-sm px-3 py-1 uppercase tracking-wider border-border/50">
            {request.status}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-lg font-medium">Request Details</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="prose dark:prose-invert max-w-none text-sm text-foreground whitespace-pre-wrap">
                {request.description}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border/50 shadow-sm">
            <CardContent className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">Client Info</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span>{request.clientName}</span>
                  </div>
                  {request.clientEmail && (
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <a href={`mailto:${request.clientEmail}`} className="hover:underline">{request.clientEmail}</a>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">Meta</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>{format(new Date(request.createdAt), 'MMMM d, yyyy')}</span>
                  </div>
                  {request.requestType && (
                    <div className="flex items-center gap-3 text-sm">
                      <FolderKanban className="w-4 h-4 text-muted-foreground" />
                      <span className="capitalize">{request.requestType}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm bg-secondary/20">
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Update Status</label>
                <Select value={request.status} onValueChange={handleStatusChange} disabled={updateRequest.isPending}>
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="reviewing">Reviewing</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {request.status !== "accepted" && request.status !== "rejected" && !request.projectId && (
                <div className="pt-4 border-t border-border/50">
                  <Button 
                    className="w-full" 
                    onClick={convertToProject}
                    disabled={createProject.isPending}
                  >
                    {createProject.isPending ? "Converting..." : "Convert to Project"}
                  </Button>
                </div>
              )}

              {request.projectId && (
                <div className="pt-4 border-t border-border/50">
                  <Link href={`/projects/${request.projectId}`}>
                    <Button variant="outline" className="w-full">
                      View Project
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
