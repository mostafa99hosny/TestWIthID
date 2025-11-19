import { api } from "../../shared/utils/api";

export const uploadAssetsToDB = async (
  reportId: string,
  excelFile: File,
) => {
  const formData = new FormData();
  formData.append("reportId", reportId);
  formData.append("excelFile", excelFile);

  try {
    const response = await api.post("/taqeemSubmission/save-without-base", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error uploading assets to DB:", error);
    throw new Error("Error uploading assets to DB");
  }
};
export const checkBrowserStatus = async () => {
  try {
    const response = await api.get('/taqeemAuth/browser/status');
    return response.data;
  } catch (error) {
    throw new Error('Error checking browser status');
  }
};
export const taqeemLogin = async (email: string, password: string, method?: string) => {
  try {
    const response = await api.post('/taqeemAuth/login', {
      email: email.trim(),
      password: password.trim(),
      method: method
    });
    return response.data;
  } catch (error) {
    throw new Error('Error logging in');
  }
};

export const grabMacroIds = async (reportId: string, tabsNum: number) => {
  try {
    const response = await api.post('/taqeemSubmission/grab-macro-ids', {
      reportId: reportId.trim(),
      tabsNum,
    });
    return response.data;
  } catch (error: any) {
    console.error("Error grabbing macro IDs:", error);

    // Handle specific error cases
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    } else if (error.response?.status === 404) {
      throw new Error('Report not found. Please check the report ID.');
    } else if (error.response?.status === 400) {
      throw new Error('Invalid report ID format.');
    } else if (error.message?.includes('timeout')) {
      throw new Error('Request timeout. Please try again.');
    } else {
      throw new Error('Error extracting macro IDs. Please try again.');
    }
  }
};

export const deleteReport = async (reportId: string) => {
  try {
    const response = await api.post('/taqeemDelete/delete-report', {
      reportId: reportId.trim(),
    });
    return response.data;
  } catch (error: any) {
    console.error("Error deleting report:", error);

    // Handle specific error cases
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    } else if (error.response?.status === 404) {
      throw new Error('Report not found. Please check the report ID.');
    } else if (error.response?.status === 403) {
      throw new Error('You do not have permission to delete this report.');
    } else if (error.message?.includes('timeout')) {
      throw new Error('Deletion timeout. Please try again.');
    } else {
      throw new Error('Error deleting report. Please try again.');
    }
  }
};

export const deleteReportAssets = async (reportId: string) => {
  try {
    const response = await api.post('/taqeemDelete/delete-assets', {
      reportId: reportId.trim(),
    });
    return response.data;
  } catch (error: any) {
    console.error("Error deleting report assets:", error);

    // Handle specific error cases
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    } else if (error.response?.status === 404) {
      throw new Error('Report not found. Please check the report ID.');
    } else if (error.response?.status === 403) {
      throw new Error('You do not have permission to delete assets for this report.');
    } else if (error.message?.includes('timeout')) {
      throw new Error('Deletion timeout. Please try again.');
    } else {
      throw new Error('Error deleting report assets. Please try again.');
    }
  }
};

export const createAssets = async (
  reportId: string,
  macroCount: number,
  tabsNum: number = 3
) => {
  try {
    const response = await api.post("/taqeemSubmission/create-assets", {
      reportId: reportId.trim(),
      macroCount,
      tabsNum,
    });
    return response.data;
  } catch (error: any) {
    console.error("Error creating assets:", error);

    // Handle specific error cases based on the controller
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    } else if (error.message?.includes('timeout')) {
      throw new Error('Asset creation timeout. Please try again.');
    } else {
      throw new Error('Error creating assets');
    }
  }
};


export const checkReportInDB = async (reportId: string) => {
  try {
    const response = await api.get(`/reports/by-number/${reportId.trim()}`);
    return response.data;
  } catch (error) {
    throw new Error('Error checking report in database');
  }
};

export const changeReportStatus = async (reportId: string) => {
  try {
    const response = await api.post('/taqeemDelete/change-report-status', {
      reportId: reportId.trim(),
    });
    return response.data;
  } catch (error: any) {
    console.error("Error changing report status:", error);

    // Handle specific error cases
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    } else if (error.response?.status === 404) {
      throw new Error('Report not found. Please check the report ID.');
    } else if (error.response?.status === 403) {
      throw new Error('You do not have permission to change this report status.');
    } else if (error.message?.includes('timeout')) {
      throw new Error('Status change timeout. Please try again.');
    } else {
      throw new Error('Error changing report status. Please try again.');
    }
  }
};

