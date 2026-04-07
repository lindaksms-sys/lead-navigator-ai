import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { BarChart3, Phone, Zap, Settings } from "lucide-react";

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center space-y-8 max-w-lg">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center">
            <Phone className="h-8 w-8 text-primary-foreground" />
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Lead Qualification System</h1>
          <p className="text-muted-foreground">AI-powered voice agent lead scoring & management for home services</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button size="lg" onClick={() => navigate("/leads")}>
            <BarChart3 className="h-4 w-4 mr-2" /> View Dashboard
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate("/leads/new")}>
            <Zap className="h-4 w-4 mr-2" /> New Lead
          </Button>
        </div>
      </div>
    </div>
  );
}
