import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";

export function DeleteAccountDialog() {
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [password, setPassword] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const deleteMutation = useMutation({
    mutationFn: async (data: { password: string }) => {
      const res = await fetch("/api/users/me", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Failed to delete account");
      }
      return json;
    },
    onSuccess: () => {
      toast({
        title: "Account deleted successfully",
        description: "Your account has been permanently deleted.",
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setConfirmation("");
    setPassword("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmation !== "DELETE") return;
    deleteMutation.mutate({ password });
  };

  const isConfirmed = confirmation === "DELETE";
  const canSubmit = isConfirmed && password.length > 0;

  return (
    <AlertDialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) resetForm();
      }}
    >
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="gap-2" data-testid="button-delete-account">
          <Trash2 className="h-4 w-4" />
          Delete Account
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="sm:max-w-[500px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete Your Account
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action is permanent and cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          {/* Warning box */}
          <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4">
            <h4 className="font-semibold text-destructive mb-2">What will be deleted:</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>Your account and profile information</li>
              <li>Your notification preferences</li>
              <li>Your saved comparisons</li>
            </ul>
            <h4 className="font-semibold text-destructive mt-4 mb-2">What will be preserved:</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>Your reviews (anonymized as "Former User")</li>
              <li>Brand claims will be released</li>
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Confirmation text */}
            <div className="space-y-2">
              <Label htmlFor="confirmation">
                Type <span className="font-mono font-bold text-destructive">DELETE</span> to confirm
              </Label>
              <Input
                id="confirmation"
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                placeholder="DELETE"
                className={isConfirmed ? "border-emerald-500 focus-visible:ring-emerald-500" : ""}
                data-testid="input-delete-confirmation"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="delete-password">Enter your password</Label>
              <Input
                id="delete-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                data-testid="input-delete-password"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={!canSubmit || deleteMutation.isPending}
                className="flex-1"
                data-testid="button-confirm-delete"
              >
                {deleteMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete My Account"
                )}
              </Button>
            </div>
          </form>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
