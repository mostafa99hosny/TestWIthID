import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    CheckCircle,
    ArrowLeft,
    FileText,
    RefreshCw,
    Trash2,
    Search
} from "lucide-react";

import { deleteReport, validateExcelData } from "../api";
import { useTaqeemAuth } from "../../../shared/context/TaqeemAuthContext";

const DeleteReport: React.FC = () => {
    const navigate = useNavigate();
    const { isLoggedIn } = useTaqeemAuth();

    // Report ID state
    const [reportId, setReportId] = useState("");

    // Error state
    const [error, setError] = useState("");

    // Operation states
    const [isDeleting, setIsDeleting] = useState(false);
    const [isCheckingReport, setIsCheckingReport] = useState(false);
    const [reportExists, setReportExists] = useState<boolean | null>(null);
    const [deleteSuccess, setDeleteSuccess] = useState(false);

    // Handle report validation in Taqeem
    const handleCheckReportInTaqeem = async () => {
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
                setError(`Report exists with ${result.data?.assetsExact} macros. Please use a different report ID.`);
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

    // Handle report deletion
    const handleDeleteReport = async () => {
        if (!reportId.trim()) {
            setError("Report ID is required");
            return;
        }

        setIsDeleting(true);
        setError("");

        try {
            console.log(`Deleting report: ${reportId}`);

            const result = await deleteReport(reportId);
            console.log("Report deletion result:", result);

            if (result.data.status === "SUCCESS") {
                setDeleteSuccess(true);
                setError("");
            } else {
                setError(result.error || 'Failed to delete report');
            }
        } catch (err: any) {
            console.error("Error deleting report:", err);
            setError(err.message || 'An unexpected error occurred during report deletion');
        } finally {
            setIsDeleting(false);
        }
    };

    // Reset process
    const resetProcess = () => {
        setReportId("");
        setError("");
        setIsDeleting(false);
        setIsCheckingReport(false);
        setReportExists(null);
        setDeleteSuccess(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 py-8">
            <div className="max-w-2xl mx-auto px-4">
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

                {/* Main Content Area */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    {/* Main Form */}
                    <div className="space-y-6">
                        <div className="text-center mb-6">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Trash2 className="w-6 h-6 text-red-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">Delete Report</h2>
                            <p className="text-gray-600">Enter the report ID to delete it permanently</p>
                        </div>

                        <div className="space-y-6">
                            {/* Report ID Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Report ID *
                                </label>
                                <div className="flex gap-3 mb-3">
                                    <input
                                        type="text"
                                        value={reportId}
                                        onChange={(e) => {
                                            setReportId(e.target.value);
                                            setError("");
                                            setReportExists(null);
                                        }}
                                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                                        placeholder="Enter report ID to delete"
                                        disabled={isDeleting || deleteSuccess}
                                    />
                                    <button
                                        onClick={handleCheckReportInTaqeem}
                                        disabled={!reportId.trim() || isCheckingReport || isDeleting || !isLoggedIn || deleteSuccess}
                                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-semibold flex items-center gap-2 transition-colors whitespace-nowrap"
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
                                    Enter the report ID you want to permanently delete
                                </p>

                                {/* Report Validation Status */}
                                {reportExists === true && (
                                    <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                            <span className="text-green-700 text-sm font-medium">
                                                Report verified successfully
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {reportExists === false && (
                                    <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
                                        <div className="flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-red-500" />
                                            <span className="text-red-700 text-sm">
                                                Report not found or invalid
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Error Display */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <div className="flex items-center gap-3">
                                        <FileText className="w-5 h-5 text-red-500" />
                                        <span className="text-red-700">{error}</span>
                                    </div>
                                </div>
                            )}

                            {/* Warning Box */}
                            {!deleteSuccess && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <div className="flex items-center gap-3">
                                        <FileText className="w-5 h-5 text-yellow-500" />
                                        <div>
                                            <p className="font-medium text-yellow-800">Warning: Irreversible Action</p>
                                            <p className="text-sm text-yellow-600">
                                                This action will permanently delete the report and all associated data. This cannot be undone.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Success State - Appears below the form */}
                            {deleteSuccess && (
                                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                                    <div className="text-center mb-4">
                                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <CheckCircle className="w-8 h-8 text-green-600" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-green-800 mb-2">Report Deleted Successfully!</h3>
                                        <p className="text-green-600 mb-2">Report ID: <strong>{reportId}</strong></p>
                                        <p className="text-green-600">
                                            The report and all associated data have been permanently deleted from the system.
                                        </p>
                                    </div>

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
                            )}

                            {/* Action Buttons */}
                            {!deleteSuccess && (
                                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                    <button
                                        onClick={() => navigate(-1)}
                                        disabled={isDeleting}
                                        className="flex-1 px-6 py-3 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        Back
                                    </button>
                                    <button
                                        onClick={handleDeleteReport}
                                        disabled={!reportId.trim() || isDeleting || !isLoggedIn}
                                        className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                                    >
                                        {isDeleting ? (
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="w-4 h-4" />
                                        )}
                                        {isDeleting ? "Deleting..." : "Delete Report"}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteReport;