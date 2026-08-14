import React from 'react';

export default function Loader({ text = 'Loading...' }) {
  return (
    <div className="loader-container">
      <div className="spinner"></div>
      <div>{text}</div>
    </div>
  );
}
