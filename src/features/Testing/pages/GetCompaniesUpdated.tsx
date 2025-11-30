import { useState } from "react";
import { useLanguage } from "../../../hooks/useLanguage";

export default function GetCompanies() {
    const { isRTL } = useLanguage();
    const [companies, setCompanies] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [selectedCompany, setSelectedCompany] = useState<string>("");
    const [navigating, setNavigating] = useState(false);

    const handleGetCompanies = async () => {
        setLoading(true);
        setError("");
        setSuccessMessage("");
        try {
            const response = await fetch('/api/taqeemResources/resources/companies', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch companies');
            }

            const data = await response.json();
            if (data.success) {
                setCompanies(data.data);
                setSuccessMessage(isRTL ? "تم الحصول على الشركات بنجاح!" : "Companies fetched successfully!");
            } else {
                setError(data.error || 'Failed to get companies');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleNavigateToCompany = async () => {
        if (!selectedCompany) return;

        setNavigating(true);
        setError("");
        setSuccessMessage("");
        try {
            const response = await fetch('/api/taqeemResources/navigate/company', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: selectedCompany }),
            });

            if (!response.ok) {
                throw new Error('Failed to navigate to company');
            }

            const data = await response.json();
            if (data.success) {
                setSuccessMessage(isRTL ? "تم التصفح بنجاح!" : "Navigation done!");
            } else {
                setError(data.error || 'Failed to navigate to company');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setNavigating(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">
                            {isRTL ? "الحصول على الشركات" : "Get Companies"}
                        </h1>
                        <p className="text-gray-600">
                            {isRTL ? "احصل على قائمة الشركات من نظام تقييم" : "Fetch companies list from Taqeem system"}
                        </p>
                    </div>

                    <div className="flex justify-center mb-8">
                        <button
                            onClick={handleGetCompanies}
                            disabled={loading}
                            className="bg-indigo-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                            {loading ? (
                                <>
                                    <svg
                                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    {isRTL ? "جاري التحميل..." : "Loading..."}
                                </>
                            ) : (
                                isRTL ? "احصل على الشركات" : "Get Companies"
                            )}
                        </button>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">
                            {error}
                        </div>
                    )}

                    {successMessage && (
                        <div className="mb-6 p-4 bg-green-50 text-green-700 border border-green-200 rounded-lg">
                            {successMessage}
                        </div>
                    )}

                    {companies.length > 0 && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-gray-900">
                                {isRTL ? "الشركات الموجودة:" : "Companies Found:"}
                            </h2>
                            
                            {/* Company Selection */}
                            <div className="bg-gray-50 p-6 rounded-lg border">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    {isRTL ? "اختر شركة للتصفح:" : "Select Company to Navigate:"}
                                </h3>
                                <div className="space-y-3">
                                    <select
                                        value={selectedCompany}
                                        onChange={(e) => setSelectedCompany(e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="">
                                            {isRTL ? "-- اختر شركة --" : "-- Select Company --"}
                                        </option>
                                        {companies.map((company: any, index: number) => (
                                            <option key={index} value={company.url}>
                                                {company.name}
                                            </option>
                                        ))}
                                    </select>

                                    <button
                                        onClick={handleNavigateToCompany}
                                        disabled={!selectedCompany || navigating}
                                        className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                    >
                                        {navigating ? (
                                            <>
                                                <svg
                                                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <circle
                                                        className="opacity-25"
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                    ></circle>
                                                    <path
                                                        className="opacity-75"
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                    ></path>
                                                </svg>
                                                {isRTL ? "جاري التصفح..." : "Navigating..."}
                                            </>
                                        ) : (
                                            isRTL ? "تصفح إلى الشركة" : "Navigate to Company"
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Companies List */}
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {companies.map((company: any, index: number) => (
                                    <div key={index} className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100 hover:shadow-lg transition-shadow duration-300">
                                        <div className="flex items-center mb-3">
                                            <div className="bg-blue-500 p-2 rounded-lg mr-3">
                                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm3 2a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <h3 className="font-semibold text-gray-900 text-lg">{company.name}</h3>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-3 break-all">{company.url}</p>
                                        <div className="flex items-center text-xs text-gray-500">
                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            Available for navigation
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
