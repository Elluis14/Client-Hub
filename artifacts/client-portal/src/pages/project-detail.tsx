import { useState } from "react";
import { useParams, Link } from "wouter";
import { 
  useGetProject, 
  useUpdateProject, 
  useListProjectMessages, 
  useCreateProjectMessage,
  useListProjectFiles,
  useAddProjectFile,
  getGetProjectQueryKey,
  getListProjectMessagesQueryKey,
  getListProjectFilesQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, User, Mail, Calendar, AlertCircle, File, Send, Upload } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function ProjectDetail() {
  const params = useParams();
  const id = Number(params.id);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: project, isLoading: loadingProject } = useGetProject(id, { query: { enabled: !!id } });
  const { data: messages, isLoading: loadingMessages } = useListProjectMessages(id, { query: { enabled: !!id } });
  const { data: files, isLoading: loadingFiles } = useListProjectFiles(id, { query: { enabled: !!id } });
  
  const updateProject = useUpdateProject();
  const createMessage = useCreateProjectMessage();
  const addFile = useAddProjectFile();

  const [messageContent, setMessageContent] = useState("");
  const [role, setRole] = useState<"designer" | "client">("designer"); // Mock user role toggle
  
  // File upload state (mock)
  const [isUploading, setIsUploading] = useState(false);

  if (loadingProject) {
    return <div className="p-8"><Skeleton className="h-64 w-full" /></div>;
  }

  if (!project) {
    return <div className="p-8">Project not found.</div>;
  }

  const handleStatusChange = (newStatus: any) => {
    updateProject.mutate({ id, data: { status: newStatus } }, {
      onSuccess: () => {
        toast({ title: "Status updated" });
        queryClient.invalidateQueries({ queryKey: getGetProjectQueryKey(id) });
      }
    });
  };

  const handleSendMessage = () => {
    if (!messageContent.trim()) return;
    
    createMessage.mutate({
      data: {
        projectId: id,
        author: role === "designer" ? "Designer (You)" : project.clientName,
        role: role,
        content: messageContent
      }
    }, {
      onSuccess: () => {
        setMessageContent("");
        queryClient.invalidateQueries({ queryKey: getListProjectMessagesQueryKey(id) });
      }
    });
  };

  const handleFileUpload = () => {
    setIsUploading(true);
    // Simulate upload delay
    setTimeout(() => {
      addFile.mutate({
        data: {
          projectId: id,
          fileName: `mock-file-${Math.floor(Math.random()*1000)}.pdf`,
          fileUrl: "https://example.com/mock-file.pdf",
          fileSize: Math.floor(Math.random() * 5000000) + 100000,
          mimeType: "application/pdf",
          uploadedBy: role === "designer" ? "Designer" : project.clientName
        }
      }, {
        onSuccess: () => {
          setIsUploading(false);
          toast({ title: "File uploaded successfully" });
          queryClient.invalidateQueries({ queryKey: getListProjectFilesQueryKey(id) });
        }
      });
    }, 1000);
  };

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500",
    in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500",
    review: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-500",
    completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500",
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 flex flex-col h-[calc(100vh-2rem)]">
      <div className="shrink-0">
        <Link href="/projects" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif tracking-tight text-foreground">{project.title}</h1>
            <p className="text-muted-foreground mt-1">{project.clientName}</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={project.status} onValueChange={handleStatusChange} disabled={updateProject.isPending}>
              <SelectTrigger className={cn("w-[140px] border-0 h-9 font-medium tracking-wide uppercase text-xs", statusColors[project.status])}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="review">Review</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 overflow-hidden">
        {/* Left Column: Details & Files */}
        <div className="space-y-6 overflow-y-auto pr-2">
          <Card className="border-border/50 shadow-sm">
            <CardContent className="p-5 space-y-5">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wider">Description</h3>
                <p className="text-sm text-foreground whitespace-pre-wrap">{project.description || "No description provided."}</p>
              </div>

              <div className="space-y-3 pt-4 border-t border-border/50">
                {project.clientEmail && (
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <a href={`mailto:${project.clientEmail}`} className="hover:underline text-foreground">{project.clientEmail}</a>
                  </div>
                )}
                {project.dueDate && (
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground">{format(new Date(project.dueDate), 'MMMM d, yyyy')}</span>
                  </div>
                )}
                {project.priority && (
                  <div className="flex items-center gap-3 text-sm">
                    <AlertCircle className="w-4 h-4 text-muted-foreground" />
                    <span className="capitalize text-foreground">{project.priority} Priority</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between border-b border-border/50">
              <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Files</CardTitle>
              <Button size="sm" variant="ghost" className="h-8 gap-2" onClick={handleFileUpload} disabled={isUploading}>
                <Upload className="w-3.5 h-3.5" />
                {isUploading ? "Uploading..." : "Upload"}
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {loadingFiles ? (
                <div className="p-4"><Skeleton className="h-10 w-full" /></div>
              ) : files && files.length > 0 ? (
                <div className="divide-y divide-border/50">
                  {files.map(file => (
                    <div key={file.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors group">
                      <div className="flex items-center gap-3 min-w-0">
                        <File className="w-8 h-8 text-primary/40 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{file.fileName}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {file.fileSize ? `${(file.fileSize / 1024 / 1024).toFixed(2)} MB` : 'Unknown size'} &middot; {format(new Date(file.uploadedAt), 'MMM d')}
                          </p>
                        </div>
                      </div>
                      <a href={file.fileUrl} target="_blank" rel="noreferrer" className="text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        Download
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  No files uploaded yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Messages */}
        <div className="lg:col-span-2 flex flex-col h-full overflow-hidden">
          <Card className="border-border/50 shadow-sm flex-1 flex flex-col overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/50 shrink-0 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Messages</CardTitle>
              {/* Dev toggle to simulate sending as client or designer */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Simulate as:</span>
                <Select value={role} onValueChange={(val: any) => setRole(val)}>
                  <SelectTrigger className="h-7 w-[100px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="designer">Designer</SelectItem>
                    <SelectItem value="client">Client</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {loadingMessages ? (
                  <div className="space-y-4">
                    <Skeleton className="h-16 w-3/4" />
                    <Skeleton className="h-16 w-3/4 ml-auto" />
                  </div>
                ) : messages && messages.length > 0 ? (
                  messages.map(msg => {
                    const isDesigner = msg.role === "designer";
                    return (
                      <div key={msg.id} className={cn("flex flex-col max-w-[85%]", isDesigner ? "ml-auto items-end" : "mr-auto items-start")}>
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="text-xs font-medium text-foreground">{msg.author}</span>
                          <span className="text-[10px] text-muted-foreground">{format(new Date(msg.createdAt), 'h:mm a')}</span>
                        </div>
                        <div className={cn(
                          "px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap shadow-sm",
                          isDesigner 
                            ? "bg-primary text-primary-foreground rounded-tr-sm" 
                            : "bg-secondary text-secondary-foreground rounded-tl-sm"
                        )}>
                          {msg.content}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                    No messages yet. Send a message to start the conversation.
                  </div>
                )}
              </div>
              <div className="p-4 border-t border-border/50 shrink-0 bg-card">
                <div className="flex gap-2">
                  <Textarea 
                    placeholder="Type a message..." 
                    className="min-h-[60px] resize-none"
                    value={messageContent}
                    onChange={e => setMessageContent(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button 
                    className="shrink-0 self-end h-[60px] w-[60px]" 
                    onClick={handleSendMessage}
                    disabled={!messageContent.trim() || createMessage.isPending}
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
