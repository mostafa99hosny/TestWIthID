import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Upload,
    CheckCircle,
    ArrowLeft,
    RefreshCw,
    List,
    Database,
    Search,
    Clock,
    AlertCircle
} from "lucide-react";

import { submitMacro, checkMacroStatus, halfCheckMacroStatus } from "../api";
import ProgressIndicator from "../components/ProgressIndicator";
import StepHeader from "../components/StepHeader";
import { useTaqeemAuth } from "../../../shared/context/TaqeemAuthContext";
import { useSocket } from "../../../shared/context/SocketContext";
import { useProgress } from "../../../shared/context/ProgressContext";
import MacroEditProgressBar from "../components/MacroEditProgressBar";
import { useSocketManager } from "../../../shared/hooks/useSocketManager";

const SubmitMacro: React.FC = () => {
    const navigate = useNavigate();
    const { isLoggedIn } = useTaqeemAuth();
    const { socket } = useSocket();
    const { progressStates, dispatch } = useProgress();
    useSocketManager();



    // Step management
    const [currentStep, setCurrentStep] = useState<
        'report-id-input' | 'submission-in-progress' | 'success' | 'error' | 'checking' | 'check-result' | 'half-checking' | 'half-check-result'
    >('report-id-input');

    // Report ID state
    const [reportId, setReportId] = useState("");
    const [tabsNum, setTabsNum] = useState("1");

    // Error state
    const [error, setError] = useState("");

    // Submission state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionResult, setSubmissionResult] = useState<any>(null);
    const [checkResult, setCheckResult] = useState<any>(null);
    const [halfCheckResult, setHalfCheckResult] = useState<any>(null);

    // Get progress state for current report
    const currentProgress = reportId ? progressStates[reportId] : null;

    // Step definitions for progress indicator
    const steps = [
        { step: 'report-id-input', label: 'Report Details', icon: List },
        { step: 'submission-in-progress', label: 'Submitting Macro', icon: Upload },
        { step: 'success', label: 'Success', icon: CheckCircle }
    ];

    // Subscribe to socket progress updates and update steps accordingly
    useEffect(() => {
        if (!currentProgress) return;

        const { status, progress } = currentProgress;

        // Update step based on progress status
        if (status === 'COMPLETE') {
            setCurrentStep('success');
            setIsSubmitting(false);
        } else if (status === 'FAILED') {
            setCurrentStep('error');
            setIsSubmitting(false);
        } else if (progress > 0 && progress < 100 && currentStep === 'report-id-input') {
            setCurrentStep('submission-in-progress');
        }
    }, [currentProgress, currentStep]);

    // Handle macro submission
    const handleSubmitMacro = async () => {
        if (!reportId.trim()) {
            setError("Please enter a report ID");
            return;
        }

        const tabsNumValue = parseInt(tabsNum);
        if (isNaN(tabsNumValue) || tabsNumValue < 1) {
            setError("Please enter a valid number of tabs (minimum 1)");
            return;
        }

        setError("");
        setIsSubmitting(true);
        setCurrentStep('submission-in-progress');

        // Initialize progress state
        dispatch({
            type: 'UPDATE_PROGRESS',
            payload: {
                reportId,
                updates: {
                    status: 'INITIALIZING',
                    message: "Initializing macro submission...",
                    progress: 0,
                    paused: false,
                    stopped: false,
                    data: {
                        current: 0,
                        total: 0
                    }
                }
            }
        });

        try {
            console.log(`Submitting macro for report: ${reportId} with tabs: ${tabsNumValue}`);

            const result: any = await submitMacro(reportId, tabsNumValue);
            console.log("Macro submission result:", result);

            // If there's an immediate error (not a processing error)
            if (!result.success && result.error) {
                setError(result.error);
                setCurrentStep('error');
                setIsSubmitting(false);

                // Update progress state with error
                dispatch({
                    type: 'UPDATE_PROGRESS',
                    payload: {
                        reportId,
                        updates: {
                            status: 'FAILED',
                            message: `Error: ${result.error}`,
                            progress: 0
                        }
                    }
                });
            }
            // Otherwise, let socket events handle the UI updates
        } catch (err: any) {
            console.error("Error submitting macro:", err);
            setError(err.message || 'An unexpected error occurred while submitting macro');
            setCurrentStep('error');
            setIsSubmitting(false);

            // Update progress state with error
            dispatch({
                type: 'UPDATE_PROGRESS',
                payload: {
                    reportId,
                    updates: {
                        status: 'FAILED',
                        message: `Error: ${err.message}`,
                        progress: 0
                    }
                }
            });
        }
    };

    // Handle macro status check
    const handleCheckMacro = async () => {
        if (!reportId.trim()) {
            setError("Please enter a report ID");
            return;
        }

        setError("");
        setIsSubmitting(true);
        setCurrentStep('checking');

        try {
            console.log(`Checking macro status for report: ${reportId}`);

            const result: any = await checkMacroStatus(reportId, tabsNum);
            console.log("Macro check result:", result);

            setCheckResult(result);
            setCurrentStep('check-result');

        } catch (err: any) {
            console.error("Error checking macro status:", err);
            setError(err.message || 'An unexpected error occurred while checking macro status');
            setCurrentStep('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle half check macro status
    const handleHalfCheckMacro = async () => {
        if (!reportId.trim()) {
            setError("Please enter a report ID");
            return;
        }

        setError("");
        setIsSubmitting(true);
        setCurrentStep('half-checking');

        try {
            console.log(`Half checking macro status for report: ${reportId}`);

            const result: any = await halfCheckMacroStatus(reportId, tabsNum);
            console.log("Half check macro result:", result);

            setHalfCheckResult(result);
            setCurrentStep('half-check-result');

        } catch (err: any) {
            console.error("Error half checking macro status:", err);
            setError(err.message || 'An unexpected error occurred while checking macro status');
            setCurrentStep('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Reset process
    const resetProcess = () => {
        setCurrentStep('report-id-input');
        setReportId("");
        setTabsNum("1");
        setError("");
        setIsSubmitting(false);
        setSubmissionResult(null);
        setCheckResult(null);
        setHalfCheckResult(null);

        // Clear progress state if exists
        if (reportId && progressStates[reportId]) {
            dispatch({
                type: 'CLEAR_PROGRESS',
                payload: { reportId }
            });
        }
    };

    // Helper function to get progress display values
    const getProgressDisplay = () => {
        if (!currentProgress) {
            return {
                message: "Initializing...",
                percentage: 0,
                processedCount: 0,
                totalCount: 0
            };
        }

        return {
            message: currentProgress.message || '',
            percentage: currentProgress.progress || 0,
            processedCount: currentProgress.data?.current || 0,
            totalCount: currentProgress.data?.total || 0
        };
    };


    // In your SubmitMacro component
    // In SubmitMacro component - REPLACE THIS CODE:
    useEffect(() => {
        if (!socket || !reportId) {
            console.log('[SUBMIT MACRO] No socket or reportId for room joining');
            return;
        }

        console.log(`[SUBMIT MACRO] 🔑 Joining progress room for report: ${reportId}`);

        // Join the progress room that matches backend emission
        const progressRoom = `progress_${reportId}`;

        console.log(`[SUBMIT MACRO] Emitting join_progress_room for: ${progressRoom}`);

        // Use the proper event that backend expects
        socket.emit('join_progress_room', reportId);

        // Wait for confirmation
        const handleRoomJoined = (data: any) => {
            console.log('[SUBMIT MACRO] ✅ Progress room joined confirmation:', data);
        };

        socket.on('progress_room_joined', handleRoomJoined);

        // Also listen for errors
        const handleError = (error: any) => {
            console.error('[SUBMIT MACRO] ❌ Room join error:', error);
        };

        socket.on('error', handleError);

        return () => {
            console.log(`[SUBMIT MACRO] 🚪 Leaving progress room: ${progressRoom}`);
            socket.emit('leave_progress_room', reportId);
            socket.off('progress_room_joined', handleRoomJoined);
            socket.off('error', handleError);
        };
    }, [socket, reportId]);

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-blue-600 mb-4 mx-auto"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Submit Macro</h1>
                    <p className="text-gray-600">Submit or check macro for an existing report</p>
                </div>

                {/* Progress Indicator */}
                <ProgressIndicator currentStep={currentStep} steps={steps} />

                {/* Main Content Area */}
                <div className="bg-white rounded-lg shadow p-6">
                    {/* Step 1: Report ID Input */}
                    {currentStep === 'report-id-input' && (
                        <div className="space-y-6">
                            <StepHeader
                                icon={List}
                                title="Enter Report Details"
                                description="Provide the report ID and number of tabs"
                                iconColor="text-gray-500"
                            />

                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Report ID Input */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Report ID *
                                        </label>
                                        <input
                                            type="text"
                                            value={reportId}
                                            onChange={(e) => {
                                                setReportId(e.target.value);
                                                setError("");
                                            }}
                                            className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Enter report ID"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            The ID of the report to submit macro for
                                        </p>
                                    </div>

                                    {/* Tabs Number Input */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Number of Tabs *
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="10"
                                            value={tabsNum}
                                            onChange={(e) => {
                                                setTabsNum(e.target.value);
                                                setError("");
                                            }}
                                            className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Enter number of tabs"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Number of parallel tabs (1-10, recommended: 3)
                                        </p>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
                                    <button
                                        onClick={handleCheckMacro}
                                        disabled={!reportId.trim() || isSubmitting || !isLoggedIn}
                                        className="px-6 py-3 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white rounded font-semibold flex items-center gap-2 justify-center"
                                    >
                                        {isSubmitting ? (
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Search className="w-4 h-4" />
                                        )}
                                        {isSubmitting ? "Checking..." : "Full Check"}
                                    </button>
                                    <button
                                        onClick={handleHalfCheckMacro}
                                        disabled={!reportId.trim() || isSubmitting || !isLoggedIn}
                                        className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white rounded font-semibold flex items-center gap-2 justify-center"
                                    >
                                        {isSubmitting ? (
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Clock className="w-4 h-4" />
                                        )}
                                        {isSubmitting ? "Checking..." : "Half Check"}
                                    </button>
                                    <button
                                        onClick={handleSubmitMacro}
                                        disabled={!reportId.trim() || !tabsNum.trim() || isSubmitting || !isLoggedIn}
                                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded font-semibold flex items-center gap-2 justify-center"
                                    >
                                        {isSubmitting ? (
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Upload className="w-4 h-4" />
                                        )}
                                        {isSubmitting ? "Submitting..." : "Submit Macro"}
                                    </button>
                                </div>

                                {error && (
                                    <div className="bg-red-100 border border-red-300 rounded p-4">
                                        <div className="flex items-center gap-3">
                                            <AlertCircle className="w-5 h-5 text-red-500" />
                                            <span className="text-red-700">{error}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Information Box */}
                                <div className="bg-gray-100 border border-gray-300 rounded p-4">
                                    <div className="flex items-center gap-3">
                                        <Database className="w-5 h-5 text-gray-500" />
                                        <div>
                                            <p className="font-medium text-gray-800">What this does:</p>
                                            <p className="text-sm text-gray-600">
                                                <strong>Full Check:</strong> Checks all macros in the report<br />
                                                <strong>Half Check:</strong> Only checks previously incomplete macros (faster)<br />
                                                <strong>Submit Macro:</strong> Submits macros for the report
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Submission In Progress */}
                    {currentStep === 'submission-in-progress' && currentProgress && (
                        <div className="space-y-6">
                            <StepHeader
                                icon={RefreshCw}
                                title="Submitting Macro"
                                description="Please wait while we submit the macro for the report..."
                                iconColor="text-blue-500"
                            />

                            <MacroEditProgressBar
                                reportId={reportId}
                                status={currentProgress.status}
                                message={currentProgress.message}
                                progress={currentProgress.progress}
                                paused={currentProgress.paused}
                                data={currentProgress.data}
                            />
                        </div>
                    )}

                    {/* Step 3: Success */}
                    {currentStep === 'success' && (
                        <div className="space-y-6">
                            <StepHeader
                                icon={CheckCircle}
                                title="Success!"
                                description="Macro has been submitted successfully"
                                iconColor="text-green-500"
                            />

                            <div className="bg-green-100 border border-green-300 rounded p-6">
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 bg-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle className="w-8 h-8 text-green-600" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-green-800 mb-2">Macro Submitted Successfully!</h3>
                                    <p className="text-green-600">
                                        Macro has been successfully submitted for report <strong>{reportId}</strong>
                                    </p>
                                </div>

                                {/* Submission Details */}
                                {currentProgress && (
                                    <div className="bg-white border border-green-300 rounded p-4 mb-4">
                                        <h4 className="font-semibold text-green-800 mb-2">Submission Details:</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Report ID:</span>
                                                <span className="font-mono">{reportId}</span>
                                            </div>
                                            {currentProgress.data?.numTabs && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Tabs Used:</span>
                                                    <span>{currentProgress.data.numTabs}</span>
                                                </div>
                                            )}
                                            {currentProgress.data?.total && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Total Processed:</span>
                                                    <span>{currentProgress.data.total}</span>
                                                </div>
                                            )}
                                            {currentProgress.data?.failedRecords !== undefined && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Failed Records:</span>
                                                    <span className={currentProgress.data.failedRecords > 0 ? "text-red-600" : "text-green-600"}>
                                                        {currentProgress.data.failedRecords}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Status:</span>
                                                <span className="text-green-600 font-semibold">Completed</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
                                    <button
                                        onClick={() => navigate("/equipment/viewReports")}
                                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold"
                                    >
                                        View Reports
                                    </button>
                                    <button
                                        onClick={resetProcess}
                                        className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded font-semibold"
                                    >
                                        Submit Another Macro
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Checking Status */}
                    {currentStep === 'checking' && (
                        <div className="space-y-6">
                            <StepHeader
                                icon={Search}
                                title="Checking Macro Status"
                                description="Please wait while we check all macros in the report..."
                                iconColor="text-gray-500"
                            />

                            <div className="bg-gray-100 border border-gray-300 rounded p-8 text-center">
                                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <RefreshCw className="w-8 h-8 text-gray-600 animate-spin" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">Full Check In Progress</h3>
                                <p className="text-gray-600 mb-4">
                                    Checking all macros for report <strong>{reportId}</strong>
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Half Checking Status */}
                    {currentStep === 'half-checking' && (
                        <div className="space-y-6">
                            <StepHeader
                                icon={Clock}
                                title="Half Checking Macro Status"
                                description="Please wait while we check only incomplete macros..."
                                iconColor="text-yellow-500"
                            />

                            <div className="bg-yellow-100 border border-yellow-300 rounded p-8 text-center">
                                <div className="w-16 h-16 bg-yellow-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <RefreshCw className="w-8 h-8 text-yellow-600 animate-spin" />
                                </div>
                                <h3 className="text-xl font-semibold text-yellow-800 mb-2">Half Check In Progress</h3>
                                <p className="text-yellow-600 mb-4">
                                    Checking only incomplete macros for report <strong>{reportId}</strong>
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Check Result */}
                    {currentStep === 'check-result' && (
                        <div className="space-y-6">
                            <StepHeader
                                icon={Search}
                                title="Full Check Result"
                                description="Here is the current status of all macros"
                                iconColor="text-gray-500"
                            />

                            <div className="bg-gray-100 border border-gray-300 rounded p-6">
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Search className="w-8 h-8 text-gray-600" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Full Check Complete</h3>
                                    <p className="text-gray-600">
                                        Status for all macros in report <strong>{reportId}</strong>
                                    </p>
                                </div>

                                {/* Check Result Details */}
                                {checkResult && (
                                    <div className="bg-white border border-gray-300 rounded p-4 mb-4">
                                        <h4 className="font-semibold text-gray-800 mb-2">Status Details:</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Report ID:</span>
                                                <span className="font-mono">{reportId}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Check Type:</span>
                                                <span className="text-blue-600 font-semibold">Full Check</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Status:</span>
                                                <span className={`font-semibold ${checkResult.data?.status === 'SUCCESS' ? 'text-green-600' : 'text-red-600'}`}>
                                                    {checkResult.data?.status || 'Unknown'}
                                                </span>
                                            </div>
                                            {checkResult.data?.macro_count !== undefined && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Incomplete Macros:</span>
                                                    <span className={`font-semibold ${checkResult.data.macro_count === 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {checkResult.data.macro_count}
                                                    </span>
                                                </div>
                                            )}
                                            {checkResult.data?.message && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Message:</span>
                                                    <span className="text-gray-700">{checkResult.data.message}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
                                    <button
                                        onClick={resetProcess}
                                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold"
                                    >
                                        Back to Main
                                    </button>
                                    <button
                                        onClick={handleSubmitMacro}
                                        className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded font-semibold"
                                    >
                                        Submit Macro Now
                                    </button>
                                    <button
                                        onClick={handleCheckMacro}
                                        className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded font-semibold"
                                    >
                                        Run Full Check
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Half Check Result */}
                    {currentStep === 'half-check-result' && (
                        <div className="space-y-6">
                            <StepHeader
                                icon={Clock}
                                title="Half Check Result"
                                description="Here is the status of incomplete macros only"
                                iconColor="text-yellow-500"
                            />

                            <div className="bg-yellow-50 border border-yellow-300 rounded p-6">
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 bg-yellow-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Clock className="w-8 h-8 text-yellow-600" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-yellow-800 mb-2">Half Check Complete</h3>
                                    <p className="text-yellow-600">
                                        Status for incomplete macros in report <strong>{reportId}</strong>
                                    </p>
                                </div>

                                {/* Half Check Result Details */}
                                {halfCheckResult && (
                                    <div className="bg-white border border-yellow-300 rounded p-4 mb-4">
                                        <h4 className="font-semibold text-yellow-800 mb-2">Status Details:</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Report ID:</span>
                                                <span className="font-mono">{reportId}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Check Type:</span>
                                                <span className="text-yellow-600 font-semibold">Half Check</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Status:</span>
                                                <span className={`font-semibold`}>
                                                    {halfCheckResult.data.status}
                                                </span>
                                            </div>
                                            {halfCheckResult.data?.macro_count !== undefined && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Incomplete Macros:</span>
                                                    <span className={`font-semibold ${halfCheckResult.data.macro_count === 0 ? 'text-green-600' : 'text-yellow-600'}`}>
                                                        {halfCheckResult.data.macro_count}
                                                    </span>
                                                </div>
                                            )}
                                            {halfCheckResult.data?.message && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Message:</span>
                                                    <span className="text-gray-700">{halfCheckResult.data.message}</span>
                                                </div>
                                            )}
                                            {halfCheckResult.error && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Error:</span>
                                                    <span className="text-red-600">{halfCheckResult.error}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
                                    <button
                                        onClick={resetProcess}
                                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold"
                                    >
                                        Back to Main
                                    </button>
                                    <button
                                        onClick={handleSubmitMacro}
                                        className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded font-semibold"
                                    >
                                        Submit Macro Now
                                    </button>
                                    <button
                                        onClick={handleHalfCheckMacro}
                                        className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded font-semibold"
                                    >
                                        Run Half Check Again
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error State */}
                    {currentStep === 'error' && (
                        <div className="space-y-6">
                            <StepHeader
                                icon={AlertCircle}
                                title="Error"
                                description="There was an issue with your request"
                                iconColor="text-red-500"
                            />

                            <div className="bg-red-100 border border-red-300 rounded p-6 text-center">
                                <div className="w-16 h-16 bg-red-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <AlertCircle className="w-8 h-8 text-red-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-red-800 mb-2">Operation Failed</h3>
                                <p className="text-red-600 mb-4">
                                    {currentProgress?.message || error}
                                </p>

                                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                    <button
                                        onClick={() => setCurrentStep('report-id-input')}
                                        className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded font-semibold"
                                    >
                                        Try Again
                                    </button>
                                    <button
                                        onClick={resetProcess}
                                        className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded font-semibold"
                                    >
                                        Start Over
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-md z-50 border border-red-500">
                <h4 className="font-bold mb-2 text-red-400">DEBUG PANEL</h4>
                <div>Socket: {socket?.id || 'No ID'}</div>
                <div>Connected: {socket?.connected ? '✅' : '❌'}</div>
                <div>Report ID: {reportId || 'None'}</div>
                <div>Current Step: {currentStep}</div>
                <div>Progress State: {currentProgress ? `${currentProgress.progress}%` : 'None'}</div>
                <div>Total Reports: {Object.keys(progressStates).length}</div>
                {currentProgress && (
                    <div className="mt-2 border-t border-gray-600 pt-2">
                        <div>Status: {currentProgress.status}</div>
                        <div>Message: {currentProgress.message}</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SubmitMacro;