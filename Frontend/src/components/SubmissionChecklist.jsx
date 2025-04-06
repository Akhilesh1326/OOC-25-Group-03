import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "./ui/Card"
import { CheckCircle, Circle, FileCheck } from "lucide-react"
import { Button } from "./ui/Button"
import { Progress } from "./ui/Progress"
import axios from "axios"

export function SubmissionChecklist() {
  const [checklist, setChecklist] = useState([])

  useEffect(() => {
    const fetchChecklist = async () => {
      try {
        const res = await axios.get("/api/submission-checklist")
        if (Array.isArray(res.data.checklist)) {
          setChecklist(res.data.checklist)
          console.log(res.data.checklist)
        } else {
          console.error("Invalid checklist structure:", res.data)
        }
      } catch (err) {
        console.error("Error fetching checklist", err)
      }
    }

    fetchChecklist()
  }, [])

  const totalItems = checklist.reduce(
    (acc, category) => acc + Object.values(category.items || {}).length,
    0
  )

  const completedItems = checklist.reduce((acc, category) => {
    const items = Object.values(category.items || {})
    return acc + items.filter((item) => item.completed).length
  }, 0)

  const completionPercentage =
    totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100)

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileCheck className="h-5 w-5 mr-2" />
          Submission Checklist
        </CardTitle>
        <CardDescription>
          Document requirements and submission guidelines extracted from the RFP
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <h3 className="font-medium">Submission Readiness</h3>
            <span className="text-sm font-medium">
              {completionPercentage}% complete
            </span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2">
            {completedItems} of {totalItems} requirements completed
          </p>
        </div>

        <div className="space-y-6">
          {checklist.map((category) => (
            <div key={category.id}>
              <h3 className="font-medium mb-3">{category.category}</h3>
              <div className="space-y-2">
                {Object.values(category.items || {}).map((item) => (
                  <div
                  onChange={console.log(item.completed)}
                    key={item.id}
                    className={`flex items-start p-3 border rounded-md ${
                      item.completed
                        ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900"
                        : "bg-gray-50 dark:bg-gray-900"
                    }`}
                  >
                    {item.completed ? (
                      <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                    )}
                    <span className="text-sm">{item.description}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex gap-4">
          <Button>Export Checklist</Button>
          <Button variant="outline">Generate Template Documents</Button>
        </div>
      </CardContent>
    </Card>
  )
}
