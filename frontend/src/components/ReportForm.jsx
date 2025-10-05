import { useState } from "react";
import axios from "axios";

export default function ReportForm({ onResult }) {
  const [report, setReport] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!report.trim()) {
      alert("Please enter a medical report to process.");
      return;
    }

    setIsProcessing(true);
    try {
      const res = await axios.post("http://127.0.0.1:8000/process-report", { report });
      onResult(res.data); // pass processed result to ReportResult
      setReport(""); // clear textarea
    } catch (err) {
      console.error(err);
      alert("Error processing report");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-emerald-800 mb-2">
          Process Medical Report
        </h2>
        <p className="text-gray-600">
          Paste your medical report below to analyze and extract key information.
        </p>
      </div>

      {/* Report Input */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <textarea
          value={report}
          onChange={(e) => setReport(e.target.value)}
          placeholder="Paste medical report here..."
          className="w-full p-6 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none transition-all"
          rows="10"
        />

        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isProcessing}
            className="px-8 py-4 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-lg font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? "Processing..." : "Process Report"}
          </button>
        </div>
      </form>
    </div>
  );
}
