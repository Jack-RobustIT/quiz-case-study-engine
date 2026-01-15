import React from 'react';

export function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function isUrl(str) {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * Parses text content that may contain HTML tables and returns an array of React elements
 * @param {string} content - The text content that may contain HTML table tags
 * @returns {Array} Array of React elements (text nodes and table elements)
 */
export function parseContentWithTables(content) {
  if (!content || typeof content !== 'string') {
    return [content];
  }

  const parts = [];
  const tableRegex = /<table[\s\S]*?<\/table>/gi;
  let lastIndex = 0;
  let match;

  while ((match = tableRegex.exec(content)) !== null) {
    // Add text before the table
    if (match.index > lastIndex) {
      const textBefore = content.substring(lastIndex, match.index).trim();
      if (textBefore) {
        // Split by double newlines to create paragraphs
        const paragraphs = textBefore.split(/\n\n+/).filter(p => p.trim());
        paragraphs.forEach((para, idx) => {
          parts.push(
            <p key={`text-${lastIndex}-${idx}`}>{para.trim()}</p>
          );
        });
      }
    }

    // Add the table
    parts.push(
      <div
        key={`table-${match.index}`}
        className="case-study-table-wrapper"
        dangerouslySetInnerHTML={{ __html: match[0] }}
      />
    );

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text after the last table
  if (lastIndex < content.length) {
    const textAfter = content.substring(lastIndex).trim();
    if (textAfter) {
      const paragraphs = textAfter.split(/\n\n+/).filter(p => p.trim());
      paragraphs.forEach((para, idx) => {
        parts.push(
          <p key={`text-${lastIndex}-${idx}`}>{para.trim()}</p>
        );
      });
    }
  }

  // If no tables were found, render as normal paragraphs
  if (parts.length === 0) {
    const paragraphs = content.split(/\n\n+/).filter(p => p.trim());
    return paragraphs.map((para, idx) => (
      <p key={`para-${idx}`}>{para.trim()}</p>
    ));
  }

  return parts;
}

