import React from "react";
import { Tooltip } from "@/components/ui/tooltip";
import "./BookmarkButton.css";

function BookmarkButton({ isBookmarked, onToggle }) {
  const getTooltipContent = () => {
    if (isBookmarked) {
      return "Remove from review later";
    }
    return "Questions marked for review will be reviewed at the end";
  };

  return (
    <Tooltip content={getTooltipContent()}>
      <button
        className={`bookmark-button ${isBookmarked ? "bookmarked" : ""}`}
        onClick={onToggle}
        aria-label={
          isBookmarked ? "Remove from review later" : "Mark for review later"
        }
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill={isBookmarked ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
        <span>{isBookmarked ? "Review Later" : "Review Later"}</span>
      </button>
    </Tooltip>
  );
}

export default BookmarkButton;
