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

  const toggleSectionExpansion = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  if (!caseStudyData) return null;

  return (
    <aside className="context-panel" aria-label="Case study context information">
      <section className="context-section">
        <button
          className="context-section-header"
          onClick={() => toggleSectionExpansion('instructions')}
          aria-expanded={expandedSections.instructions}
        >
          <span>Instructions</span>
          <span className="expand-icon" aria-hidden="true">{expandedSections.instructions ? '−' : '+'}</span>
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
      </section>

      {caseStudyData.overview && (
        <section className="context-section">
          <button
            className="context-section-header"
            onClick={() => toggleSectionExpansion('overview')}
            aria-expanded={expandedSections.overview}
          >
            <span>Overview</span>
            <span className="expand-icon" aria-hidden="true">{expandedSections.overview ? '−' : '+'}</span>
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
        </section>
      )}

      {caseStudyData.existingEnvironment && (
        <section className="context-section">
          <button
            className="context-section-header"
            onClick={() => toggleSectionExpansion('existingEnvironment')}
            aria-expanded={expandedSections.existingEnvironment}
          >
            <span>Existing Environment</span>
            <span className="expand-icon" aria-hidden="true">{expandedSections.existingEnvironment ? '−' : '+'}</span>
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
        </section>
      )}

      {caseStudyData.requirements && (
        <section className="context-section">
          <button
            className="context-section-header"
            onClick={() => toggleSectionExpansion('requirements')}
            aria-expanded={expandedSections.requirements}
          >
            <span>Requirements</span>
            <span className="expand-icon" aria-hidden="true">{expandedSections.requirements ? '−' : '+'}</span>
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
        </section>
      )}
    </aside>
  );
}

export default CaseStudyContextPanel;

