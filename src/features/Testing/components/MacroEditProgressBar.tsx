import React from 'react';
import { CheckCircle, AlertCircle, Loader, Pause } from 'lucide-react';

interface MacroEditProgressBarProps {
    reportId: string;
    status: string;
    message: string;
    progress: number;
    paused?: boolean;
    data?: any;
}

const MacroEditProgressBar: React.FC<MacroEditProgressBarProps> = ({
    reportId,
    status,
    message,
    progress,
    paused = false,
    data = {}
}) => {
    const { current, total, macro_id, error } = data;

    // Determine status color and icon
    const getStatusConfig = () => {
        if (status === 'COMPLETE') {
            return {
                color: 'bg-green-500',
                textColor: 'text-green-700',
                bgColor: 'bg-green-100',
                borderColor: 'border-green-300',
                icon: <CheckCircle className="w-5 h-5 text-green-600" />
            };
        }
        if (status === 'FAILED') {
            return {
                color: 'bg-red-500',
                textColor: 'text-red-700',
                bgColor: 'bg-red-100',
                borderColor: 'border-red-300',
                icon: <AlertCircle className="w-5 h-5 text-red-600" />
            };
        }
        if (paused) {
            return {
                color: 'bg-yellow-500',
                textColor: 'text-yellow-700',
                bgColor: 'bg-yellow-100',
                borderColor: 'border-yellow-300',
                icon: <Pause className="w-5 h-5 text-yellow-600" />
            };
        }
        return {
            color: 'bg-blue-500',
            textColor: 'text-blue-700',
            bgColor: 'bg-blue-100',
            borderColor: 'border-blue-300',
            icon: <Loader className="w-5 h-5 text-blue-600 animate-spin" />
        };
    };

    const statusConfig = getStatusConfig();

    return (
        <div className={`${statusConfig.bgColor} ${statusConfig.borderColor} border rounded-lg p-4 mb-4`}>
            <div className="flex items-center gap-3 mb-3">
                {statusConfig.icon}
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                        <span className={`font-semibold ${statusConfig.textColor}`}>
                            {status === 'COMPLETE' ? 'Complete' :
                                status === 'FAILED' ? 'Failed' :
                                    paused ? 'Paused' : 'Processing'}
                        </span>
                        <span className={`text-sm font-mono ${statusConfig.textColor}`}>
                            {progress.toFixed(1)}%
                        </span>
                    </div>
                    <p className={`text-sm ${statusConfig.textColor}`}>{message}</p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                    className={`${statusConfig.color} h-full rounded-full transition-all duration-300 ease-out`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                />
            </div>

            {/* Additional Details */}
            {(current !== undefined && total !== undefined) && (
                <div className="mt-2 text-sm text-gray-600">
                    <span>Progress: {current} / {total} macros</span>
                </div>
            )}

            {macro_id && (
                <div className="mt-1 text-xs text-gray-500">
                    Current Macro ID: <span className="font-mono">{macro_id}</span>
                </div>
            )}

            {error && (
                <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                    <strong>Error:</strong> {error}
                </div>
            )}

            <div className="mt-2 text-xs text-gray-400">
                Report ID: <span className="font-mono">{reportId}</span>
            </div>
        </div>
    );
};

export default MacroEditProgressBar;