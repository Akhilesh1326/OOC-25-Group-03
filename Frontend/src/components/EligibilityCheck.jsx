import { useEffect, useState } from "react";
import axios from "axios";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "./ui/Card";
import {
  CheckCircle2, XCircle, BadgeCheck
} from 'lucide-react';
import { Button } from "./ui/Button";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger
} from "./ui/Accordian";

export function EligibilityChecker() {
  const [criteria, setCriteria] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEligibility = async () => {
      try {
        const response = await axios.get("/api/eligibility"); // adjust ID if needed
        setCriteria(response.data.criteria);
        // console.log(response)
      } catch (error) {
        console.error("Error fetching eligibility data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEligibility();
  }, []);

  const allMet = criteria.every(c => c.status === "met");

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center">
          <BadgeCheck className="h-5 w-5 mr-2 text-green-600" />
          Eligibility Assessment
        </CardTitle>
        <CardDescription>
          Automated analysis of your eligibility to bid on this RFP
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!loading && criteria.length > 0 ? (
          <>
            <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg p-4 mb-6 flex items-center">
              <CheckCircle2 className="h-6 w-6 text-green-600 mr-3" />
              <div>
                <h3 className="text-lg font-medium">
                  {allMet
                    ? "You are eligible to bid on this RFP"
                    : "You are not fully eligible to bid"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {allMet
                    ? "All mandatory requirements are met or exceeded"
                    : "Some eligibility criteria are not met"}
                </p>
              </div>
            </div>

            <Accordion type="single" collapsible className="w-full">
              {criteria.map((item) => (
                <AccordionItem key={item.id} value={`item-${item.id}`}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center text-left">
                      {item.status === "met" ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0" />
                      )}
                      <span>{item.criterion}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pl-7 border-l-2 border-gray-200 dark:border-gray-700 ml-2 mt-2">
                      <div className="mb-2">
                        <span className="text-sm font-medium">Required:</span>
                        <span className="text-sm ml-2">{item.required}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Status:</span>
                        <span className="text-sm ml-2">{item.details}</span>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <div className="mt-6">
              <Button>Export Eligibility Report</Button>
            </div>
          </>
        ) : (
          <p>Loading eligibility data...</p>
        )}
      </CardContent>
    </Card>
  );
}
