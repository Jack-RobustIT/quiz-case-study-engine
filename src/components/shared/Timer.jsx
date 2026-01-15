import React from 'react';
import { formatTime } from '../../utils/helpers';
import './Timer.css';

function Timer({ timeRemaining }) {
  const isLowTime = timeRemaining < 300; // Less than 5 minutes
  const isCritical = timeRemaining < 60; // Less than 1 minute

  return (
    <div className={`timer ${isCritical ? 'timer-critical' : isLowTime ? 'timer-low' : ''}`}>
      <span className="timer-label">Time Remaining:</span>
      <span className="timer-value">{formatTime(timeRemaining)}</span>
    </div>
  );
}

export default Timer;

