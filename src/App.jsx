import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { QuizProvider } from './context/QuizContext';
import { CaseStudyProvider } from './context/CaseStudyContext';
import Home from './components/Home';
import Quiz from './components/Quiz/Quiz';
import CaseStudy from './components/CaseStudy/CaseStudy';
import './App.css';

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="react-mocks-ui-theme">
      <Router basename={import.meta.env.BASE_URL}>
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route 
              path="/quiz/*" 
              element={
                <QuizProvider>
                  <Quiz />
                </QuizProvider>
              } 
            />
            <Route 
              path="/case-study/:caseStudyName" 
              element={
                <CaseStudyProvider>
                  <CaseStudy />
                </CaseStudyProvider>
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;

