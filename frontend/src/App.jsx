import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import ReportForm from "./components/ReportForm";
import ReportResult from "./components/ReportResult";
import ReportHistory from "./components/ReportHistory";
import SeverityChart from "./components/SeverityChart";

export default function App() {
  const [result, setResult] = useState(null);

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold text-emerald-800 text-center">
              Mini Regulatory Report Assistant
            </h1>
            {/* <p className="text-lg text-gray-600 text-center mt-2">
              Process adverse event reports
            </p> */}
          </div>
        </header>

        {/* Navigation */}
        <nav className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-center space-x-4 py-4">
              <Link 
                to="/" 
                className="bg-emerald-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-emerald-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Process Report
              </Link>
              <Link 
                to="/history" 
                className="bg-emerald-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-emerald-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Report History
              </Link>
              <Link 
                to="/charts" 
                className="bg-emerald-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-emerald-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Analytics
              </Link>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-center">
            <div className="w-full max-w-6xl">
              <Routes>
                <Route path="/" element={
                  <div className="space-y-8">
                    <ReportForm onResult={setResult} />
                    <ReportResult result={result} />
                  </div>
                } />
                <Route path="/history" element={<ReportHistory />} />
                <Route path="/charts" element={<SeverityChart />} />
              </Routes>
            </div>
          </div>
        </main>
      </div>
    </Router>
  );
}