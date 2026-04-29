import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import "./WP_EvaluationPage.css";

export default function WP_EvaluationPage() {
  const { placementId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [criteria, setCriteria] = useState([]);
  const [scores, setScores] = useState({});
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await API.get(`/evaluations/placements/${placementId}/`);
        setData(res.data);
        setCriteria(res.data.available_criteria || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load evaluation data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [placementId]);

  const handleScoreChange = (criteriaId, value) => {
    setScores(prev => ({
      ...prev,
      [criteriaId]: parseFloat(value) || 0
    }));
    setError("");
  };

  const handleSubmit = async () => {
    if (Object.keys(scores).length !== criteria.length) {
      setError("Please enter scores for all criteria");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const payload = {
        placement: placementId,
        comments: comments.trim(),
        items: criteria.map(c => ({
          criteria: c.id,
          score: scores[c.id]
        }))
      };

      const evalResponse = await API.post("evaluations/evaluations/", payload);

      if (data?.weekly_logs) {
        const submittedLogs = data.weekly_logs.filter(log => log.status === "SUBMITTED");
        
        for (const log of submittedLogs) {
          await API.post(`logbook/logs/${log.id}/review/`, {
            action: "approve",
            comment: "Auto-approved after performance evaluation"
          });
        }
      }

      alert("Performance Evaluation submitted and logs approved successfully!");
      navigate("/wp-supervisor");

    } catch (err) {
      console.error("Submit error:", err);
      setError(err.response?.data?.error || "Failed to submit evaluation");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="loading">Loading evaluation form...</p>;
  if (error && !data) return <p className="error">{error}</p>;

  return (
    <div className="evaluation-container">
      <div className="evaluation-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back to Dashboard
        </button>
        <h1>Workplace Performance Evaluation</h1>
      </div>

      <div className="student-info-card">
        <h2>Student Information</h2>
        <div className="info-grid">
          <p><strong>Name:</strong> {data?.student?.name}</p>
          <p><strong>Company:</strong> {data?.company}</p>
        </div>
      </div>

      <div className="evaluation-form">
        <h2>Performance Criteria</h2>
        
        {error && <p className="form-error">{error}</p>}

        <div className="criteria-list">
          {criteria.map((crit) => (
            <div key={crit.id} className="criterion-row">
              <div className="criterion-info">
                <label>{crit.name}</label>
                {crit.description && <p className="crit-desc">{crit.description}</p>}
              </div>
              <input
                type="number"
                min="0"
                max="100"
                placeholder="0 - 100"
                value={scores[crit.id] || ""}
                onChange={(e) => handleScoreChange(crit.id, e.target.value)}
                className="score-input"
              />
            </div>
          ))}
        </div>

        <div className="comments-section">
          <label>Overall Comments (Optional)</label>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Additional feedback about the student's performance..."
            rows={4}
          />
        </div>

        <button 
          className="submit-btn"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? "Submitting & Approving Logs..." : "Submit Performance Evaluation & Approve Logs"}
        </button>
      </div>
    </div>
  );
}