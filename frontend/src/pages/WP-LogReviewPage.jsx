import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import "./WP_LogReviewPage.css";

export default function WP_LogReviewPage() {
  const { logId } = useParams();
  const navigate = useNavigate();

  const [log, setLog] = useState(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
 
  const fetchLog = async () => {
    setLoading(true);
    try {
      const res = await API.get(`logbook/logs/${logId}/`);
      setLog(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load log");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLog();
  }, [logId]);
 
  const handleReview = async (actionType) => {
    setSubmitting(true);
    setError("");

    try {
      await API.post(`logbook/logs/${logId}/review/`, {
        action: actionType,
        comment: comment
      });

      alert(`Log ${actionType}d successfully`);
      navigate("/wp-supervisor");

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Review failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="loading">Loading log...</p>;
  if (error && !log) return <p className="error">{error}</p>;

  return (
    <div className="review-container">
 
      <div className="review-header">
        <button onClick={() => navigate(-1)} className="back-btn">
          ← Back
        </button>

        <h1>Weekly Log Review</h1>

        <span className={`status ${log.status.toLowerCase()}`}>
          {log.status}
        </span>
      </div>
 
      <div className="card">
        <h2>Student Info</h2>
        <p><strong>Name:</strong> {log.student_name}</p>
        <p><strong>Company:</strong> {log.company_name}</p>
        <p><strong>Week:</strong> {log.week_start_date}</p>
      </div>
 
      <div className="card">
        <h2>Activities</h2>
        <p>{log.activities}</p>
      </div>

      <div className="card">
        <h2>Challenges</h2>
        <p>{log.challenges || "No challenges recorded"}</p>
      </div>

      <div className="card">
        <h2>Learning Outcomes</h2>
        <p>{log.learning_outcomes || "No learning outcomes recorded"}</p>
      </div>
 
      <div className="card">
        <h2>Supervisor Comment</h2>

        <textarea
          placeholder="Write feedback to student..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>
 
      <div className="actions">
        <button
          className="approve-btn"
          disabled={submitting || log.status !== "SUBMITTED"}
          onClick={() => handleReview("approve")}
        >
          Approve
        </button>

        <button
          className="reject-btn"
          disabled={submitting || log.status !== "SUBMITTED"}
          onClick={() => handleReview("reject")}
        >
          Reject
        </button>
      </div>

    </div>
  );
}