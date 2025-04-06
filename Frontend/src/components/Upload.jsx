"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Upload, FileText, AlertCircle } from 'lucide-react';
import { Card, CardContent } from "./ui/Card";
import { Button } from "./ui/Button";
import { Progress } from "./ui/Progress";
import { useToast } from "../hooks/UseToast";
import axios from 'axios'

export function RFPUploader() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const { toast } = useToast();
  const router = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (
        selectedFile.type === "application/pdf" ||
        selectedFile.type === "application/msword" ||
        selectedFile.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        setFile(selectedFile);
        setUploadSuccess(false);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF or Word document",
          variant: "destructive",
        });
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setUploadSuccess(false);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 5;
      });
    }, 100);

    try {
      // Step 1: Clear Elasticsearch index
      await axios.delete("/api/clear-index");

      // Step 2: Upload file
      const formData = new FormData();
      formData.append("file", file);

      await axios.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setProgress(100);
      setUploadSuccess(true);

      toast({
        title: "Upload successful",
        description: "Your RFP document has been processed successfully",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error?.response?.data?.detail || error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      clearInterval(interval);
      setUploading(false);
    }
  };

  const goToAnalysis = () => {
    router("/analysis"); // no ID needed, because you only work with one doc in ES
  };

  return (
    <Card className="w-full mt-8">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center">
          <div
            className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-12 w-full cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition"
            onClick={() => document.getElementById("file-upload")?.click()}
          >
            {!file ? (
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-12 w-12 text-gray-400" />
                <h3 className="text-lg font-medium mt-2">Upload RFP Document</h3>
                <p className="text-sm text-muted-foreground">
                  Drag and drop your PDF or Word document here, or click to browse
                </p>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <FileText className="h-12 w-12 text-green-600" />
                <h3 className="text-lg font-medium mt-2">{file.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>

                {uploading ? (
                  <div className="w-full max-w-md">
                    <Progress value={progress} className="h-2" />
                    <p className="text-xs text-center mt-2">{progress}% complete</p>
                  </div>
                ) : uploadSuccess ? (
                  <Button onClick={goToAnalysis} className="mt-2">
                    Go to Analysis
                  </Button>
                ) : (
                  <Button onClick={handleUpload} className="mt-2">
                    Analyze Document
                  </Button>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center mt-6 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4 mr-2" />
            <span>All uploaded documents are securely processed and analyzed</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
