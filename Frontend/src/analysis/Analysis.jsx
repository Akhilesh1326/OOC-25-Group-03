import { useState } from "react"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/Tabs"
import { EligibilityChecker } from "../components/EligibilityCheck"
import { RequirementsExtractor } from "../components/RequirementList"
import { SubmissionChecklist } from "../components/SubmissionChecklist"
import { RiskAnalyzer } from "../components/RiskAnalysis"
import { DocumentInfo } from "../components/DocumentInfo"

export default function AnalysisPage() {
  const [activeTab, setActiveTab] = useState("eligibility")

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-2">RFP Analysis Results</h1>

      <DocumentInfo />

      <Tabs defaultValue="eligibility" onValueChange={setActiveTab} className="mt-8">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="eligibility">Eligibility</TabsTrigger>
          <TabsTrigger value="requirements">Requirements</TabsTrigger>
          <TabsTrigger value="checklist">Submission Checklist</TabsTrigger>
          <TabsTrigger value="risks">Contract Risks</TabsTrigger>
        </TabsList>

        <TabsContent value="eligibility">
          {activeTab === "eligibility" && <EligibilityChecker />}
        </TabsContent>
        <TabsContent value="requirements">
          {activeTab === "requirements" && <RequirementsExtractor />}
        </TabsContent>
        <TabsContent value="checklist">
          {activeTab === "checklist" && <SubmissionChecklist />}
        </TabsContent>
        <TabsContent value="risks">
          {activeTab === "risks" && <RiskAnalyzer />}
        </TabsContent>
      </Tabs>
    </div>
  )
}
