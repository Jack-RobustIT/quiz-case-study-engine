import React, { useState } from 'react';
import { parseContentWithTables } from '../../utils/helpers';
import './CaseStudyContextPanel.css';

function CaseStudyContextPanel({ caseStudyData }) {
  const [expandedSections, setExpandedSections] = useState({
    instructions: true,
    overview: false,
    existingEnvironment: false,
    requirements: false,
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const toggleSubSection = (section, subSection) => {
    // For nested sections, we can expand/collapse them
    // This is a simplified version - you can enhance it
  };

  if (!caseStudyData) return null;

  return (
    <div className="context-panel">
      <div className="context-section">
        <button
          className="context-section-header"
          onClick={() => toggleSection('instructions')}
        >
          <span>Instructions</span>
          <span className="expand-icon">{expandedSections.instructions ? '−' : '+'}</span>
        </button>
        {expandedSections.instructions && (
          <div className="context-section-content">
            <p>
              This case study presents a scenario with multiple questions. Review the context
              information in the left panel and answer the questions in the right panel. You can
              navigate between questions using the question buttons or Previous/Next buttons.
            </p>
            <p>
              Use the bookmark feature to mark questions for later review. The timer shows your
              remaining time. When you're ready, submit your answers to see your results.
            </p>
          </div>
        )}
      </div>

      {caseStudyData.overview && (
        <div className="context-section">
          <button
            className="context-section-header"
            onClick={() => toggleSection('overview')}
          >
            <span>Overview</span>
            <span className="expand-icon">{expandedSections.overview ? '−' : '+'}</span>
          </button>
          {expandedSections.overview && (
            <div className="context-section-content">
              {caseStudyData.overview.generalOverview && (
                <div className="context-subsection">
                  <h4>General Overview</h4>
                  <div>{parseContentWithTables(caseStudyData.overview.generalOverview)}</div>
                </div>
              )}
              {caseStudyData.overview.companyOverview && (
                <div className="context-subsection">
                  <h4>Company Overview</h4>
                  <div>{parseContentWithTables(caseStudyData.overview.companyOverview)}</div>
                </div>
              )}
              {caseStudyData.overview.itStructure && (
                <div className="context-subsection">
                  <h4>IT Structure</h4>
                  <div>{parseContentWithTables(caseStudyData.overview.itStructure)}</div>
                </div>
              )}
              {caseStudyData.overview.additionalInfo && (
                <div className="context-subsection">
                  {Object.entries(caseStudyData.overview.additionalInfo).map(([key, value]) => (
                    <div key={key}>
                      <h4>{key}</h4>
                      {typeof value === 'string' ? (
                        <div>{parseContentWithTables(value)}</div>
                      ) : (
                        <p>{value}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {caseStudyData.existingEnvironment && (
        <div className="context-section">
          <button
            className="context-section-header"
            onClick={() => toggleSection('existingEnvironment')}
          >
            <span>Existing Environment</span>
            <span className="expand-icon">{expandedSections.existingEnvironment ? '−' : '+'}</span>
          </button>
          {expandedSections.existingEnvironment && (
            <div className="context-section-content">
              {Object.entries(caseStudyData.existingEnvironment).map(([key, value]) => (
                <div key={key} className="context-subsection">
                  <h4>{key.replace(/([A-Z])/g, ' $1').trim()}</h4>
                  {typeof value === 'string' ? (
                    <div>{parseContentWithTables(value)}</div>
                  ) : (
                    <pre>{JSON.stringify(value, null, 2)}</pre>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {caseStudyData.requirements && (
        <div className="context-section">
          <button
            className="context-section-header"
            onClick={() => toggleSection('requirements')}
          >
            <span>Requirements</span>
            <span className="expand-icon">{expandedSections.requirements ? '−' : '+'}</span>
          </button>
          {expandedSections.requirements && (
            <div className="context-section-content">
              {Object.entries(caseStudyData.requirements).map(([key, value]) => (
                <div key={key} className="context-subsection">
                  <h4>{key.replace(/([A-Z])/g, ' $1').trim()}</h4>
                  {typeof value === 'string' ? (
                    <div>{parseContentWithTables(value)}</div>
                  ) : (
                    <pre>{JSON.stringify(value, null, 2)}</pre>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CaseStudyContextPanel;

