import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/Card";
import { AlertTriangle, Shield, TrendingDown, AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from "./ui/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/Tabs";
import { useState, useEffect } from "react";
import axios from "axios";

export function RiskAnalyzer() {
  const [risks, setRisks] = useState([]);

  useEffect(() => {
    async function fetchRisks() {
      try {
        const res = await axios.get("/api/contract-risks");
        setRisks(res.data.risks || []);
        // console.log("Risk data = ", res.data.risks);
      } catch (err) {
        console.error("Failed to fetch risks", err);
      }
    }
    fetchRisks();
  }, []);

  const riskSeverityCounts = {
    high: risks.filter(r => r.severity === "high").length,
    medium: risks.filter(r => r.severity === "medium").length,
    low: risks.filter(r => r.severity === "low").length
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2" />
          Contract Risk Analysis
        </CardTitle>
        <CardDescription>
          AI-identified contract risks and recommended mitigation strategies
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="border-red-200 dark:border-red-900">
            <CardContent className="p-4 flex items-center">
              <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mr-3">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{riskSeverityCounts.high}</p>
                <p className="text-sm text-muted-foreground">High Severity Risks</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-amber-200 dark:border-amber-900">
            <CardContent className="p-4 flex items-center">
              <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center mr-3">
                <AlertCircle className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{riskSeverityCounts.medium}</p>
                <p className="text-sm text-muted-foreground">Medium Severity Risks</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-blue-200 dark:border-blue-900">
            <CardContent className="p-4 flex items-center">
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mr-3">
                <AlertCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{riskSeverityCounts.low}</p>
                <p className="text-sm text-muted-foreground">Low Severity Risks</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="high">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="high">High Risks</TabsTrigger>
            <TabsTrigger value="medium">Medium Risks</TabsTrigger>
            <TabsTrigger value="low">Low Risks</TabsTrigger>
          </TabsList>

          <TabsContent value="high">
            <div className="space-y-4">
              {risks.filter(risk => risk.severity === "high").map((risk) => (
                <Card key={risk.id} className="border-red-200 dark:border-red-900">
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-1">{risk.clause}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{risk.risk}</p>
                    <div className="bg-red-50 dark:bg-red-950/20 p-3 rounded-md flex gap-2">
                      <ArrowRight className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm"><span className="font-medium">Recommendation:</span> {risk.recommendation}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="medium">
            <div className="space-y-4">
              {risks.filter(risk => risk.severity === "medium").map((risk) => (
                <Card key={risk.id} className="border-amber-200 dark:border-amber-900">
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-1">{risk.clause}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{risk.risk}</p>
                    <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded-md flex gap-2">
                      <ArrowRight className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm"><span className="font-medium">Recommendation:</span> {risk.recommendation}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="low">
            <div className="space-y-4">
              {risks.filter(risk => risk.severity === "low").map((risk) => (
                <Card key={risk.id} className="border-blue-200 dark:border-blue-900">
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-1">{risk.clause}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{risk.risk}</p>
                    <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-md flex gap-2">
                      <ArrowRight className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm"><span className="font-medium">Recommendation:</span> {risk.recommendation}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex gap-4">
          <Button>Generate Risk Report</Button>
          <Button variant="outline">Prepare Contract Amendment Suggestions</Button>
        </div>
      </CardContent>
    </Card>
  );
}
