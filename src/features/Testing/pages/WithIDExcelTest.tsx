import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  CheckCircle,
  ArrowLeft,
  FileCheck,
} from "lucide-react";

import { validateExcelData } from "../api";
import ProgressIndicator from "../components/ProgressIndicator";
import StepHeader from "../components/StepHeader";
import { useTaqeemAuth } from "../../../shared/context/TaqeemAuthContext";

const WithIDExcelTest: React.FC = () => {
  const navigate = useNavigate();

  // Step management - simplified to only report check
  const [currentStep, setCurrentStep] = useState<'report-id-check' | 'success'>('report-id-check');

  // Report ID state
  const [reportId, setReportId] = useState("");
  const [reportExists, setReportExists] = useState<boolean | null>(null);
  const [isCheckingReport, setIsCheckingReport] = useState(false);
  const { isLoggedIn } = useTaqeemAuth();

  // Error state
  const [error, setError] = useState("");

  // Step definitions for progress indicator - simplified
  const steps = [
    { step: 'report-id-check', label: 'Report ID Check', icon: Search },
    { step: 'success', label: 'Success', icon: CheckCircle }
  ];

  // Step 1: Check Report ID
  const handleCheckReport = async () => {
    if (!reportId.trim()) {
      setError("Please enter a report ID");
      return;
    }

    setIsCheckingReport(true);
    setError("");
    setReportExists(null);

    try {
      const result = await validateExcelData(reportId, {});
      console.log("Report ID check result:", result);

      // Check the status in the data object
      if (result.data?.status === 'NOT_FOUND') {
        setReportExists(false);
        setError("Report with this ID does not exist. Please check the ID and try again.");
      } else if (result.data?.status === 'SUCCESS') {
        setReportExists(true);
        setError("");
        setCurrentStep('success');
      } else if (result.data?.status === 'MACROS_EXIST') {
        setReportExists(false);
        setError(`Report Exist with  ${result.data?.assetsExact} macros. Please use a different report ID.`);
      } else {
        // Handle unexpected status values
        setReportExists(false);
        setError("Unexpected response from server. Please try again.");
      }
    } catch (err: any) {
      console.error("Error checking report:", err);

      // ✅ Gracefully handle 400 responses
      if (err?.response?.status === 400 || err?.status === 400) {
        setReportExists(false);
        setError("Report with this ID does not exist. Please check the ID and try again.");
      } else {
        setReportExists(false);
        setError(err.message || "Error checking report ID. Please try again.");
      }
    } finally {
      setIsCheckingReport(false);
    }
  };

  // Reset process
  const resetProcess = () => {
    setCurrentStep('report-id-check');
    setReportId("");
    setReportExists(null);
    setError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4 mx-auto transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">🔍 Report ID Verification</h1>
          <p className="text-gray-600">Check if a report ID exists in the system</p>
        </div>

        {/* Progress Indicator */}
        <ProgressIndicator currentStep={currentStep} steps={steps} />

        {/* Main Content Area */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          {/* Step 1: Report ID Check */}
          {currentStep === 'report-id-check' && (
            <div className="space-y-6">
              <StepHeader
                icon={Search}
                title="Check Report ID"
                description="Enter the report ID to verify it exists in the system"
                iconColor="text-blue-500"
              />

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Report ID *
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={reportId}
                      onChange={(e) => {
                        setReportId(e.target.value);
                        setReportExists(null); // Reset existence check when ID changes
                        setError("");
                      }}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter existing report ID"
                    />
                    <button
                      onClick={handleCheckReport}
                      disabled={!reportId.trim() || isCheckingReport || !isLoggedIn}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-semibold flex items-center gap-2 transition-colors"
                    >
                      {isCheckingReport ? "Checking..." : "Check Report"}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the report ID to verify it exists in the system
                  </p>
                </div>

                {/* Report Existence Status */}
                {reportExists === true && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="font-medium text-green-800">Report Found</p>
                        <p className="text-sm text-green-600">
                          Report ID <strong>{reportId}</strong> exists in the system.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {reportExists === false && !error && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <FileCheck className="w-5 h-5 text-yellow-500" />
                      <div>
                        <p className="font-medium text-yellow-800">Report Not Found</p>
                        <p className="text-sm text-yellow-600">
                          Please check the report ID and try again.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <FileCheck className="w-5 h-5 text-red-500" />
                      <span className="text-red-700">{error}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Information Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-sm">ℹ️</span>
                  </div>
                  <div>
                    <p className="font-medium text-blue-800 mb-1">About This Page</p>
                    <p className="text-sm text-blue-600">
                      This page is dedicated to verifying report IDs in the system.
                      It only checks whether a report exists and does not handle file uploads or data processing.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Success */}
          {currentStep === 'success' && (
            <div className="space-y-6">
              <StepHeader
                icon={CheckCircle}
                title="Report Verified Successfully!"
                description="The report ID has been verified and exists in the system"
                iconColor="text-green-500"
              />

              <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-green-800 mb-2">Report Verified!</h3>
                <p className="text-green-600 mb-2">Report ID: <strong>{reportId}</strong></p>
                <p className="text-green-600 mb-4">
                  The report has been successfully verified and exists in the system.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => navigate("/equipment/viewReports")}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    View Reports
                  </button>
                  <button
                    onClick={resetProcess}
                    className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg font-semibold transition-colors"
                  >
                    Check Another Report
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WithIDExcelTest;