export const validateExcelData = async (reportId: string, fileData: any) => {
  try {
    const response = await api.post('/taqeemSubmission/validate-report', {
      reportId: reportId.trim(),
      fileData,
    });
    return response.data;
  } catch (error) {
    throw new Error('Error validating Excel data');
  }
};

// In your api.ts or similar file
export const getBrowserStatistics = async () => {
  try {
    const response = await api.get('/taqeemResources/resources/metrics');
    return response.data;
  } catch (error) {
    throw new Error('Error fetching browser statistics');
  }
};

// Add this to your api.js or similar file
export const createNewWindow = async () => {
  try {
    const response = await api.post('/taqeemAuth/browser/new-window');
    return response.data;
  } catch (error) {
    throw new Error('Error creating new browser window');
  }
};

export const submitOTP = async (otp: string) => {
  try {
    const response = await api.post('/taqeemAuth/otp', {
      otp: otp.trim(),
    });
    return response.data;
  } catch (error) {
    throw new Error('Error verifying OTP');
  }
}

export const addCommonFields = async (reportId: string, inspectionDate: any, region: string, city: string) => {
  try {
    const response = await api.post('/taqeemSubmission/add-common-fields', {
      reportId: reportId.trim(),
      inspectionDate,
      region,
      city,
    });
    return response.data;
  } catch (error) {
    throw new Error('Error adding common fields');
  }
};

export const checkMacroStatus = async (reportId: string, tabsNum: string) => {
  try {
    const response = await api.post('/taqeemSubmission/check-macro-status', {
      reportId: reportId.trim(),
      tabsNum: parseInt(tabsNum),
    });
    return response.data;
  } catch (error: any) {
    console.error("Error checking macro status:", error);

    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    } else if (error.response?.status === 404) {
      throw new Error('Report not found. Please check the report ID.');
    } else {
      throw new Error('Error checking macro status. Please try again.');
    }
  }
};

export const halfCheckMacroStatus = async (reportId: string, tabsNum: string) => {
  try {
    const response = await api.post('/taqeemSubmission/half-check-macro-status', {
      reportId: reportId.trim(),
      tabsNum: parseInt(tabsNum),
    });
    return response.data;
  } catch (error: any) {
    console.error("Error checking macro status:", error);

    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    } else if (error.response?.status === 404) {
      throw new Error('Report not found. Please check the report ID.');
    } else {
      throw new Error('Error checking macro status. Please try again.');
    }
  }
};

// Add these functions to your api.ts file (the one with submitMacro, checkMacroStatus, etc.)

export const pauseProcessing = async (reportId: string) => {
  try {
    const response = await api.post('/taqeemSubmission/pause-processing', {
      reportId: reportId.trim(),
    });
    return response.data;
  } catch (error: any) {
    console.error("Error pausing processing:", error);

    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    } else if (error.response?.status === 404) {
      throw new Error('Report not found. Please check the report ID.');
    } else {
      throw new Error('Error pausing processing. Please try again.');
    }
  }
};

export const resumeProcessing = async (reportId: string) => {
  try {
    const response = await api.post('/taqeemSubmission/resume-processing', {
      reportId: reportId.trim(),
    });
    return response.data;
  } catch (error: any) {
    console.error("Error resuming processing:", error);

    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    } else if (error.response?.status === 404) {
      throw new Error('Report not found. Please check the report ID.');
    } else {
      throw new Error('Error resuming processing. Please try again.');
    }
  }
};

export const submitMacro = async (reportId: string, tabsNum: number) => {
  try {
    const response = await api.post('/taqeemSubmission/edit-macros', {
      reportId: reportId.trim(),
      tabsNum,
    });
    return response.data;
  } catch (error: any) {
    console.error("Error submitting macro:", error);

    // Handle specific error cases
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    } else if (error.response?.status === 404) {
      throw new Error('Report not found. Please check the report ID.');
    } else if (error.response?.status === 400) {
      throw new Error('Invalid report ID format.');
    } else if (error.response?.status === 422) {
      throw new Error('Macro validation failed. Please check the report data.');
    } else if (error.message?.includes('timeout')) {
      throw new Error('Submission timeout. Please try again.');
    } else {
      throw new Error('Error submitting macro. Please try again.');
    }
  }
};