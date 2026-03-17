import React from 'react';
import './ScoreRing.css';

interface ScoreRingProps {
  score: number;
}

export const ScoreRing: React.FC<ScoreRingProps> = ({ score }) => {
  return (
    <div className="gs-score-ring">
      <div className="gs-score-inner">
        <span className="gs-score-value">{score}</span>
        <span className="gs-score-label">out of 100</span>
      </div>
    </div>
  );
};
