/**
 * Service for posting quiz results to the legacy ASP.NET endpoint.
 * The backend expects classic form fields, mirroring the old mock system.
 */

const RESULTS_ENDPOINT =
  'https://upskills.academy/your-training-modules/mock-quiz/score-extractor.aspx';

/**
 * Calculates the percentage score from the results object.
 * Falls back to deriving it from correct/total if needed.
 * @param {Object} results
 * @returns {number} percentage score (0-100)
 */
function getScorePercentage(results) {
  if (Number.isFinite(results?.score)) {
    return results.score;
  }

  const total = results?.total || results?.questionResults?.length || 0;
  const correct = results?.correct ?? 0;

  if (!total) return 0;

  return Math.round((correct / total) * 100);
}

/**
 * Posts quiz results to the ASP.NET endpoint used by the existing system.
 *
 * Field mapping (front-end -> backend Page.Request.Form name):
 * - AchievedScore  -> rawscore    (number of correct answers)
 * - maxscore       -> maxscore    (total number of questions)
 * - accuracy       -> accuracy    (percentage score)
 * - MocknumberVal  -> MockNumber  (mock identifier, we use quizName)
 * - ExamIDVal      -> ExamID      (exam identifier, we use quizType)
 *
 * @param {Object} results - Quiz results object from Quiz / Results components
 * @param {string} quizName - Quiz name (used as MocknumberVal)
 * @param {string} quizType - Quiz type / exam id (used as ExamIDVal)
 * @returns {Promise<void>}
 */
export async function postResultsToBackend(results, quizName, quizType) {
  try {
    if (!results) {
      console.warn('postResultsToBackend: No results provided, skipping post.');
      return;
    }

    const totalQuestions =
      results.total || results.questionResults?.length || 0;
    const correctAnswers = results.correct ?? 0;
    const scorePercentage = getScorePercentage(results);

    // Build form-encoded payload to match legacy ASP.NET expectations
    const formData = new URLSearchParams();

    // These names correspond to the original Page.Request.Form lookups:
    // rawscore = Page.Request.Form(\"AchievedScore\")
    // maxscore = Page.Request.Form(\"maxscore\")
    // accuracy = Page.Request.Form(\"accuracy\")
    // MockNumber = Page.Request.Form(\"MocknumberVal\")
    // ExamID = Page.Request.Form(\"ExamIDVal\")
    formData.append('AchievedScore', String(correctAnswers));
    formData.append('maxscore', String(totalQuestions));
    formData.append('accuracy', String(scorePercentage));
    formData.append('MocknumberVal', quizName || '');
    formData.append('ExamIDVal', quizType || '');

    await fetch(RESULTS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
      // We do not use credentials by default; if the legacy system
      // later requires cookies, this can be revisited:
      // credentials: 'include',
    });
  } catch (error) {
    // Do not surface errors to the user; log for diagnostics only
    console.error('Failed to post quiz results to backend:', error);
  }
}

