import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Search,
    CheckCircle,
    ArrowLeft,
    FileText,
    RefreshCw,
    Plus,
    Hash
} from "lucide-react";

import { validateExcelData } from "../api";

import ProgressIndicator from "../components/ProgressIndicator";
import StepHeader from "../components/StepHeader";
import NavigationButtons from "../components/NavigationButtons";

const AssetCreate: React.FC = () => {
    const navigate = useNavigate();

    // Step management
    const [currentStep, setCurrentStep] = useState<
        'report-id-check' | 'asset-configuration' | 'success'
    >('report-id-check');

    // Report ID state
    const [reportId, setReportId] = useState("");
    const [reportExists, setReportExists] = useState<boolean | null>(null);
    const [isCheckingReport, setIsCheckingReport] = useState(false);

    // Asset configuration state
    const [tabsInput, setTabsInput] = useState("");
    const [assetCount, setAssetCount] = useState("");
    const [error, setError] = useState("");

    // Step definitions for progress indicator
    const steps = [
        { step: 'report-id-check', label: 'Report ID Check', icon: Search },
        { step: 'asset-configuration', label: 'Asset Configuration', icon: Plus },
        { step: 'success', label: 'Success', icon: CheckCircle }
    ];

    // Step 1: Check Report ID (same as before)
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

    // Step 2: Handle asset configuration submission
    const handleAssetConfiguration = () => {
        if (!tabsInput.trim() || !assetCount.trim()) {
            setError("Both fields are required");
            return;
        }

        const count = parseInt(assetCount);
        if (isNaN(count) || count <= 0) {
            setError("Asset count must be a positive number");
            return;
        }

        // For now, just proceed to success since we're only building the UI
        setCurrentStep('success');
        setError("");
    };

    // Reset process
    const resetProcess = () => {
        setCurrentStep('report-id-check');
        setReportId("");
        setReportExists(null);
        setTabsInput("");
        setAssetCount("");
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
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">🛠️ Asset Creation</h1>
                    <p className="text-gray-600">Create new assets for an existing report</p>
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
                                                    Report ID <strong>{reportId}</strong> exists. You can proceed to configure assets.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-4 text-center">
                                            <button
                                                onClick={() => setCurrentStep('asset-configuration')}
                                                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
                                            >
                                                Continue to Asset Configuration
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {error && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                        <div className="flex items-center gap-3">
                                            <FileText className="w-5 h-5 text-red-500" />
                                            <span className="text-red-700">{error}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Asset Configuration */}
                    {currentStep === 'asset-configuration' && (
                        <div className="space-y-6">
                            <StepHeader
                                icon={Plus}
                                title="Asset Configuration"
                                description="Configure the tabs and asset count for your report"
                                iconColor="text-purple-500"
                            />

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                <div className="flex items-center gap-3">
                                    <FileText className="w-5 h-5 text-blue-500" />
                                    <div>
                                        <p className="font-medium text-blue-800">Report ID: {reportId}</p>
                                        <p className="text-sm text-blue-600">Configure the asset details for this report</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* Tabs Input */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Plus className="w-4 h-4 inline mr-1" />
                                        Tabs Input *
                                    </label>
                                    <input
                                        type="text"
                                        value={tabsInput}
                                        onChange={(e) => {
                                            setTabsInput(e.target.value);
                                            setError("");
                                        }}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                                        placeholder="Enter tabs configuration (e.g., Sheet1,Sheet2,Sheet3)"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Specify the tab names separated by commas
                                    </p>
                                </div>

                                {/* Asset Count */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Hash className="w-4 h-4 inline mr-1" />
                                        Asset Count *
                                    </label>
                                    <input
                                        type="number"
                                        value={assetCount}
                                        onChange={(e) => {
                                            setAssetCount(e.target.value);
                                            setError("");
                                        }}
                                        min="1"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                                        placeholder="Enter number of assets"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Enter the total number of assets to create
                                    </p>
                                </div>

                                {/* Configuration Preview */}
                                {(tabsInput || assetCount) && (
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                        <h4 className="font-medium text-gray-800 mb-2">Configuration Preview:</h4>
                                        <div className="space-y-2 text-sm">
                                            {tabsInput && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Tabs:</span>
                                                    <span className="font-medium">
                                                        {tabsInput.split(',').map(tab => tab.trim()).filter(Boolean).join(', ')}
                                                    </span>
                                                </div>
                                            )}
                                            {assetCount && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Asset Count:</span>
                                                    <span className="font-medium">{assetCount}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {error && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                        <div className="flex items-center gap-3">
                                            <FileText className="w-5 h-5 text-red-500" />
                                            <span className="text-red-700">{error}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <NavigationButtons
                                onBack={() => setCurrentStep('report-id-check')}
                                onNext={handleAssetConfiguration}
                                nextLabel="Continue"
                                backLabel="Back to Report Check"
                                nextDisabled={!tabsInput.trim() || !assetCount.trim()}
                            />
                        </div>
                    )}

                    {/* Step 3: Success */}
                    {currentStep === 'success' && (
                        <div className="space-y-6">
                            <StepHeader
                                icon={CheckCircle}
                                title="Success!"
                                description="Your asset configuration has been saved successfully"
                                iconColor="text-green-500"
                            />

                            <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="w-8 h-8 text-green-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-green-800 mb-2">Asset Configuration Saved!</h3>
                                <p className="text-green-600 mb-2">Report ID: <strong>{reportId}</strong></p>

                                <div className="bg-white rounded-lg p-4 max-w-md mx-auto mb-4">
                                    <h4 className="font-medium text-gray-800 mb-2">Configuration Details:</h4>
                                    <div className="space-y-1 text-sm text-left">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Tabs:</span>
                                            <span className="font-medium">{tabsInput}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Asset Count:</span>
                                            <span className="font-medium">{assetCount}</span>
                                        </div>
                                    </div>
                                </div>

                                <p className="text-green-600 mb-4">The asset configuration has been successfully processed.</p>

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
                                        Create New Assets
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

export default AssetCreate;