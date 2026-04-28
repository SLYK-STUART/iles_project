import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import "./EvaluationPage.css";   // We'll create this

export default function EvaluationPage() {
  const { placementId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [criteria, setCriteria] = useState([]);
  const [scores, setScores] = useState({});
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch placement data + criteria
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [placementRes, criteriaRes] = await Promise.all([
          API.get(`/evaluations/placements/${placementId}/`),
          API.get("evaluations/criteria/")
        ]);

        setData(placementRes.data);
        setCriteria(criteriaRes.data);
      } catch (err) {
        console.error("Error fetching evaluation data:", err);
        alert("Failed to load evaluation data");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [placementId]);

  const handleScoreChange = (criteriaId, value) => {
    setScores(prev => ({
      ...prev,
      [criteriaId]: parseFloat(value) || 0
    }));
  };

  const handleSubmit = async () => {
    if (Object.keys(scores).length === 0) {
      alert("Please enter scores for all criteria");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        placement: placementId,
        comments: comments.trim(),
        items: Object.keys(scores).map(criteriaId => ({
          criteria: parseInt(criteriaId),
          score: scores[criteriaId]
        }))
      };

      await API.post("evaluations/evaluations/", payload);

      alert("Evaluation submitted successfully!");
      navigate("/ac-supervisor");   // or wherever your dashboard is
    } catch (err) {
      console.error(err);
      alert("Failed to submit evaluation. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="loading">Loading evaluation form...</p>;
  if (!data) return <p className="error">Failed to load student data</p>;

  return (
    <div className="evaluation-container">
      <div className="evaluation-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back to Dashboard
        </button>
        <h1>Academic Evaluation</h1>
      </div>

      {/* Student Information */}
      <div className="student-info-card">
        <h2>Student Information</h2>
        <div className="info-grid">
          <p><strong>Name:</strong> {data.student?.name}</p>
          <p><strong>Email:</strong> {data.student?.email}</p>
          <p><strong>Company:</strong> {data.company}</p>
        </div>
      </div>

      {/* Weekly Logs Summary */}
      <div className="logs-section">
        <h2>Weekly Logs Summary</h2>
        <div className="logs-list">
          {data.weekly_logs && data.weekly_logs.length > 0 ? (
            data.weekly_logs.map((log, index) => (
              <div key={index} className="log-item">
                <span className="week">Week {log.week}</span>
                <span className={`status ${log.status.toLowerCase()}`}>
                  {log.status}
                </span>
                <p className="activities">{log.activities}</p>
              </div>
            ))
          ) : (
            <p>No logs available yet.</p>
          )}
        </div>
      </div>

      {/* Evaluation Form */}
      <div className="evaluation-form">
        <h2>Evaluation Criteria</h2>
        
        <div className="criteria-list">
          {criteria.map((criterion) => (
            <div key={criterion.id} className="criterion-row">
              <div className="criterion-info">
                <label>{criterion.name}</label>
                <span className="weight">({criterion.weight}%)</span>
              </div>
              <input
                type="number"
                min="0"
                max="100"
                placeholder="Score (0-100)"
                value={scores[criterion.id] || ""}
                onChange={(e) => handleScoreChange(criterion.id, e.target.value)}
                className="score-input"
              />
            </div>
          ))}
        </div>

        {/* Comments */}
        <div className="comments-section">
          <label>Overall Comments / Feedback</label>
          <textarea
            placeholder="Provide detailed feedback to the student..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={5}
          />
        </div>

        {/* Submit Button */}
        <button 
          className="submit-evaluation-btn"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? "Submitting Evaluation..." : "Submit Academic Evaluation"}
        </button>
      </div>
    </div>
  );
}