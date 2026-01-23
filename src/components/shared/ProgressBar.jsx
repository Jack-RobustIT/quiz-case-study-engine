import React from 'react';
import './ProgressBar.css';

function ProgressBar({ progress, answered, total, bookmarked }) {
  return (
    <section className="progress-container" aria-label="Quiz progress">
      <dl className="progress-stats">
        <div className="progress-stat">
          <dt className="progress-label">Completed:</dt>
          <dd className="progress-value">{answered}/{total}</dd>
        </div>
        {bookmarked > 0 && (
          <div className="progress-stat">
            <dt className="progress-label">Bookmarked:</dt>
            <dd className="progress-value">{bookmarked}</dd>
          </div>
        )}
        <div className="progress-stat">
          <dt className="progress-label">Progress:</dt>
          <dd className="progress-value">{Math.round(progress)}%</dd>
        </div>
      </dl>
      <div className="progress-bar-wrapper">
        <div 
          className="progress-bar"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin="0"
          aria-valuemax="100"
          style={{ width: `${progress}%` }}
        />
      </div>
    </section>
  );
}

export default ProgressBar;

