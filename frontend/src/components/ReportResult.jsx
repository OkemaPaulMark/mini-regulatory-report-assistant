import { useState } from "react";
import axios from "axios";

export default function ReportResult({ result }) {
  const [translatedReport, setTranslatedReport] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!result) return null;

  const handleTranslate = async (language) => {
    setLoading(true);
    setTranslatedReport(null);

    try {
      const res = await axios.post("http://127.0.0.1:8000/translate", {
        report: result,
        language: language
      });
      setTranslatedReport(res.data.translated_report);
    } catch (err) {
      console.error(err);
      alert("Error translating report");
    } finally {
      setLoading(false);
    }
  };

  const displayReport = translatedReport || result;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 mt-8">
      <h2 className="text-2xl font-bold text-emerald-800 mb-8 text-center">
        Processed Report
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { label: "Drug", value: displayReport.drug },
          { label: "Severity", value: displayReport.severity },
          { label: "Adverse Events", value: displayReport.adverse_events?.join(", ") },
          { label: "Outcome", value: displayReport.outcome },
        ].map((item, idx) => (
          <div
            key={idx}
            className="p-4 bg-emerald-50 rounded-lg border border-emerald-200"
          >
            <h3 className="font-semibold text-emerald-700 mb-2">{item.label}</h3>
            <p className="text-gray-800">{item.value || "N/A"}</p>
          </div>
        ))}
      </div>

      {result && (
        <div className="mt-8 text-center">
          <div className="flex justify-center space-x-4 mb-4">
            <button
              onClick={() => handleTranslate("fr")}
              className="bg-emerald-600 text-white px-5 py-2 rounded-lg hover:bg-emerald-700 transition-all disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Translating..." : "Translate to French"}
            </button>
            <button
              onClick={() => handleTranslate("sw")}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Translating..." : "Translate to Swahili"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
