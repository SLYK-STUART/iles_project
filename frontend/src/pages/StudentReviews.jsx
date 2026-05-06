import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import "./StudentReviews.css";

export default function StudentReviews() {
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await API.get("logbook/reviews/");
        setReviews(res.data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load reviews");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  if (loading) return <p className="loading">Loading reviews...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="reviews-page">
 
      <div className="reviews-header">
        <button onClick={() => navigate(-1)}>← Back</button>
        <h1>Supervisor Reviews</h1>
      </div>
 
      <div className="reviews-container">

        {reviews.length === 0 ? (
          <p className="no-reviews">No reviews yet</p>
        ) : (
          reviews.map((r) => (
            <div key={r.id} className="review-card">

              <div className="review-top">
                <span className={`status ${r.new_status.toLowerCase()}`}>
                  {r.new_status}
                </span>

                <small>
                  {new Date(r.reviewed_at).toLocaleString()}
                </small>
              </div>

              <p className="review-comment">
                {r.comment || "No comment provided"}
              </p>

              <div className="review-footer">
                <small>Log Week: {r.week_start_date}</small>
              </div>

            </div>
          ))
        )}

      </div>
    </div>
  );
}