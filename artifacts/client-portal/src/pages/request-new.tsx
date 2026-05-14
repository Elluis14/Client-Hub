import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useCreateRequest, getListRequestsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

export default function RequestNew() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createRequest = useCreateRequest();

  const [formData, setFormData] = useState({
    title: "",
    clientName: "",
    clientEmail: "",
    description: "",
    requestType: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createRequest.mutate({ data: formData }, {
      onSuccess: (request) => {
        toast({ title: "Request submitted", description: "We will review your request shortly." });
        queryClient.invalidateQueries({ queryKey: getListRequestsQueryKey() });
        setLocation(`/requests/${request.id}`);
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to submit request.", variant: "destructive" });
      }
    });
  };

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8">
      <div>
        <Link href="/requests" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Requests
        </Link>
        <h1 className="text-3xl font-serif tracking-tight text-foreground">New Request</h1>
        <p className="text-muted-foreground mt-1">Submit a new design request.</p>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clientName">Your Name</Label>
                  <Input 
                    id="clientName" 
                    required 
                    value={formData.clientName} 
                    onChange={e => setFormData({ ...formData, clientName: e.target.value })} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientEmail">Your Email</Label>
                  <Input 
                    id="clientEmail" 
                    type="email" 
                    value={formData.clientEmail} 
                    onChange={e => setFormData({ ...formData, clientEmail: e.target.value })} 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Project Title / Summary</Label>
                <Input 
                  id="title" 
                  required 
                  value={formData.title} 
                  onChange={e => setFormData({ ...formData, title: e.target.value })} 
                />
              </div>

              <div className="space-y-2">
                <Label>Request Type</Label>
                <Select value={formData.requestType} onValueChange={(val) => setFormData({ ...formData, requestType: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="branding">Brand Identity</SelectItem>
                    <SelectItem value="web">Web Design</SelectItem>
                    <SelectItem value="print">Print & Packaging</SelectItem>
                    <SelectItem value="illustration">Illustration</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Detailed Description</Label>
                <Textarea 
                  id="description" 
                  required
                  rows={6}
                  placeholder="Tell us about the goals, timeline, and requirements..."
                  value={formData.description} 
                  onChange={e => setFormData({ ...formData, description: e.target.value })} 
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
              <Button type="button" variant="outline" onClick={() => setLocation("/requests")}>
                Cancel
              </Button>
              <Button type="submit" disabled={createRequest.isPending}>
                {createRequest.isPending ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
