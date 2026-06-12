import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import Divider from "./Divider";
import "./StudentReviews.css";

const STATUS_META = {
  APPROVED:  { label: "Approved",  cls: "approved"  },
  REJECTED:  { label: "Rejected",  cls: "rejected"  },
  SUBMITTED: { label: "Submitted", cls: "submitted" },
  DRAFT:     { label: "Draft",     cls: "draft"     },
};

function StatusBadge({ status }) {
  const key = status?.toUpperCase();
  const meta = STATUS_META[key] || { label: status || "Unknown", cls: "draft" };
  return <span className={`rv-badge rv-badge--${meta.cls}`}>{meta.label}</span>;
}

export default function StudentReviews() {
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await API.get("logbook/reviews/");
        setReviews(res.data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load reviews.");
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  if (loading) {
    return (
      <div className="rv-loading">
        <div className="rv-spinner" />
        <p>Loading reviews…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rv-error-container">
        <p className="rv-error">{error}</p>
        <button className="sd-btn" onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  const approved  = reviews.filter(r => r.new_status?.toUpperCase() === "APPROVED").length;
  const rejected  = reviews.filter(r => r.new_status?.toUpperCase() === "REJECTED").length;

  return (
    <div className="reviews-page">
 
      <header className="sd-topbar">
        <div className="sd-topbar-left">
          <span className="sd-logo-mark">RV</span>
          <h1>Supervisor Reviews</h1>
        </div>
        <nav className="sd-topbar-right">
          <button className="sd-btn sd-btn-ghost" onClick={() => navigate(-1)}>
            ← Back
          </button>
        </nav>
      </header>

      <main className="rv-main">
 
        {reviews.length > 0 && (
          <section className="sd-section">
            <p className="sd-section-title">Overview</p>
            <div className="rv-stats">
              <div className="rv-stat">
                <span className="rv-stat-num">{reviews.length}</span>
                <span className="rv-stat-label">Total reviews</span>
              </div>
              <div className="rv-stat">
                <span className="rv-stat-num rv-stat-num--green">{approved}</span>
                <span className="rv-stat-label">Approved</span>
              </div>
              <div className="rv-stat">
                <span className="rv-stat-num rv-stat-num--red">{rejected}</span>
                <span className="rv-stat-label">Rejected</span>
              </div>
            </div>
          </section>
        )}
 
        <section className="sd-section">
          <p className="sd-section-title">All reviews</p>

          {reviews.length === 0 ? (
            <div className="rv-empty">
              <span className="rv-empty-icon">📝</span>
              <p className="rv-empty-title">No reviews yet</p>
              <p className="rv-empty-sub">Supervisor feedback on your submitted logs will appear here.</p>
            </div>
          ) : (
            <div className="rv-list">
              {reviews.map((r, index) => (
                <div key={r.id}>
                  <div className="rv-card">

                    <div className="rv-card-top">
                      <div className="rv-card-top-left">
                        <StatusBadge status={r.new_status} />
                      </div>
                      <time className="rv-time">
                        {new Date(r.reviewed_at).toLocaleString("en-GB", {
                          day: "numeric", month: "short", year: "numeric",
                          hour: "2-digit", minute: "2-digit"
                        })}
                      </time>
                    </div>

                    <Divider spacing="sm" />

                    <p className="rv-comment">
                      {r.comment || <span className="rv-no-comment">No comment provided.</span>}
                    </p>

                  </div>

                  {index < reviews.length - 1 && <Divider />}
                </div>
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}