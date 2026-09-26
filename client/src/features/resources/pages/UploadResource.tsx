/*
 * RELIVO — Upload Resource (Eco-Tech Glasshouse · low animation, usability-first)
 * Form: title, category, description, quantity, condition, location, image.
 * Subtle entrance, drop-zone styling, success feedback toast.
 */
import { useState } from "react";
import { useLocation } from "wouter";
import { UploadCloud, CheckCircle2, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import RoleGate, { AnySession } from "@/components/role-gating/RoleGate";
import { CATEGORIES, CONDITIONS } from "@/lib/mockData";

export default function UploadResource() {
  const [, navigate] = useLocation();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("");
  const [condition, setCondition] = useState<string>("");
  const [location, setLocation] = useState("");
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !category || !quantity || !condition || !location.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      setSubmitted(true);
      toast.success("Resource uploaded! It's now visible to recipients on the network.");
    }, 700);
  };

  return (
    <RoleGate allowedRoles={["donor", "admin"]}>
      <AnySession>
        <DashboardLayout title="Upload a Resource">
          <div className="mx-auto max-w-2xl">
            <div className="rise-in rounded-2xl border border-border bg-white p-7 shadow-sm sm:p-9">
              {submitted ? (
                <div className="flex flex-col items-center py-10 text-center">
                  <span className="inline-flex rounded-full bg-emerald-50 p-4 text-emerald-600">
                    <CheckCircle2 className="h-10 w-10" />
                  </span>
                  <h2 className="mt-4 font-display text-2xl font-bold">Resource listed on the network</h2>
                  <p className="mt-2 max-w-md text-sm text-muted-foreground">
                    Your donation of "{title}" is now available. Recipients can browse, request, and the AI engine will begin evaluating matches.
                  </p>
                  <div className="mt-6 flex gap-3">
                    <Button onClick={() => navigate("/donor")} className="rounded-lg transition-transform active:scale-[0.97]">Go to Dashboard</Button>
                    <Button variant="outline" className="rounded-lg" onClick={() => navigate("/browse")}>Browse Resources</Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={submit} className="space-y-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="title">Resource title *</Label>
                    <Input id="title" placeholder="e.g. Refurbished Laptops" value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-lg bg-background" />
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label>Category *</Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="rounded-lg bg-background">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.filter((c) => c !== "All").map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="qty">Quantity *</Label>
                      <Input id="qty" type="number" min={1} placeholder="e.g. 20" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="rounded-lg bg-background" />
                    </div>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label>Condition *</Label>
                      <Select value={condition} onValueChange={setCondition}>
                        <SelectTrigger className="rounded-lg bg-background">
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                        <SelectContent>
                          {CONDITIONS.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="location">Location *</Label>
                      <Input id="location" placeholder="e.g. Koramangala, Bangalore" value={location} onChange={(e) => setLocation(e.target.value)} className="rounded-lg bg-background" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="desc">Description</Label>
                    <Textarea id="desc" rows={4} placeholder="Describe the resource — what's included, what condition, who it would suit best…" value={description} onChange={(e) => setDescription(e.target.value)} className="rounded-lg bg-background" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Image (optional)</Label>
                    <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-secondary/40 px-6 py-10 text-center transition-colors hover:border-primary/40 hover:bg-secondary/70">
                      <UploadCloud className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm font-medium text-muted-foreground">Click or drag to upload a photo</p>
                      <p className="text-xs text-muted-foreground/70">PNG, JPG up to 5 MB</p>
                      <input type="file" accept="image/*" className="sr-only" />
                    </label>
                  </div>
                  <Button type="submit" size="lg" className="w-full rounded-lg transition-transform active:scale-[0.97]" disabled={busy}>
                    {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {busy ? "Uploading…" : "Upload Resource"}
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">
                    After upload, your resource enters the AI evaluation queue — recommendations are generated as recipients request it.
                  </p>
                </form>
              )}
            </div>
          </div>
        </DashboardLayout>
      </AnySession>
    </RoleGate>
  );
}
