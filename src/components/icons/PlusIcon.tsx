import React from 'react';

const PlusIcon = () => {
  return (
    <svg style={{height: '10px', width: '10px'}} viewBox="0 0 200 200">
      <rect
        width="25"
        height="200"
        x="87.5"
        y="0"
        rx="10"
      />
      <rect
        width="200"
        height="25"
        x="0"
        y="87.5"
        rx="10"
      />
    </svg>
  );
}

export default PlusIcon
