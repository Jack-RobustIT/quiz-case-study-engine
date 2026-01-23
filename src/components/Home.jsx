import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "./ui/theme-toggle";
import "./Home.css";

function Home() {
  const [mockExams, setMockExams] = useState([]);
  const [knowledgeChecks, setKnowledgeChecks] = useState([]);
  const [caseStudies, setCaseStudies] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadQuizList();
  }, []);

  const loadQuizList = async () => {
    try {
      // Simple path configuration - just change the path here to load different JSON files
      // Paths are relative to /JSON/ directory
      const mockExamPaths = [
        "mock-exams/220-1001/220-1001-mock-exam-1.json",
        "mock-exams/python-introduction/python-introduction-mock-exam-1.json",
        // Add more mock exams by adding paths like:
        // "mock-exams/AZ-900/az-900-mock-1.json",
      ];

      const knowledgeCheckPaths = [
        "knowledge-checks/ai-900-knowledge-checks/ai-900-knowledge-checks-1.json",
        "knowledge-checks/ai-900-knowledge-checks/ai-900-knowledge-checks-2.json",
        "knowledge-checks/ai-900-knowledge-checks/ai-900-knowledge-checks-3.json",
        "knowledge-checks/ai-900-knowledge-checks/ai-900-knowledge-checks-4.json",
        "knowledge-checks/ai-900-knowledge-checks/ai-900-knowledge-checks-5.json",
        "knowledge-checks/ai-900-knowledge-checks/ai-900-knowledge-checks-6.json",

        // Add more knowledge checks by adding paths like:
        // "knowledge-checks/ai-900-knowledge-checks/ai-900-knowledge-checks-1.json",
      ];

      const caseStudyPaths = [
        "case-studies/dp-700/case-study-1.json",
        "case-studies/ai-102/case-study-1.json",
        // Add more case studies by adding paths like:
        // "case-studies/ai-102/case-study-1.json",
      ];

      // Fetch and extract names for mock exams
      const mockExamsWithNames = await Promise.all(
        mockExamPaths.map(async (path) => {
          try {
            const response = await fetch(
              `${import.meta.env.BASE_URL}JSON/${path}`
            );
            if (!response.ok) {
              throw new Error(`Failed to fetch ${path}`);
            }
            const data = await response.json();
            return { name: data[0]?.quizName || path, path };
          } catch (error) {
            console.error(`Error loading mock exam ${path}:`, error);
            return { name: path, path };
          }
        })
      );

      // Fetch and extract names for knowledge checks
      const knowledgeChecksWithNames = await Promise.all(
        knowledgeCheckPaths.map(async (path) => {
          try {
            const response = await fetch(
              `${import.meta.env.BASE_URL}JSON/${path}`
            );
            if (!response.ok) {
              throw new Error(`Failed to fetch ${path}`);
            }
            const data = await response.json();
            return { name: data[0]?.quizName || path, path };
          } catch (error) {
            console.error(`Error loading knowledge check ${path}:`, error);
            return { name: path, path };
          }
        })
      );

      // Fetch and extract names for case studies
      const caseStudiesWithNames = await Promise.all(
        caseStudyPaths.map(async (path) => {
          try {
            const response = await fetch(
              `${import.meta.env.BASE_URL}JSON/${path}`
            );
            if (!response.ok) {
              throw new Error(`Failed to fetch ${path}`);
            }
            const data = await response.json();
            return { name: data.caseStudyName || path, path };
          } catch (error) {
            console.error(`Error loading case study ${path}:`, error);
            return { name: path, path };
          }
        })
      );

      setMockExams(mockExamsWithNames);
      setKnowledgeChecks(knowledgeChecksWithNames);
      setCaseStudies(caseStudiesWithNames);
      setLoading(false);
    } catch (error) {
      console.error("Error loading quiz list:", error);
      setLoading(false);
    }
  };

  const handleQuizSelect = (path) => {
    // Encode the path to handle subfolders (e.g., mock-exams/AZ-900/file.json)
    const encodedPath = encodeURIComponent(path);
    navigate(`/quiz/${encodedPath}`);
  };

  const handleCaseStudySelect = (path) => {
    // Encode the path to handle subfolders (e.g., case-studies/ai-102/case-study-1.json)
    const encodedPath = encodeURIComponent(path);
    navigate(`/case-study/${encodedPath}`);
  };

  if (loading) {
    return <div className="home-loading">Loading...</div>;
  }

  return (
    <div className="home">
      <header className="home-header">
        <div className="flex justify-between items-center w-full">
          <div>
            <h1>Mock Quiz & Case Study Engine</h1>
            <p>
              Prepare for your IT certification exams with comprehensive mock
              tests and case studies
            </p>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <div className="home-content">
        <section className="quiz-section">
          <h2>Mock Exams</h2>
          <div className="quiz-list">
            {mockExams.map((exam, index) => (
              <button
                key={index}
                className="quiz-card"
                onClick={() => handleQuizSelect(exam.path)}
              >
                <h3>{exam.name}</h3>
                <span className="quiz-type">Mock Exam</span>
              </button>
            ))}
          </div>
        </section>

        <section className="quiz-section">
          <h2>Knowledge Checks</h2>
          <div className="quiz-list">
            {knowledgeChecks.map((check, index) => (
              <button
                key={index}
                className="quiz-card"
                onClick={() => handleQuizSelect(check.path)}
              >
                <h3>{check.name}</h3>
                <span className="quiz-type">Knowledge Check</span>
              </button>
            ))}
          </div>
        </section>

        <section className="quiz-section">
          <h2>Case Studies</h2>
          <div className="quiz-list">
            {caseStudies.map((study, index) => (
              <button
                key={index}
                className="quiz-card"
                onClick={() => handleCaseStudySelect(study.path)}
              >
                <h3>{study.name}</h3>
                <span className="quiz-type">Case Study</span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Home;
