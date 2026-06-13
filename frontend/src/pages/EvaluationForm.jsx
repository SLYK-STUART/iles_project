import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import {
  ArrowLeft,
  User,
  Building2,
  Calendar,
  ClipboardCheck,
  FileText,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import "./EvaluationPage.css";

export default function EvaluationPage({
  title = "Academic Evaluation",
}) {
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

          d.existing_evaluation.items.forEach((item) => {
            scoreMap[item.criteria] = item.score;
          });

          setScores(scoreMap);
          setComments(d.existing_evaluation.comments || "");
        }
      } catch (err) {
        console.error(err);
        alert("Failed to load evaluation data");
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
        today: new Date(),
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
      today,
    };
  };

  const {
    totalWeeks,
    currentWeek,
    missingWeeks,
  } = calculateStats();

  const handleScoreChange = (criteriaId, value) => {
    setScores((prev) => ({
      ...prev,
      [criteriaId]: parseFloat(value) || 0,
    }));
  };

  const totalScore = useMemo(() => {
    return criteria.reduce((sum, c) => {
      return sum + (Number(scores[c.id]) || 0);
    }, 0);
  }, [scores, criteria]);

  const saveDraft = async () => {
    setSubmitting(true);

    try {
      const payload = {
        placement: placementId,
        comments: comments.trim(),
        items: criteria.map((c) => ({
          criteria: c.id,
          score: scores[c.id] || 0,
        })),
      };

      if (existingEval?.exists) {
        await API.put(
          `evaluations/evaluations/${existingEval.id}/`,
          payload
        );
      } else {
        const res = await API.post(
          "evaluations/evaluations/",
          payload
        );

        setExistingEval({
          exists: true,
          id: res.data.id,
          status: "DRAFT",
        });
      }

      alert("Draft saved successfully");
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
      await API.post(
        `evaluations/evaluations/${existingEval.id}/submit/`
      );

      alert("Evaluation submitted successfully");
      navigate(-1);
    } catch (err) {
      console.error(err);
      alert("Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  const isSubmitted =
    existingEval?.status === "SUBMITTED";

  if (loading)
    return <p className="loading">Loading evaluation...</p>;

   return (
  <div className="student-dashboard">
 
    <header className="sd-topbar">
      <div className="sd-topbar-left">
        <span className="sd-logo-mark">EV</span>
        <h1>{title}</h1>
      </div>

      <div className="sd-topbar-right">
        <button
          className="sd-btn sd-btn-ghost"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={16} />
          Back
        </button>

        {existingEval?.exists && (
          <span className={`eval-status ${existingEval.status.toLowerCase()}`}>
            {existingEval.status}
          </span>
        )}
      </div>
    </header>

    <main className="sd-main">
 
      <div className="sd-welcome">
        <h2>
          Evaluate <span className="sd-name">{data?.student?.name}</span>
        </h2>

        <p className="sd-subtitle">
          Internship Performance Assessment
        </p>
      </div>
 
      <section className="sd-section">

        <div className="sd-stats-grid">

          <div className="sd-stat-card">
            <span className="sd-stat-label">
              Student
            </span>

            <span className="sd-stat-num">
              {data?.student?.name}
            </span>
          </div>

          <div className="sd-stat-card">
            <span className="sd-stat-label">
              Company
            </span>

            <span className="sd-stat-num">
              {data?.company}
            </span>
          </div>

          <div className="sd-stat-card submitted">
            <span className="sd-stat-label">
              Current Week
            </span>

            <span className="sd-stat-num">
              {currentWeek}
            </span>
          </div>

          <div className="sd-stat-card approved">
            <span className="sd-stat-label">
              Total Weeks
            </span>

            <span className="sd-stat-num">
              {totalWeeks}
            </span>
          </div>

          <div className="sd-stat-card rejected">
            <span className="sd-stat-label">
              Missing Logs
            </span>

            <span className="sd-stat-num">
              {missingWeeks}
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
              <dt>Name</dt>
              <dd>{data?.student?.name}</dd>
            </div>

            <div className="sd-dl-row">
              <dt>Company</dt>
              <dd>{data?.company}</dd>
            </div>

            <div className="sd-dl-row">
              <dt>Start Date</dt>
              <dd>{data?.start_date}</dd>
            </div>

            <div className="sd-dl-row">
              <dt>End Date</dt>
              <dd>{data?.end_date}</dd>
            </div>

          </dl>
        </div>

        <div className="sd-card">
          <h3 className="sd-card-title">
            Evaluation Summary
          </h3>

          <dl className="sd-dl">

            <div className="sd-dl-row">
              <dt>Total Logs</dt>
              <dd>{logs.length}</dd>
            </div>

            <div className="sd-dl-row">
              <dt>Missing Weeks</dt>
              <dd>{missingWeeks}</dd>
            </div>

            <div className="sd-dl-row">
              <dt>Total Score</dt>
              <dd>{totalScore.toFixed(2)}</dd>
            </div>

            <div className="sd-dl-row">
              <dt>Status</dt>
              <dd>
                {existingEval?.status || "Not Started"}
              </dd>
            </div>

          </dl>
        </div>

      </section>
 
      <section className="sd-section">

        <h3 className="sd-section-title">
          Weekly Logbook Entries
        </h3>

        {logs.length > 0 ? (
          <div className="sd-eval-details">

            {logs.map((log, index) => (
              <div
                key={index}
                className="sd-eval-card"
              >
                <div className="log-card-header">

                  <h4>
                    Week of{" "}
                    {new Date(log.week).toLocaleDateString()}
                  </h4>

                  <span
                    className={`log-status ${log.status.toLowerCase()}`}
                  >
                    {log.status}
                  </span>

                </div>

                <div className="log-section">
                  <strong>Activities</strong>
                  <p>{log.activities}</p>
                </div>

                {log.challenges && (
                  <div className="log-section">
                    <strong>Challenges</strong>
                    <p>{log.challenges}</p>
                  </div>
                )}

                {log.learning_outcomes && (
                  <div className="log-section">
                    <strong>Learning Outcomes</strong>
                    <p>{log.learning_outcomes}</p>
                  </div>
                )}
              </div>
            ))}

          </div>
        ) : (
          <div className="sd-empty-state">
            <FileText size={40} />
            <p className="sd-empty-title">
              No weekly logs submitted yet
            </p>
          </div>
        )}

      </section>
 
      <section className="sd-section">

        <h3 className="sd-section-title">
          Evaluation Criteria
        </h3>

        <div className="sd-card">

          <div className="criteria-list">

            {criteria.map((c) => (
              <div
                key={c.id}
                className="criterion-card"
              >
                <div className="criterion-info">
                  <h4>{c.name}</h4>
                  <span>
                    Weight: {c.weight}%
                  </span>
                </div>

                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={scores[c.id] || ""}
                  disabled={isSubmitted}
                  onChange={(e) =>
                    handleScoreChange(
                      c.id,
                      e.target.value
                    )
                  }
                />
              </div>
            ))}

          </div>

          <div className="comments-section">

            <label>
              Supervisor Comments
            </label>

            <textarea
              value={comments}
              disabled={isSubmitted}
              placeholder="Provide overall evaluation comments..."
              onChange={(e) =>
                setComments(e.target.value)
              }
            />

          </div>

        </div>

      </section>
 
      {!isSubmitted && (
        <section className="sd-section">

          <div className="eval-actions">

            <button
              className="sd-btn sd-btn-ghost"
              onClick={saveDraft}
              disabled={submitting}
            >
              {existingEval?.exists
                ? "Update Draft"
                : "Save Draft"}
            </button>

            {existingEval?.exists && (
              <button
                className="sd-btn"
                onClick={submitEvaluation}
                disabled={submitting}
              >
                Submit Evaluation
              </button>
            )}

          </div>

        </section>
      )}

    </main>

  </div>
);
}