import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom"; // ✅ fixed
import { Button } from "./ui/Button";

export function LandingHero() {
  return (
    <div className="py-12 md:py-20 text-center space-y-6">
      <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
        RFP Analysis <span className="text-green-600 dark:text-green-500">Automation</span>
      </h1>
      <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
        Streamline your RFP review process with AI-powered analysis. Upload government RFP documents to automatically
        verify eligibility, extract requirements, and identify contractual risks.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild size="lg">
          <Link to="/dashboard">
            View Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button variant="outline" size="lg" asChild>
          <Link to="/about">Learn More</Link>
        </Button>
      </div>
    </div>
  );
}
