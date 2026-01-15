import React from 'react';
import './ProgressBar.css';

function ProgressBar({ progress, answered, total, bookmarked }) {
  return (
    <div className="progress-container">
      <div className="progress-stats">
        <div className="progress-stat">
          <span className="progress-label">Completed:</span>
          <span className="progress-value">{answered}/{total}</span>
        </div>
        {bookmarked > 0 && (
          <div className="progress-stat">
            <span className="progress-label">Bookmarked:</span>
            <span className="progress-value">{bookmarked}</span>
          </div>
        )}
        <div className="progress-stat">
          <span className="progress-label">Progress:</span>
          <span className="progress-value">{Math.round(progress)}%</span>
        </div>
      </div>
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
    </div>
  );
}

export default ProgressBar;

