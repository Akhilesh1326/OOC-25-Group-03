import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/Card";
import {
  FileSearch,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  ClipboardList,
} from "lucide-react";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";
import { ScrollArea } from "./ui/ScrollArea";
import axios from "axios";

export function RequirementsExtractor() {
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/requirements")
      .then((res) => {
        setRequirements(res.data.requirements);
        // console.log("Requirement data = ", res.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statusCounts = {
    fulfilled: requirements.filter((r) => r.status === "fulfilled").length,
    gap: requirements.filter((r) => r.status === "gap").length,
    total: requirements.length,
  };

  const priorityColor = {
    high: "bg-red-500 text-white",
    medium: "bg-yellow-500 text-black",
    low: "bg-green-500 text-white",
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileSearch className="h-5 w-5 mr-2" />
          Requirements Analysis
        </CardTitle>
        <CardDescription>
          AI-extracted requirements matched against ConsultAdd's capabilities
        </CardDescription>
      </CardHeader>

      <CardContent>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center p-4 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <CheckCircle2 className="text-green-600 mr-3" />
                <div>
                  <p className="text-sm text-muted-foreground">Fulfilled</p>
                  <p className="text-xl font-semibold">
                    {statusCounts.fulfilled}
                  </p>
                </div>
              </div>
              <div className="flex items-center p-4 bg-amber-100 dark:bg-amber-900/20 rounded-lg">
                <AlertCircle className="text-amber-600 mr-3" />
                <div>
                  <p className="text-sm text-muted-foreground">Gap</p>
                  <p className="text-xl font-semibold">{statusCounts.gap}</p>
                </div>
              </div>
              <div className="flex items-center p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <ClipboardList className="text-slate-600 mr-3" />
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-xl font-semibold">{statusCounts.total}</p>
                </div>
              </div>
            </div>

            <ScrollArea className="h-[400px] border rounded-lg p-4">
              <div className="space-y-4">
                {requirements.map((req) => (
                  <div key={req.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{req.requirement}</h3>
                      <div className="flex flex-col gap-1 items-end">
                        <Badge
                          className={
                            req.status === "fulfilled"
                              ? "bg-green-600"
                              : "bg-amber-500"
                          }
                        >
                          {req.status === "fulfilled" ? "Fulfilled" : "Gap"}
                        </Badge>
                        <Badge
                          className={`mt-1 ${priorityColor[req.priority.toLowerCase()]}`}
                        >
                          {req.priority.charAt(0).toUpperCase() +
                            req.priority.slice(1)}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      Category: {req.category} • Source: {req.section}
                    </div>

                    {req.status === "gap" && (
                      <div className="mt-3 bg-amber-50 dark:bg-amber-950/20 p-3 rounded-md flex items-start gap-2">
                        <Lightbulb className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium">Recommendation:</p>
                          <p>
                            {req.recommendation ||
                              "Consider addressing this capability gap."}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="mt-6 flex flex-wrap gap-4">
              <Button>Export Requirements</Button>
              <Button variant="outline">Generate Gap Analysis Report</Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
