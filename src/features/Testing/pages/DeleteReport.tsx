import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    CheckCircle,
    ArrowLeft,
    FileText,
    RefreshCw,
    Trash2,
    AlertTriangle
} from "lucide-react";

import { deleteReport } from "../api";
import ProgressIndicator from "../components/ProgressIndicator";
import StepHeader from "../components/StepHeader";
import NavigationButtons from "../components/NavigationButtons";
import { useTaqeemAuth } from "../../../shared/context/TaqeemAuthContext";

const DeleteReport: React.FC = () => {
    const navigate = useNavigate();
    const { isLoggedIn } = useTaqeemAuth();

    // Step management
    const [currentStep, setCurrentStep] = useState<
        'report-id-input' | 'confirmation' | 'deletion-in-progress' | 'success' | 'error'
    >('report-id-input');

    // Report ID state
    const [reportId, setReportId] = useState("");

    // Error state
    const [error, setError] = useState("");

    // Deletion state
    const [isDeletingReport, setIsDeletingReport] = useState(false);
    const [deletionResult, setDeletionResult] = useState<any>(null);

    // Step definitions for progress indicator
    const steps = [
        { step: 'report-id-input', label: 'Report ID', icon: Trash2 },
        { step: 'confirmation', label: 'Confirmation', icon: AlertTriangle },
        { step: 'deletion-in-progress', label: 'Deletion', icon: RefreshCw },
        { step: 'success', label: 'Success', icon: CheckCircle }
    ];

    // Handle report deletion
    const handleDeleteReport = async () => {
        if (!reportId.trim()) {
            setError("Report ID is required");
            return;
        }

        setError("");
        setIsDeletingReport(true);
        setCurrentStep('deletion-in-progress');

        try {
            console.log(`Deleting report: ${reportId}`);

            const result = await deleteReport(reportId);
            console.log("Report deletion result:", result);

            setDeletionResult(result);

            if (result.data.status === "SUCCESS") {
                setCurrentStep('success');
            } else {
                setError(result.error || 'Failed to delete report');
                setCurrentStep('error');
            }
        } catch (err: any) {
            console.error("Error deleting report:", err);
            setError(err.message || 'An unexpected error occurred during report deletion');
            setCurrentStep('error');
        } finally {
            setIsDeletingReport(false);
        }
    };

    // Reset process
    const resetProcess = () => {
        setCurrentStep('report-id-input');
        setReportId("");
        setError("");
        setIsDeletingReport(false);
        setDeletionResult(null);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-red-600 hover:text-red-800 mb-4 mx-auto transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">🗑️ Delete Report</h1>
                    <p className="text-gray-600">Permanently delete a report and all its associated data</p>
                </div>

                {/* Progress Indicator */}
                <ProgressIndicator currentStep={currentStep} steps={steps} />

                {/* Main Content Area */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    {/* Step 1: Report ID Input */}
                    {currentStep === 'report-id-input' && (
                        <div className="space-y-6">
                            <StepHeader
                                icon={Trash2}
                                title="Enter Report ID"
                                description="Provide the report ID you want to delete"
                                iconColor="text-red-500"
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
                                                setError("");
                                            }}
                                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                                            placeholder="Enter report ID to delete"
                                        />
                                        <button
                                            onClick={() => setCurrentStep('confirmation')}
                                            disabled={!reportId.trim() || !isLoggedIn}
                                            className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg font-semibold flex items-center gap-2 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Continue to Delete
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Enter the report ID you want to permanently delete
                                    </p>
                                </div>

                                {error && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                        <div className="flex items-center gap-3">
                                            <FileText className="w-5 h-5 text-red-500" />
                                            <span className="text-red-700">{error}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Warning Box */}
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <div className="flex items-center gap-3">
                                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                                        <div>
                                            <p className="font-medium text-yellow-800">Warning</p>
                                            <p className="text-sm text-yellow-600">
                                                This action will permanently delete the report and all associated data. This cannot be undone.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Confirmation */}
                    {currentStep === 'confirmation' && (
                        <div className="space-y-6">
                            <StepHeader
                                icon={AlertTriangle}
                                title="Confirm Deletion"
                                description="Please confirm that you want to delete this report permanently"
                                iconColor="text-red-500"
                            />

                            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                        <AlertTriangle className="w-6 h-6 text-red-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-red-800">Warning: Irreversible Action</h3>
                                        <p className="text-red-600">This action cannot be undone.</p>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg p-4 border border-red-200 mb-4">
                                    <h4 className="font-medium text-gray-800 mb-3">You are about to delete:</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Report ID:</span>
                                            <span className="font-medium">{reportId}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">All associated data:</span>
                                            <span className="font-medium">Assets, files, metadata</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <h4 className="font-medium text-yellow-800 mb-2">What will be deleted:</h4>
                                    <ul className="text-sm text-yellow-700 space-y-1">
                                        <li>• All report data and metadata</li>
                                        <li>• All associated assets and macros</li>
                                        <li>• Any generated files or exports</li>
                                        <li>• All historical data related to this report</li>
                                    </ul>
                                </div>

                                <div className="mt-4">
                                    <label className="flex items-center gap-2 text-sm text-gray-700">
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setError("");
                                                } else {
                                                    setError("Please confirm that you understand this action is irreversible");
                                                }
                                            }}
                                        />
                                        I understand that this action is irreversible and I want to proceed with deletion.
                                    </label>
                                </div>

                                {error && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                                        <div className="flex items-center gap-3">
                                            <FileText className="w-5 h-5 text-red-500" />
                                            <span className="text-red-700">{error}</span>
                                        </div>
                                    </div>
                                )}

                                <NavigationButtons
                                    onBack={() => setCurrentStep('report-id-input')}
                                    onNext={handleDeleteReport}
                                    nextLabel="Delete Report Permanently"
                                    backLabel="Back to Report ID"
                                    nextDisabled={!!error}
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 3: Deletion In Progress */}
                    {currentStep === 'deletion-in-progress' && (
                        <div className="space-y-6">
                            <StepHeader
                                icon={RefreshCw}
                                title="Deleting Report"
                                description="Please wait while we delete the report and all associated data..."
                                iconColor="text-orange-500"
                            />

                            <div className="bg-orange-50 border border-orange-200 rounded-xl p-8 text-center">
                                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <RefreshCw className="w-8 h-8 text-orange-600 animate-spin" />
                                </div>
                                <h3 className="text-xl font-semibold text-orange-800 mb-2">Deleting Report</h3>
                                <p className="text-orange-600 mb-4">
                                    Please wait while we delete report <strong>{reportId}</strong> and all associated data.
                                </p>
                                <p className="text-sm text-orange-500">
                                    This may take a few moments...
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Success */}
                    {currentStep === 'success' && (
                        <div className="space-y-6">
                            <StepHeader
                                icon={CheckCircle}
                                title="Success!"
                                description="The report has been deleted successfully"
                                iconColor="text-green-500"
                            />

                            <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="w-8 h-8 text-green-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-green-800 mb-2">Report Deleted Successfully!</h3>
                                <p className="text-green-600 mb-2">Report ID: <strong>{reportId}</strong></p>

                                <div className="bg-white rounded-lg p-4 max-w-md mx-auto mb-4">
                                    <h4 className="font-medium text-gray-800 mb-2">Deletion Details:</h4>
                                    <div className="space-y-1 text-sm text-left">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Report ID:</span>
                                            <span className="font-medium">{reportId}</span>
                                        </div>
                                        {deletionResult?.data?.status && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Status:</span>
                                                <span className="font-medium text-green-600">{deletionResult.data.status}</span>
                                            </div>
                                        )}
                                        {deletionResult?.data?.deletedAt && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Deleted At:</span>
                                                <span className="font-medium">{deletionResult.data.deletedAt}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <p className="text-green-600 mb-4">The report and all associated data have been permanently deleted from the system.</p>

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
                                        Delete Another Report
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error State */}
                    {currentStep === 'error' && (
                        <div className="space-y-6">
                            <StepHeader
                                icon={FileText}
                                title="Error"
                                description="There was an issue deleting the report"
                                iconColor="text-red-500"
                            />

                            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FileText className="w-8 h-8 text-red-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-red-800 mb-2">Report Deletion Failed</h3>
                                <p className="text-red-600 mb-4">{error}</p>

                                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                    <button
                                        onClick={() => setCurrentStep('confirmation')}
                                        className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
                                    >
                                        Try Again
                                    </button>
                                    <button
                                        onClick={resetProcess}
                                        className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg font-semibold transition-colors"
                                    >
                                        Start Over
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

export default DeleteReport;