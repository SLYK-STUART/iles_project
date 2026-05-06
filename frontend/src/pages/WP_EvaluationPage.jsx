import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import "./WP_EvaluationPage.css";

export default function EvaluationPage({ title = "Workplace Evaluation" }) {
  const { placementId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [criteria, setCriteria] = useState([]);
  const [scores, setScores] = useState({});
  const [comments, setComments] = useState("");
  const [existingEval, setExistingEval] = useState(null);
  const [logs, setLogs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
 
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await API.get(`/evaluations/placements/${placementId}/`);
        const d = res.data;

        setData(d);
        setCriteria(d.available_criteria || []);
        setLogs(d.weekly_logs || []);
        setExistingEval(d.existing_evaluation);

        if (d.existing_evaluation?.exists) {
          const scoreMap = {};
          d.existing_evaluation.items.forEach(item => {
            scoreMap[item.criteria] = item.score;
          });
          setScores(scoreMap);
          setComments(d.existing_evaluation.comments || "");
        }
      } catch (err) {
        console.error(err);
        alert("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [placementId]);
 
  const calculateStats = () => {
    if (!data?.start_date) {
      return {
        totalWeeks: 0,
        currentWeek: 0,
        missingWeeks: 0,
        today: new Date()
      };
    }

    const start = new Date(data.start_date);
    const today = new Date();

    const diffTime = today - start;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    const totalWeeks = Math.floor(diffDays / 7) + 1;
    const currentWeek = totalWeeks;

    const submittedLogs = logs.length;
    const missingWeeks = totalWeeks - submittedLogs;

    return {
      totalWeeks,
      currentWeek,
      missingWeeks: missingWeeks > 0 ? missingWeeks : 0,
      today
    };
  };

  const { totalWeeks, currentWeek, missingWeeks, today } = calculateStats();
 
  const handleScoreChange = (criteriaId, value) => {
    setScores(prev => ({ ...prev, [criteriaId]: parseFloat(value) || 0 }));
  };
 
  const saveDraft = async () => {
    setSubmitting(true);
    try {
      const payload = {
        placement: placementId,
        comments: comments.trim(),
        items: criteria.map(c => ({
          criteria: c.id,
          score: scores[c.id] || 0
        }))
      };

      if (existingEval?.exists) {
        await API.put(`evaluations/evaluations/${existingEval.id}/`, payload);
      } else {
        const res = await API.post("evaluations/evaluations/", payload);
        setExistingEval({ exists: true, id: res.data.id, status: "DRAFT" });
      }

      alert("Draft saved successfully!");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "Failed to save");
    } finally {
      setSubmitting(false);
    }
  };
 
  const submitEvaluation = async () => {
    if (!existingEval?.id) return;

    setSubmitting(true);
    try {
      await API.post(`evaluations/evaluations/${existingEval.id}/submit/`);
      alert("Evaluation submitted successfully!");
      navigate(-1);
    } catch (err) {
      console.error(err);
      alert("Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  const isSubmitted = existingEval?.status === "SUBMITTED";

  if (loading) return <p className="loading">Loading...</p>;

  return (
    <div className="evaluation-container">
      <div className="evaluation-header">
        <button onClick={() => navigate(-1)}>← Back</button>
        <h1>{title}</h1>
      </div>
 
      <div className="student-info-card">
        <h2>Student Info</h2>
        <p><strong>Name:</strong> {data?.student?.name}</p>
        <p><strong>Company:</strong> {data?.company}</p>
        <p><strong>Start date:</strong> {data?.start_date}</p>
        <p><strong>End date:</strong> {data?.end_date}</p>
 
        <div style={{ marginTop: "15px", lineHeight: "1.6" }}>
          <p><strong>Current Date:</strong> {today.toDateString()}</p>
          <p><strong>Total Weeks (so far):</strong> {totalWeeks}</p>
          <p><strong>Current Week:</strong> Week {currentWeek}</p>
          <p style={{ color: "#ef4444" }}>
            <strong>Weeks without logs:</strong> {missingWeeks}
          </p>
        </div>
      </div>
 
      {existingEval?.exists && (
        <div className="eval-status">
          <strong>Status:</strong> {existingEval.status}
        </div>
      )}
 
      <div className="logs-section">
        <h2>Student Weekly Logs</h2>
        {logs.length > 0 ? (
          logs.map((log, index) => (
            <div key={index} className="log-card">
              <div className="log-header">
                <h4>
                  Week of{" "}
                  {new Date(log.week).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                  })}
                </h4>
                <span className={`log-status ${log.status.toLowerCase()}`}>
                  {log.status}
                </span>
              </div>

              <div className="log-content">
                <div className="log-field">
                  <strong>Activities:</strong>
                  <p>{log.activities || "No activities recorded"}</p>
                </div>

                {log.challenges && (
                  <div className="log-field">
                    <strong>Challenges:</strong>
                    <p>{log.challenges}</p>
                  </div>
                )}

                {log.learning_outcomes && (
                  <div className="log-field">
                    <strong>Learning Outcomes:</strong>
                    <p>{log.learning_outcomes}</p>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="no-logs">No weekly logs submitted yet.</p>
        )}
      </div>
 
      <div className="evaluation-form">
        <h2>Evaluation Criteria</h2>

        {criteria.map(c => (
          <div key={c.id} className="criterion-row">
            <label>{c.name} <small>({c.weight}%)</small></label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={scores[c.id] || ""}
              disabled={isSubmitted}
              onChange={(e) => handleScoreChange(c.id, e.target.value)}
            />
          </div>
        ))}

        <textarea
          placeholder="Additional comments..."
          value={comments}
          disabled={isSubmitted}
          onChange={(e) => setComments(e.target.value)}
        />

        {!isSubmitted && (
          <div className="actions">
            <button onClick={saveDraft} disabled={submitting}>
              {existingEval?.exists ? "Update Draft" : "Save Draft"}
            </button>

            {existingEval?.exists && (
              <button onClick={submitEvaluation} disabled={submitting}>
                Submit Final Evaluation
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}