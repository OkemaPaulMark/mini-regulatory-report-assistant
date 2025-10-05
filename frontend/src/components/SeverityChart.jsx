import { useState, useEffect } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function SeverityChart() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/reports");
        setReports(res.data);

        // Count severity occurrences
        const severityCount = { mild: 0, moderate: 0, severe: 0 };
        res.data.forEach(r => {
          const sev = r.severity?.toLowerCase();
          if (sev && severityCount[sev] !== undefined) {
            severityCount[sev]++;
          }
        });

        // Transform to array for Recharts
        const data = Object.keys(severityCount).map(key => ({
          severity: key.charAt(0).toUpperCase() + key.slice(1),
          count: severityCount[key],
        }));

        setChartData(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load chart data.");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) return <p className="text-center mt-4">Loading chart...</p>;
  if (error) return <p className="text-center mt-4 text-red-500">{error}</p>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h2 className="text-2xl font-bold mb-6 text-emerald-700">Severity Distribution Chart</h2>
      {chartData.length === 0 ? (
        <p className="text-gray-600">No data available.</p>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="severity" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#059669" name="Number of Reports" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
