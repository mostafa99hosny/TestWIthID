import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  FileCheck,
  CheckCircle,
  Save,
  FileText,
  RefreshCw,
  ArrowLeft,
  Download,
  Search
} from "lucide-react";

import { uploadAssetsToDB, validateExcelData } from "../api";
import {
  ValidationError,
  ValidationResults,
  validateIDExcelData
} from "../utils/validations";
import { readExcelFile, downloadCorrectedExcel } from "../utils/excelUtils";

import ProgressIndicator from "../components/ProgressIndicator";
import StepHeader from "../components/StepHeader";
import FileUpload from "../components/FileUpload";
import CheckResult from "../components/CheckResult";
import NavigationButtons from "../components/NavigationButtons";
import LoadingSpinner from "../components/LoadingSpinner";
import SuccessState from "../components/SuccessState";

const WithIDExcelTest: React.FC = () => {
  const navigate = useNavigate();

  // Step management - completely new flow
  const [currentStep, setCurrentStep] = useState<
    'report-id-check' | 'excel-upload' | 'excel-validation' | 'upload-to-db' | 'success'
  >('report-id-check');

  // Files & data
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [excelDataSheets, setExcelDataSheets] = useState<any[][][]>([]);
  const [reportId, setReportId] = useState("");
  const [reportExists, setReportExists] = useState<boolean | null>(null);
  const [isCheckingReport, setIsCheckingReport] = useState(false);

  // Validation state
  const [validationResults, setValidationResults] = useState<ValidationResults>({
    hasEmptyFields: false,
    hasFractionInFinalValue: false,
    hasInvalidPurposeId: false,
    hasInvalidValuePremiseId: false,
    hasMissingRequiredHeaders: false,
    isReportValueValid: true,
    totalErrors: 0
  });

  const [excelErrors, setExcelErrors] = useState<ValidationError[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  // Step definitions for progress indicator - updated order
  const steps = [
    { step: 'report-id-check', label: 'Report ID Check', icon: Search },
    { step: 'excel-upload', label: 'Excel Upload', icon: Upload },
    { step: 'excel-validation', label: 'Excel Validation', icon: FileCheck },
    { step: 'upload-to-db', label: 'Upload to DB', icon: Save },
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
    } else if (result.data?.status === 'MACROS_EXIST') {
      setReportExists(false);
      setError("Only works on reports with no macros. Please use a different report ID.");
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


  // Step 2: Excel File Upload
  const handleExcelUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      setExcelFile(files[0]);
      setError("");
      try {
        const sheetsData = await readExcelFile(files[0]);

        // Validate that we have exactly 2 sheets for ID test
        if (sheetsData.length !== 2) {
          setError("ID Excel test requires exactly 2 sheets. Please use the correct template.");
          return;
        }

        setExcelDataSheets(sheetsData);
        setCurrentStep('excel-validation');
      } catch (err) {
        console.error(err);
        setError("Error reading Excel file. Please make sure the file is valid.");
      }
    }
  };

  // Step 3: Validate Excel File - Using ID-specific validation
  const handleValidateExcel = async () => {
    if (!excelFile || !excelDataSheets.length) return;

    setIsValidating(true);

    setTimeout(() => {
      // Use ID-specific validation that expects only 2 sheets
      const { errors, results } = validateIDExcelData(excelDataSheets);

      setExcelErrors(errors);
      setValidationResults(results);
      setIsValidating(false);

      if (errors.length === 0) {
        setCurrentStep('upload-to-db');
      }
    }, 1500);
  };

  // Step 4: Upload to DB
  const handleUploadToDB = async () => {
    if (!excelFile || !reportId.trim()) return;

    try {
      setIsUploading(true);

      // Upload to DB
      const response = await uploadAssetsToDB(reportId, excelFile);
      console.log("Upload response:", response);

      if (response.data?.status === "SUCCESS") {
        setCurrentStep('success');
      } else {
        setError("Failed to save report. Please try again.");
      }

    } catch (error) {
      console.error("Error:", error);
      setError("Error during upload. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Download corrected file
  const handleDownloadCorrectedExcel = () => {
    downloadCorrectedExcel(excelDataSheets, excelErrors, "corrected_report.xlsx");
  };

  // Reset validation state
  const resetValidationState = () => {
    setExcelErrors([]);
    setValidationResults({
      hasEmptyFields: false,
      hasFractionInFinalValue: false,
      hasInvalidPurposeId: false,
      hasInvalidValuePremiseId: false,
      hasMissingRequiredHeaders: false,
      isReportValueValid: true,
      totalErrors: 0
    });
    setCurrentStep('excel-upload');
  };

  // Reset entire process
  const resetProcess = () => {
    setCurrentStep('report-id-check');
    setExcelFile(null);
    setExcelDataSheets([]);
    setExcelErrors([]);
    setReportId("");
    setReportExists(null);
    setError("");
  };

  // Download template
  const handleDownloadTemplate = () => {
    // This would download the ID.xlsx template file with 2 sheets
    window.open("/ID.xlsx", "_blank");
  };

  const isExcelValid = excelErrors.length === 0;

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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">📊 Equipment Report with ID</h1>
          <p className="text-gray-600">Upload and validate Excel reports with report ID (2 sheets required)</p>
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
                      disabled={!reportId.trim() || isCheckingReport}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-semibold flex items-center gap-2 transition-colors"
                    >
                      {isCheckingReport ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Search className="w-4 h-4" />
                      )}
                      {isCheckingReport ? "Checking..." : "Check Report"}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the report ID to verify it exists before proceeding
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
                          Report ID <strong>{reportId}</strong> exists. You can proceed to upload the Excel file.
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 text-center">
                      <button
                        onClick={() => setCurrentStep('excel-upload')}
                        className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
                      >
                        Continue to Excel Upload
                      </button>
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
            </div>
          )}

          {/* Step 2: Excel Upload */}
          {currentStep === 'excel-upload' && (
            <div className="space-y-6">
              <StepHeader
                icon={Upload}
                title="Upload Excel File"
                description="Upload your Excel file with 2 asset sheets for report validation"
                iconColor="text-blue-500"
              />

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="font-medium text-blue-800">Report ID: {reportId}</p>
                    <p className="text-sm text-blue-600">Upload the corresponding Excel file for this report</p>
                  </div>
                </div>
              </div>

              <div className="text-center mb-4">
                <button
                  onClick={handleDownloadTemplate}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download Template
                </button>
                <p className="text-xs text-gray-500 mt-2">Download the Excel template with 2 required sheets</p>
              </div>

              <FileUpload
                label="Excel File (2 sheets)"
                accept=".xlsx,.xls"
                onFileChange={handleExcelUpload}
                file={excelFile}
                description="Upload Excel file with 2 asset sheets"
              />

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <FileCheck className="w-5 h-5 text-red-500" />
                    <span className="text-red-700">{error}</span>
                  </div>
                </div>
              )}

              <NavigationButtons
                onBack={() => setCurrentStep('report-id-check')}
                onNext={() => excelFile && setCurrentStep('excel-validation')}
                nextLabel="Continue to Validation"
                backLabel="Back to Report Check"
                nextDisabled={!excelFile}
              />
            </div>
          )}

          {/* Step 3: Excel Validation */}
          {currentStep === 'excel-validation' && (
            <div className="space-y-6">
              <StepHeader
                icon={FileCheck}
                title="Validate Excel File"
                description="Check your 2-sheet Excel file for errors before uploading to database"
                iconColor="text-yellow-500"
              />

              {excelFile && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="font-medium text-blue-800">Current file</p>
                      <p className="text-sm text-blue-600">{excelFile.name}</p>
                      <p className="text-xs text-blue-500 mt-1">
                        Sheets: {excelDataSheets.length} (Sheet 1 & Sheet 2)
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Show validation button only when not validating and no results yet */}
              {!isValidating && excelErrors.length === 0 && (
                <div className="text-center space-y-4">
                  <button
                    onClick={handleValidateExcel}
                    disabled={!excelFile}
                    className="px-8 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-semibold flex items-center gap-2 mx-auto transition-colors"
                  >
                    <FileCheck className="w-4 h-4" />
                    Start Validation
                  </button>

                  <button
                    onClick={() => setCurrentStep('excel-upload')}
                    className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                  >
                    Upload Different File
                  </button>
                </div>
              )}

              {isValidating && (
                <LoadingSpinner message="Validating Excel file..." />
              )}

              {/* Validation Results */}
              {!isValidating && excelErrors.length > 0 && (
                <CheckResult
                  results={validationResults}
                  errorCount={excelErrors.length}
                  onDownloadCorrected={handleDownloadCorrectedExcel}
                  onUploadNew={resetValidationState}
                />
              )}

              {/* Success State */}
              {!isValidating && isExcelValid && excelErrors.length === 0 && validationResults.totalErrors === 0 && (
                <SuccessState
                  title="Validation Successful"
                  message="No errors found in your 2-sheet Excel file"
                  actionLabel="Continue to Upload"
                  onAction={() => setCurrentStep('upload-to-db')}
                />
              )}
            </div>
          )}

          {/* Step 4: Upload to DB */}
          {currentStep === 'upload-to-db' && (
            <div className="space-y-6">
              <StepHeader
                icon={Save}
                title="Upload to Database"
                description="Complete the process by uploading the validated report to the database"
                iconColor="text-green-500"
              />

              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium">Report ID:</span>
                  <span className="text-green-600 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    {reportId}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium">Excel File:</span>
                  <span className="text-green-600 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    {excelFile?.name}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="font-medium">Validation:</span>
                  <span className="text-green-600 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Passed (2 sheets)
                  </span>
                </div>
              </div>

              <NavigationButtons
                onBack={() => setCurrentStep('excel-validation')}
                onNext={handleUploadToDB}
                nextLabel={isUploading ? "Uploading..." : "Upload To Database"}
                backLabel="Back to Validation"
                nextDisabled={!excelFile || !reportId.trim() || isUploading}
                nextIcon={isUploading ? RefreshCw : Save}
              />

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <FileCheck className="w-5 h-5 text-red-500" />
                    <span className="text-red-700">{error}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 5: Success */}
          {currentStep === 'success' && (
            <div className="space-y-6">
              <StepHeader
                icon={CheckCircle}
                title="Success!"
                description="Your equipment report has been saved successfully"
                iconColor="text-green-500"
              />

              <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-green-800 mb-2">Report Saved Successfully!</h3>
                <p className="text-green-600 mb-2">Report ID: <strong>{reportId}</strong></p>
                <p className="text-green-600 mb-4">The equipment report with 2 asset sheets has been successfully processed and saved in the system.</p>

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
                    Start New Report
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