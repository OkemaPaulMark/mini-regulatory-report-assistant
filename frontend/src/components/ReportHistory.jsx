import { useState, useEffect } from "react";
import axios from "axios";

export default function ReportHistory() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/reports");
        setReports(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load report history.");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-emerald-800 mb-6 text-center">
        Report History
      </h2>

      {loading && <p className="text-center text-gray-600">Loading reports...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}
      
      {!loading && !error && reports.length === 0 && (
        <p className="text-center text-gray-600">No reports found.</p>
      )}

      {!loading && !error && reports.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-emerald-600 text-white uppercase text-sm">
                <th className="px-6 py-4 border-b border-emerald-700">ID</th>
                <th className="px-6 py-4 border-b border-emerald-700">Drug</th>
                <th className="px-6 py-4 border-b border-emerald-700">Adverse Events</th>
                <th className="px-6 py-4 border-b border-emerald-700">Severity</th>
                <th className="px-6 py-4 border-b border-emerald-700">Outcome</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r, idx) => (
                <tr
                  key={r.id}
                  className={`text-center border-b ${
                    idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                  } hover:bg-emerald-50 transition-colors`}
                >
                  <td className="px-6 py-4 font-medium">{r.id}</td>
                  <td className="px-6 py-4">{r.drug || "N/A"}</td>
                  <td className="px-6 py-4">
                    {r.adverse_events?.length > 0
                      ? r.adverse_events.join(", ")
                      : "None"}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      r.severity === 'severe' ? 'bg-red-100 text-red-800' :
                      r.severity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                      r.severity === 'mild' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {r.severity || "N/A"}
                    </span>
                  </td>
                  <td className="px-6 py-4">{r.outcome || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}