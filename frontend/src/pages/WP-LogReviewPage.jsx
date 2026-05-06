import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { ArrowLeft, User, Calendar, CheckCircle, XCircle } from "lucide-react";
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
      setError("Failed to load weekly log");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLog();
  }, [logId]);

  const handleReview = async (action) => {
    if (!comment.trim() && action === "reject") {
      setError("Please provide a comment when rejecting a log.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await API.post(`logbook/logs/${logId}/review/`, {
        action: action,
        comment: comment.trim()
      });

      alert(`Log ${action === "approve" ? "Approved" : "Rejected"} successfully!`);
      navigate("/wp-supervisor");

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to review log");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="loading">Loading log details...</p>;
  if (error && !log) return <p className="error">{error}</p>;

  return (
    <div className="log-review-page">
      {/* Top Navigation */}
      <div className="review-topbar">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={22} />
          Back to Dashboard
        </button>
        <div className="week-info">
          Week of {log?.week_start_date ? new Date(log.week_start_date).toLocaleDateString('en-US', { 
            month: 'long', day: 'numeric', year: 'numeric' 
          }) : ''}
        </div>
      </div>

      <div className="review-content">
        {/* Student Header */}
        <div className="student-header">
          <div className="student-avatar">
            <User size={48} />
          </div>
          <div>
            <h1>{log?.student_name}</h1>
            <p className="company">{log?.company_name}</p>
          </div>
          <span className={`status-badge ${log?.status?.toLowerCase()}`}>
            {log?.status}
          </span>
        </div>

        {/* Log Content */}
        <div className="log-sections">
          <div className="log-section">
            <h3>Activities Performed</h3>
            <p>{log?.activities || "No activities recorded"}</p>
          </div>

          <div className="log-section">
            <h3>Challenges Faced</h3>
            <p>{log?.challenges || "No challenges reported"}</p>
          </div>

          <div className="log-section">
            <h3>Learning Outcomes</h3>
            <p>{log?.learning_outcomes || "No learning outcomes recorded"}</p>
          </div>
        </div>

        {/* Supervisor Review */}
        <div className="review-section">
          <h3>Supervisor Feedback</h3>
          <textarea
            placeholder="Write your feedback, comments, or suggestions for the student..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          {error && <div className="error-box">{error}</div>}
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button
            className="reject-button"
            disabled={submitting}
            onClick={() => handleReview("reject")}
          >
            <XCircle size={20} />
            Reject Log
          </button>

          <button
            className="approve-button"
            disabled={submitting}
            onClick={() => handleReview("approve")}
          >
            <CheckCircle size={20} />
            Approve Log
          </button>
        </div>
      </div>
    </div>
  );
}