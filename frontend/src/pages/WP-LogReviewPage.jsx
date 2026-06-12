import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import {
  ArrowLeft,
  User,
  Building2,
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  ClipboardCheck,
} from "lucide-react";
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
      const res = await API.get(
        `logbook/logs/${logId}/`
      );

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
    if (
      !comment.trim() &&
      action === "reject"
    ) {
      setError(
        "Please provide a comment when rejecting a log."
      );
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await API.post(
        `logbook/logs/${logId}/review/`,
        {
          action,
          comment: comment.trim(),
        }
      );

      alert(
        `Log ${
          action === "approve"
            ? "Approved"
            : "Rejected"
        } successfully!`
      );

      navigate("/wp-supervisor");
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.error ||
          "Failed to review log"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="sd-loading">
        <div className="sd-spinner" />
        <p>Loading log details...</p>
      </div>
    );
  }

  if (error && !log) {
    return (
      <div className="sd-error-container">
        <p className="sd-error">{error}</p>
      </div>
    );
  }

  return (
    <div className="student-dashboard">

      <header className="sd-topbar">
        <div className="sd-topbar-left">
          <span className="sd-logo-mark">WP</span>
          <h1>Log Review</h1>
        </div>

        <div className="sd-topbar-right">
          <button
            className="sd-btn sd-btn-ghost"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={16} />
            Back
          </button>
        </div>
      </header>

      <main className="sd-main">

        <div className="sd-welcome">
          <h2>
            Review Weekly Log
          </h2>

          <p className="sd-subtitle">
            Review student activities,
            challenges and learning outcomes
          </p>
        </div>

        <section className="sd-section">
          <div className="sd-stats-grid">

            <div className="sd-stat-card">
              <span className="sd-stat-label">
                Student
              </span>
              <span
                className="sd-stat-num"
                style={{ fontSize: "18px" }}
              >
                {log?.student_name || "N/A"}
              </span>
            </div>

            <div className="sd-stat-card">
              <span className="sd-stat-label">
                Company
              </span>
              <span
                className="sd-stat-num"
                style={{ fontSize: "18px" }}
              >
                {log?.company_name || "N/A"}
              </span>
            </div>

            <div className="sd-stat-card submitted">
              <span className="sd-stat-label">
                Week
              </span>
              <span
                className="sd-stat-num"
                style={{ fontSize: "18px" }}
              >
                {log?.week_start_date
                  ? new Date(
                      log.week_start_date
                    ).toLocaleDateString()
                  : "N/A"}
              </span>
            </div>

            <div className="sd-stat-card">
              <span className="sd-stat-label">
                Status
              </span>

              <span
                className={`sd-stat-badge ${
                  log?.status?.toLowerCase() ===
                  "approved"
                    ? "approved"
                    : log?.status?.toLowerCase() ===
                      "rejected"
                    ? "rejected"
                    : "submitted"
                }`}
              >
                {log?.status}
              </span>
            </div>

          </div>
        </section>

        <section className="sd-info-grid">

          <div className="sd-card">
            <h3 className="sd-card-title">
              Student Information
            </h3>

            <dl className="sd-dl">

              <div className="sd-dl-row">
                <dt>
                  <User size={14} />
                </dt>
                <dd>{log?.student_name}</dd>
              </div>

              <div className="sd-dl-row">
                <dt>
                  <Building2 size={14} />
                </dt>
                <dd>{log?.company_name}</dd>
              </div>

              <div className="sd-dl-row">
                <dt>
                  <Calendar size={14} />
                </dt>
                <dd>
                  {log?.week_start_date
                    ? new Date(
                        log.week_start_date
                      ).toLocaleDateString(
                        "en-US",
                        {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        }
                      )
                    : "N/A"}
                </dd>
              </div>

            </dl>
          </div>

          <div className="sd-card">
            <div className="review-summary-card">
              <ClipboardCheck size={28} />
              <div>
                <span>Review Status</span>
                <strong>
                  {log?.status}
                </strong>
              </div>
            </div>
          </div>

        </section>

        <section className="sd-section">
          <h3 className="sd-section-title">
            Weekly Submission
          </h3>

          <div className="sd-eval-details">

            <div className="sd-eval-card">
              <div className="log-content-block">
                <FileText size={18} />

                <div>
                  <h4>
                    Activities Performed
                  </h4>

                  <p>
                    {log?.activities ||
                      "No activities recorded"}
                  </p>
                </div>
              </div>
            </div>

            <div className="sd-eval-card">
              <div className="log-content-block">
                <FileText size={18} />

                <div>
                  <h4>
                    Challenges Faced
                  </h4>

                  <p>
                    {log?.challenges ||
                      "No challenges reported"}
                  </p>
                </div>
              </div>
            </div>

            <div className="sd-eval-card">
              <div className="log-content-block">
                <FileText size={18} />

                <div>
                  <h4>
                    Learning Outcomes
                  </h4>

                  <p>
                    {log?.learning_outcomes ||
                      "No learning outcomes recorded"}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </section>

        <section className="sd-section">
          <h3 className="sd-section-title">
            Supervisor Feedback
          </h3>

          <div className="comments-section">
            <textarea
              placeholder="Write your feedback, comments, or suggestions for the student..."
              value={comment}
              onChange={(e) =>
                setComment(e.target.value)
              }
            />
          </div>

          {error && (
            <div className="review-error">
              {error}
            </div>
          )}

          <div className="action-bar">

            <button
              className="sd-btn sd-btn-danger"
              disabled={submitting}
              onClick={() =>
                handleReview("reject")
              }
            >
              <XCircle size={18} />
              Reject Log
            </button>

            <button
              className="sd-btn review-approve-btn"
              disabled={submitting}
              onClick={() =>
                handleReview("approve")
              }
            >
              <CheckCircle size={18} />
              Approve Log
            </button>

          </div>
        </section>

      </main>
    </div>
  );
}