import React, { useState, useEffect } from 'react';
import './DragAndDrop.css';

function DragAndDrop({ options, userAnswer, onAnswerChange, correctOrder }) {
  const [draggedItem, setDraggedItem] = useState(null);
  
  // Number of drop zones should match the number of items in correct order
  const numberOfDropZones = correctOrder && Array.isArray(correctOrder) 
    ? correctOrder.length 
    : options.length;
  
  const [dropZones, setDropZones] = useState(() => {
    const initial = Array(numberOfDropZones).fill(null);
    if (userAnswer && userAnswer.length > 0) {
      userAnswer.forEach((index, position) => {
        if (index !== null && index !== undefined && position < numberOfDropZones) {
          initial[position] = { index, text: options[index] };
        }
      });
    }
    return initial;
  });

  // Sync dropZones with userAnswer prop when it changes (e.g., when navigating between questions)
  useEffect(() => {
    const initial = Array(numberOfDropZones).fill(null);
    if (userAnswer && userAnswer.length > 0) {
      userAnswer.forEach((index, position) => {
        if (index !== null && index !== undefined && position < numberOfDropZones) {
          initial[position] = { index, text: options[index] };
        }
      });
    }
    setDropZones(initial);
  }, [userAnswer, numberOfDropZones, options]);

  const handleDragStart = (e, optionIndex) => {
    setDraggedItem({ index: optionIndex, text: options[optionIndex] });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, dropZoneIndex) => {
    e.preventDefault();
    if (draggedItem) {
      const newDropZones = [...dropZones];
      
      // Remove item from previous position if it exists
      const previousIndex = newDropZones.findIndex(
        zone => zone && zone.index === draggedItem.index
      );
      if (previousIndex !== -1) {
        newDropZones[previousIndex] = null;
      }

      // If drop zone already has an item, swap them
      if (newDropZones[dropZoneIndex]) {
        const existingItem = newDropZones[dropZoneIndex];
        if (previousIndex !== -1) {
          newDropZones[previousIndex] = existingItem;
        }
      }

      // Place dragged item in drop zone
      newDropZones[dropZoneIndex] = draggedItem;
      setDropZones(newDropZones);

      // Update answer - preserve ALL positions including nulls
      // This ensures partial answers maintain position information
      // and questions aren't marked as fully answered until all positions are filled
      const answer = newDropZones.map(zone => zone ? zone.index : null);
      onAnswerChange(answer);
    }
    setDraggedItem(null);
  };

  const handleRemoveFromDropZone = (dropZoneIndex) => {
    const newDropZones = [...dropZones];
    newDropZones[dropZoneIndex] = null;
    setDropZones(newDropZones);
    
    // Update answer - preserve ALL positions including nulls
    // This ensures partial answers maintain position information
    const answer = newDropZones.map(zone => zone ? zone.index : null);
    onAnswerChange(answer);
  };

  const availableOptions = options.filter((option, index) => {
    return !dropZones.some(zone => zone && zone.index === index);
  });

  return (
    <div className="drag-and-drop">
      <div className="drag-drop-container">
        <div className="options-panel">
          <h4>Options</h4>
          <div className="options-list">
            {availableOptions.map((option, index) => {
              const originalIndex = options.indexOf(option);
              return (
                <div
                  key={originalIndex}
                  className="draggable-item"
                  draggable
                  onDragStart={(e) => handleDragStart(e, originalIndex)}
                >
                  {option}
                </div>
              );
            })}
          </div>
        </div>

        <div className="drop-zones-panel">
          <h4>Drop Zones</h4>
          <div className="drop-zones">
            {dropZones.map((zone, index) => (
              <div
                key={index}
                className="drop-zone"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
              >
                <div className="drop-zone-label">Position {index + 1}</div>
                {zone ? (
                  <div className="dropped-item">
                    <span>{zone.text}</span>
                    <button
                      className="remove-button"
                      onClick={() => handleRemoveFromDropZone(index)}
                      aria-label="Remove item"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="drop-zone-placeholder">Drop item here</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DragAndDrop;

