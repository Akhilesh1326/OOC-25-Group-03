import {Badge}  from "../components/ui/Badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import {Link} from "react-router-dom"
import { FileText, CheckCircle2, AlertTriangle, Calendar, Clock, ArrowRight } from "lucide-react"

export default function DashboardPage() {
  // Mock data - in a real implementation, this would come from your backend
  const recentRFPs = [
    {
      id: "1",
      title: "IT Systems Modernization Project",
      agency: "Department of Health and Human Services",
      dueDate: "May 15, 2023",
      status: "Eligible",
      progress: 65,
    },
    {
      id: "2",
      title: "Cloud Migration Services",
      agency: "Department of Defense",
      dueDate: "June 3, 2023",
      status: "Not Eligible",
      progress: 100,
    },
    {
      id: "3",
      title: "Cybersecurity Enhancement Program",
      agency: "Department of Homeland Security",
      dueDate: "May 28, 2023",
      status: "Eligible",
      progress: 40,
    },
  ]

  const upcomingDeadlines = [
    {
      id: "1",
      title: "Technical Proposal Submission",
      rfp: "IT Systems Modernization Project",
      deadline: "May 15, 2023",
      daysLeft: 12,
    },
    {
      id: "3",
      title: "Questions Submission Deadline",
      rfp: "Cybersecurity Enhancement Program",
      deadline: "May 10, 2023",
      daysLeft: 7,
    },
    {
      id: "1",
      title: "Bidder Conference",
      rfp: "IT Systems Modernization Project",
      deadline: "Apr 20, 2023",
      daysLeft: 3,
    },
  ]

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">RFP Analysis Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="p-4 bg-green-100 dark:bg-green-900/20 rounded-full">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="mt-3 text-2xl font-bold">3</h3>
              <p className="text-sm text-muted-foreground">Active RFPs</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="p-4 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                <CheckCircle2 className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="mt-3 text-2xl font-bold">2</h3>
              <p className="text-sm text-muted-foreground">Eligible Opportunities</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="p-4 bg-amber-100 dark:bg-amber-900/20 rounded-full">
                <Calendar className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="mt-3 text-2xl font-bold">3</h3>
              <p className="text-sm text-muted-foreground">Upcoming Deadlines</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Recent RFP Analysis</CardTitle>
            <CardDescription>Summary of recent RFP opportunities and analysis results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {recentRFPs.map((rfp) => (
                <Card key={rfp.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div
                        className={`w-2 md:w-1.5 md:h-auto flex-shrink-0 ${
                          rfp.status === "Eligible" ? "bg-green-600" : "bg-red-600"
                        }`}
                      ></div>
                      <div className="p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 w-full">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{rfp.title}</h3>
                            <Badge className={rfp.status === "Eligible" ? "bg-green-600" : "bg-red-600"}>
                              {rfp.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">{rfp.agency}</p>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            <span>Due: {rfp.dueDate}</span>
                          </div>
                        </div>
                        <Button asChild>
                          <Link to={`/analysis/${rfp.id}`}>
                            View Analysis
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
            <CardDescription>Critical dates for active RFP opportunities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingDeadlines.map((deadline, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <div
                    className={`h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                      deadline.daysLeft <= 3
                        ? "bg-red-100 dark:bg-red-900/20"
                        : deadline.daysLeft <= 7
                          ? "bg-amber-100 dark:bg-amber-900/20"
                          : "bg-green-100 dark:bg-green-900/20"
                    }`}
                  >
                    <span
                      className={`text-sm font-medium ${
                        deadline.daysLeft <= 3
                          ? "text-red-600"
                          : deadline.daysLeft <= 7
                            ? "text-amber-600"
                            : "text-green-600"
                      }`}
                    >
                      {deadline.daysLeft}d
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{deadline.title}</p>
                    <p className="text-sm text-muted-foreground">{deadline.rfp}</p>
                    <p className="text-xs text-muted-foreground">Due: {deadline.deadline}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions Needed</CardTitle>
            <CardDescription>Required next steps for active opportunities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="h-9 w-9 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="font-medium">Address SLA Capability Gap</p>
                  <p className="text-sm text-muted-foreground">IT Systems Modernization Project</p>
                  <p className="text-xs text-muted-foreground">High Priority</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="h-9 w-9 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium">Complete Requirements Matrix</p>
                  <p className="text-sm text-muted-foreground">Cybersecurity Enhancement Program</p>
                  <p className="text-xs text-muted-foreground">Medium Priority</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="h-9 w-9 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium">Prepare Contract Negotiation Points</p>
                  <p className="text-sm text-muted-foreground">IT Systems Modernization Project</p>
                  <p className="text-xs text-muted-foreground">Medium Priority</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

