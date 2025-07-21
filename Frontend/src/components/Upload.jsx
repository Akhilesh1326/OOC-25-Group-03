"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Upload, FileText, AlertCircle } from 'lucide-react';
import { Card, CardContent } from "./ui/Card";
import { Button } from "./ui/Button";
import { Progress } from "./ui/Progress";
import { useToast } from "../hooks/UseToast";
import axios from 'axios';

export function RFPUploader() {
  const [file, setFile] = useState(null);
  const [companyFile, setCompanyFile] = useState(null);

  const [uploadingRFP, setUploadingRFP] = useState(false);
  const [uploadingCompany, setUploadingCompany] = useState(false);

  const [progressRFP, setProgressRFP] = useState(0);
  const [progressCompany, setProgressCompany] = useState(0);

  const [uploadSuccessRFP, setUploadSuccessRFP] = useState(false);
  const [uploadSuccessCompany, setUploadSuccessCompany] = useState(false);

  const { toast } = useToast();
  const router = useNavigate();

  const handleFileChange = (e, type) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (
        selectedFile.type === "application/pdf" ||
        selectedFile.type === "application/msword" ||
        selectedFile.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        if (type === "rfp") {
          setFile(selectedFile);
          setUploadSuccessRFP(false);
        } else {
          setCompanyFile(selectedFile);
          setUploadSuccessCompany(false);
        }
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF or Word document",
          variant: "destructive",
        });
      }
    }
  };

  const simulateProgress = (setProgress, max = 95) => {
    return setInterval(() => {
      setProgress((prev) => {
        if (prev >= max) {
          clearInterval();
          return max;
        }
        return prev + 5;
      });
    }, 100);
  };

  const handleRFPUpload = async () => {
    if (!file) return;

    setUploadingRFP(true);
    setUploadSuccessRFP(false);
    setProgressRFP(0);

    const interval = simulateProgress(setProgressRFP);

    try {
      await axios.delete("/api/clear-index");

      const formData = new FormData();
      formData.append("file", file);

      await axios.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setProgressRFP(100);
      setUploadSuccessRFP(true);

      toast({
        title: "RFP Upload Successful",
        description: "RFP document processed successfully",
      });
    } catch (error) {
      toast({
        title: "RFP Upload failed",
        description: error?.response?.data?.detail || error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      clearInterval(interval);
      setUploadingRFP(false);
    }
  };

  const handleCompanyUpload = async () => {
    if (!companyFile) return;

    setUploadingCompany(true);
    setUploadSuccessCompany(false);
    setProgressCompany(0);

    const interval = simulateProgress(setProgressCompany);

    try {
      const formData = new FormData();
      formData.append("file", companyFile);

      await axios.post("/api/upload-company-data", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setProgressCompany(100);
      setUploadSuccessCompany(true);

      toast({
        title: "Company Data Upload Successful",
        description: "Company data uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Company Data Upload Failed",
        description: error?.response?.data?.detail || error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      clearInterval(interval);
      setUploadingCompany(false);
    }
  };

  const goToAnalysis = () => router("/analysis");

  return (
    <Card className="w-full mt-8">
      <CardContent className="pt-6">
        <div className="flex flex-col gap-10 items-center text-center">
          {/* RFP Upload */}
          <div
            className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-12 w-full cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition"
            onClick={() => document.getElementById("rfp-upload")?.click()}
          >
            {!file ? (
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-12 w-12 text-gray-400" />
                <h3 className="text-lg font-medium mt-2">Upload RFP Document</h3>
                <p className="text-sm text-muted-foreground">Click to upload your RFP (PDF/DOC/DOCX)</p>
                <input
                  id="rfp-upload"
                  type="file"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, "rfp")}
                  accept=".pdf,.doc,.docx"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <FileText className="h-12 w-12 text-green-600" />
                <h3 className="text-lg font-medium">{file.name}</h3>
                <p className="text-sm text-muted-foreground">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                {uploadingRFP ? (
                  <div className="w-full max-w-md">
                    <Progress value={progressRFP} className="h-2" />
                    <p className="text-xs text-center mt-2">{progressRFP}% complete</p>
                  </div>
                ) : uploadSuccessRFP ? (
                  <Button onClick={goToAnalysis} className="mt-2">Go to RFP Analysis</Button>
                ) : (
                  <Button onClick={handleRFPUpload} className="mt-2">Analyze RFP</Button>
                )}
              </div>
            )}
          </div>

          {/* Company Data Upload */}
          <div
            className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-12 w-full cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition"
            onClick={() => document.getElementById("company-upload")?.click()}
          >
            {!companyFile ? (
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-12 w-12 text-gray-400" />
                <h3 className="text-lg font-medium mt-2">Upload Company Data</h3>
                <p className="text-sm text-muted-foreground">Click to upload company info (PDF/DOC/DOCX)</p>
                <input
                  id="company-upload"
                  type="file"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, "company")}
                  accept=".pdf,.doc,.docx"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <FileText className="h-12 w-12 text-blue-600" />
                <h3 className="text-lg font-medium">{companyFile.name}</h3>
                <p className="text-sm text-muted-foreground">{(companyFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                {uploadingCompany ? (
                  <div className="w-full max-w-md">
                    <Progress value={progressCompany} className="h-2" />
                    <p className="text-xs text-center mt-2">{progressCompany}% complete</p>
                  </div>
                ) : uploadSuccessCompany ? (
                  <Button onClick={goToAnalysis} className="mt-2">Go to Company Analysis</Button>
                ) : (
                  <Button onClick={handleCompanyUpload} className="mt-2">Analyze Company Data</Button>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center mt-4 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4 mr-2" />
            <span>All uploaded documents are securely processed and analyzed</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
