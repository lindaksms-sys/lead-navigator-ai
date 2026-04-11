import { useDemoMode } from "@/contexts/DemoModeContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FlaskConical, RotateCcw, Trash2, Play } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function DemoModeControls() {
  const { isDemoMode, enableDemoMode, disableDemoMode, resetDemoData, seeding } = useDemoMode();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <FlaskConical className="w-4 h-4" /> Demo mode
            </CardTitle>
            <CardDescription className="mt-1">
              Explore the platform with realistic sample data
            </CardDescription>
          </div>
          {isDemoMode && (
            <Badge variant="outline" className="gap-1 border-primary/30 text-primary">
              <FlaskConical className="w-3 h-3" /> Active
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {!isDemoMode ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Load sample HVAC leads, calls, appointments, and events to see how the platform works before going live.
            </p>
            <Button onClick={enableDemoMode} disabled={seeding} className="gap-1.5">
              <Play className="w-3.5 h-3.5" />
              {seeding ? "Loading…" : "Enable demo mode"}
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5" disabled={seeding}>
                  <RotateCcw className="w-3.5 h-3.5" /> Reseed data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reseed demo data?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove existing demo records and load a fresh set of sample HVAC data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={async () => { await resetDemoData(); await enableDemoMode(); }}>
                    Reseed
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5 text-destructive hover:text-destructive" disabled={seeding}>
                  <Trash2 className="w-3.5 h-3.5" /> Clear &amp; exit
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear demo data?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove all sample records and exit demo mode. Your live data won't be affected.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={resetDemoData}>Clear data</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
