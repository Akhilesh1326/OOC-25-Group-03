import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import {Link} from "react-router-dom"
import { ArrowLeft, FileText, CheckCircle2, AlertTriangle, Brain } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center mb-8">
        <Button variant="outline" size="sm" asChild className="mr-4">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">About RFP Analysis Automation</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Our Solution</CardTitle>
            <CardDescription>Streamlining the RFP review process with AI</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Our RFP Analysis Automation system uses cutting-edge AI technologies to transform how companies respond to
              government contract opportunities. By automating the tedious and error-prone manual review process, we
              help you:
            </p>
            <ul className="space-y-2 mb-4">
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                <span>Quickly determine eligibility to avoid wasting resources on unwinnable bids</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                <span>Extract and organize all requirements to ensure complete compliance</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                <span>Generate comprehensive submission checklists to prevent missing items</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                <span>Identify contract risks and suggest mitigation strategies</span>
              </li>
            </ul>
            <p>
              Our system reduces the time spent on RFP analysis by up to 80%, allowing your team to focus on crafting
              winning proposals rather than parsing complex documents.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Technology</CardTitle>
            <CardDescription>Powered by advanced AI and RAG systems</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center mr-3 flex-shrink-0">
                  <Brain className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Generative AI</h3>
                  <p className="text-sm text-muted-foreground">
                    Our system uses state-of-the-art large language models to understand complex RFP documents and
                    generate actionable insights.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mr-3 flex-shrink-0">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Retrieval-Augmented Generation (RAG)</h3>
                  <p className="text-sm text-muted-foreground">
                    We combine the power of generative AI with a knowledge base of government contracting regulations
                    and your company's capabilities.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mr-3 flex-shrink-0">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Agentic Workflows</h3>
                  <p className="text-sm text-muted-foreground">
                    Autonomous AI agents work together to analyze different aspects of RFPs, from eligibility to risk
                    assessment.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center mr-3 flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Risk Analysis</h3>
                  <p className="text-sm text-muted-foreground">
                    Advanced pattern recognition identifies potentially problematic contract clauses and suggests
                    mitigation strategies.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
          <CardDescription>The RFP analysis process simplified</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="border rounded-lg p-4 text-center">
              <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
                <span className="text-lg font-bold">1</span>
              </div>
              <h3 className="font-medium mb-2">Upload</h3>
              <p className="text-sm text-muted-foreground">Upload your RFP document in PDF or Word format</p>
            </div>

            <div className="border rounded-lg p-4 text-center">
              <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
                <span className="text-lg font-bold">2</span>
              </div>
              <h3 className="font-medium mb-2">Process</h3>
              <p className="text-sm text-muted-foreground">Our AI system analyzes the document content</p>
            </div>

            <div className="border rounded-lg p-4 text-center">
              <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
                <span className="text-lg font-bold">3</span>
              </div>
              <h3 className="font-medium mb-2">Analyze</h3>
              <p className="text-sm text-muted-foreground">The system extracts requirements and identifies risks</p>
            </div>

            <div className="border rounded-lg p-4 text-center">
              <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
                <span className="text-lg font-bold">4</span>
              </div>
              <h3 className="font-medium mb-2">Act</h3>
              <p className="text-sm text-muted-foreground">Review insights and take action on recommendations</p>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <Button size="lg" asChild>
              <Link href="/">Try It Now</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

