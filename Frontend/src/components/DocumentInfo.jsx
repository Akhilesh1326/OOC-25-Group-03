import { useEffect, useState } from "react"
import axios from "axios"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/Card"
import { Badge } from "./ui/Badge"
import { FileText, Calendar, Building } from "lucide-react"

export function DocumentInfo() {
  const [rfpInfo, setRfpInfo] = useState(null)

  useEffect(() => {
      const fetchInfo = async()=>{
        try {
          const res = await axios.get("/api/rfp-info");
          setRfpInfo(res.data);
        } catch (error) {
          console.error("Failed to fetch RFP info:", error)
        }
      }
      fetchInfo();
  }, [])

  if (!rfpInfo) return <div>Loading...</div>

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
