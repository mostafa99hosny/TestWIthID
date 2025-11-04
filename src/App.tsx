import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './shared/components/Layout/Layout';
import { TaqeemAuthProvider } from './shared/context/TaqeemAuthContext';
import { SocketProvider } from './shared/context/SocketContext';
import { ProgressProvider } from './shared/context/ProgressContext';

// import ExcelTest from './features/Testing/pages/ExcelTest';
import GetTest from './features/Testing/pages/GetTest';
import TaqeemLoginTest from './features/Testing/pages/TaqeemLoginTest';
import NavigateUploadTest from './features/Testing/pages/NavigateUploadTest';
import WithIDExcelTest from './features/Testing/pages/WithIDExcelTest';

export function App() {
  return (
    <TaqeemAuthProvider>
      <SocketProvider>
        <ProgressProvider>
          <Router>
            <Layout>
              <Routes>
                {/* <Route path="/" element={<ExcelTest />} /> */}
                <Route path="/" element={<TaqeemLoginTest />} />
                <Route path="/testing/with-id" element={<WithIDExcelTest />} />
                <Route path="/testing/get" element={<GetTest />} />
                <Route path="/testing/navigate-upload" element={<NavigateUploadTest />} />
              </Routes>
            </Layout>
          </Router>
        </ProgressProvider>
      </SocketProvider>
    </TaqeemAuthProvider>
  );
}