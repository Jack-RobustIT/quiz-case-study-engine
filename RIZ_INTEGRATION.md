# Legacy ASP.NET results posting (plug-and-play for Riz)

This React app now auto-posts quiz results to the legacy ASP.NET endpoint—no extra “Submit results” click is required. The post happens the moment the results page mounts.

## Where the integration lives

- Helper: `src/utils/resultsService.js`
  - `postResultsToBackend(results, quizName, quizType)` does a `POST` to `https://upskills.academy/your-training-modules/mock-quiz/score-extractor.aspx` using `application/x-www-form-urlencoded`.
- Trigger: `src/components/Quiz/Results.jsx`
  - On results render, a `useEffect` calls `postResultsToBackend(...)` once per view (guarded by a ref).

## Field mapping (matches legacy ASP.NET)

- `AchievedScore` → number of correct answers (`results.correct`)
- `maxscore` → total questions (`results.total` or `questionResults.length`)
- `accuracy` → percentage score (`results.score` if present, else derived from correct/total)
- `MocknumberVal` → quiz name (passed into `Results` as `quizName`)
- `ExamIDVal` → quiz type / exam id (passed into `Results` as `quizType`)

These align with the backend expectations:

```text
rawscore = Page.Request.Form("AchievedScore")
maxscore = Page.Request.Form("maxscore")
accuracy = Page.Request.Form("accuracy")
MockNumber = Page.Request.Form("MocknumberVal")
ExamID = Page.Request.Form("ExamIDVal")
```

## Flow at runtime

1) User submits the quiz.  
2) `Quiz.jsx` computes results and renders `Results`.  
3) `Results.jsx` mounts and immediately:
   - Sends the results email (existing behaviour).
   - Posts results to the ASP.NET endpoint (new behaviour).  
4) Errors in posting are logged to the console only; the learner is never blocked.

## How to change the endpoint or fields

- Endpoint: edit `RESULTS_ENDPOINT` in `src/utils/resultsService.js`.
- Field names/values: adjust the `URLSearchParams` in the same file.
- If cookies/session are ever needed, add `credentials: 'include'` to the fetch options.

## Notes

- The process is fire-and-forget; no UI changes are shown to the learner.
- If you ever need a traditional form-post fallback, we can render a hidden `<form>` in `Results.jsx` and trigger `form.submit()` in the same effect, using the same field names above.
