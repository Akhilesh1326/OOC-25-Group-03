import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/Card"
import { Badge } from "./ui/Badge"
import { FileText, Calendar, Building } from "lucide-react"

export function DocumentInfo() {
  // In a real app, this would come from your backend/database
  const rfpInfo = {
    title: "IT Systems Modernization Project",
    agency: "Department of Health and Human Services",
    issueDate: "April 2, 2023",
    dueDate: "May 15, 2023",
    contractValue: "$2.5M - $4M",
    duration: "24 months",
    status: "Eligible",
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl">{rfpInfo.title}</CardTitle>
            <CardDescription className="flex items-center mt-1">
              <Building className="h-4 w-4 mr-1" />
              {rfpInfo.agency}
            </CardDescription>
          </div>
          <Badge className={rfpInfo.status === "Eligible" ? "bg-green-600" : "bg-red-600"}>{rfpInfo.status}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Issue Date</p>
              <p className="text-sm text-muted-foreground">{rfpInfo.issueDate}</p>
            </div>
          </div>
          <div className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Due Date</p>
              <p className="text-sm text-muted-foreground">{rfpInfo.dueDate}</p>
            </div>
          </div>
          <div className="flex items-center">
            <FileText className="h-5 w-5 mr-2 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Contract Value</p>
              <p className="text-sm text-muted-foreground">{rfpInfo.contractValue}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

