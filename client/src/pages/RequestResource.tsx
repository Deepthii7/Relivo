/*
 * RELIVO — Request Resource (Eco-Tech Glasshouse · low/medium animation)
 * 3-step flow: selected resource → quantity & requirements → submit & status.
 * Subtle step transitions, clear progress indicator.
 */
import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { CheckCircle2, Loader2, ShieldCheck, Clock3, ListOrdered } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { StatusBadge, ResourceImage } from "@/components/primitives";
import { RESOURCES } from "@/lib/mockData";
import RoleGate, { AnySession } from "@/components/RoleGate";
import NotFound from "@/pages/NotFound";

const STEPS = ["Resource", "Details", "Confirmation"];

export default function RequestResource() {
  const params = useParams<{ id: string }>();
  const resource = RESOURCES.find((r) => String(r.id) === params.id);
  const [, navigate] = useLocation();
  const [step, setStep] = useState(0);
  const [quantity, setQuantity] = useState("1");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!resource) return <NotFound />;

  const next = () => {
    if (step === 0) { setStep(1); return; }
    if (step === 1) {
      if (!quantity || Number(quantity) < 1 || Number(quantity) > resource.quantity) {
        toast.error(`Enter a quantity between 1 and ${resource.quantity}.`);
        return;
      }
      if (!reason.trim() || reason.trim().length < 10) {
        toast.error("Please describe your requirement (at least 10 characters).");
        return;
      }
      setBusy(true);
      setTimeout(() => {
        setBusy(false);
        setSubmitted(true);
        setStep(2);
        toast.success("Request submitted! It's now in the priority queue for evaluation.");
      }, 900);
    }
  };

  return (
    <RoleGate allowedRoles={["recipient", "admin"]}>
      <AnySession>
        <DashboardLayout title="Request a Resource">
          <div className="mx-auto max-w-2xl">
            {/* Stepper */}
            <div className="mb-8 flex items-center gap-2">
              {STEPS.map((s, i) => (
                <div key={s} className="flex flex-1 items-center gap-2">
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-display text-sm font-bold transition-colors ${
                    i <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}>
                    {i < step ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                  </span>
                  <span className={`text-sm font-medium ${i <= step ? "text-foreground" : "text-muted-foreground"}`}>{s}</span>
                  {i < STEPS.length - 1 && <div className={`h-px flex-1 ${i < step ? "bg-primary" : "bg-border"}`} />}
                </div>
              ))}
            </div>

            <div className="rise-in rounded-2xl border border-border bg-white p-7 shadow-sm sm:p-9" key={step}>
              {step === 0 && (
                <div>
                  <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Selected Resource</p>
                  <div className="mt-4 flex gap-4">
                    <ResourceImage src={resource.imageUrl} alt={resource.title} className="h-28 w-36 shrink-0 rounded-xl" />
                    <div>
                      <h2 className="font-display text-xl font-bold">{resource.title}</h2>
                      <p className="mt-1 text-sm text-muted-foreground">{resource.category} · {resource.condition}</p>
                      <p className="mt-2 text-sm text-muted-foreground">{resource.description}</p>
                      <div className="mt-3 flex gap-2">
                        <StatusBadge status={resource.status} />
                        <span className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground">×{resource.quantity} available</span>
                      </div>
                    </div>
                  </div>
                  <Button onClick={next} className="mt-6 w-full rounded-lg transition-transform active:scale-[0.97]">Continue</Button>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="qty">Quantity required *</Label>
                    <Input id="qty" type="number" min={1} max={resource.quantity} value={quantity} onChange={(e) => setQuantity(e.target.value)} className="rounded-lg bg-background" />
                    <p className="text-xs text-muted-foreground">Up to {resource.quantity} available. The system will allocate without exceeding inventory.</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="reason">Requirement / reason *</Label>
                    <Textarea id="reason" rows={4} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Tell the donor why your organization needs this and how it will be used…" className="rounded-lg bg-background" />
                  </div>
                  <div className="rounded-xl bg-secondary/50 p-4 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">How your request is handled</p>
                    <ul className="mt-2 space-y-1.5">
                      <li className="flex gap-2"><ListOrdered className="mt-0.5 h-4 w-4 shrink-0 text-primary" />Added to the priority queue with an AI-generated priority score.</li>
                      <li className="flex gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />Synchronized allocation — concurrent requests never double-assign the same items.</li>
                      <li className="flex gap-2"><Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />Reservations time out if unconfirmed, releasing resources (deadlock prevention).</li>
                    </ul>
                  </div>
                  <Button onClick={next} disabled={busy} className="w-full rounded-lg transition-transform active:scale-[0.97]">
                    {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {busy ? "Submitting…" : "Submit Request"}
                  </Button>
                </div>
              )}

              {step === 2 && submitted && (
                <div className="flex flex-col items-center py-6 text-center">
                  <span className="inline-flex rounded-full bg-emerald-50 p-4 text-emerald-600">
                    <CheckCircle2 className="h-10 w-10" />
                  </span>
                  <h2 className="mt-4 font-display text-2xl font-bold">Request submitted</h2>
                  <p className="mt-2 max-w-md text-sm text-muted-foreground">
                    Your request for <strong className="text-foreground">×{quantity} {resource.title}</strong> is now pending. You'll see its status in your dashboard and notifications.
                  </p>
                  <div className="mt-5 rounded-xl border border-border bg-secondary/40 px-5 py-3 text-sm">
                    Current status: <StatusBadge status="Pending" className="ml-1.5" />
                  </div>
                  <div className="mt-6 flex gap-3">
                    <Button onClick={() => navigate("/recipient")} className="rounded-lg transition-transform active:scale-[0.97]">My Dashboard</Button>
                    <Button variant="outline" className="rounded-lg" onClick={() => navigate("/browse")}>Browse More</Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DashboardLayout>
      </AnySession>
    </RoleGate>
  );
}
