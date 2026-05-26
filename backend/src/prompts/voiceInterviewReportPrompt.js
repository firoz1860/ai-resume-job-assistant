export function buildVoiceInterviewReportPrompt({ interviewType, targetRole, conversation }) {
  return `
You are an expert interview evaluator.

Interview type:
${interviewType}

Target role:
${targetRole}

Full interview conversation:
${conversation}

Task:
Generate a final interview report.

Return only valid JSON:
{
  "overallScore": 78,
  "communicationScore": 8,
  "technicalScore": 7,
  "problemSolvingScore": 8,
  "confidenceScore": 8,
  "clarityScore": 8,
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
  "bestAnswer": "summary of best answer",
  "weakestAnswer": "summary of weakest answer",
  "improvementPlan": ["step 1", "step 2", "step 3", "step 4"],
  "recommendedPracticeTopics": ["topic 1", "topic 2", "topic 3"],
  "finalVerdict": "clear final verdict"
}

Rules:
- Be practical for students and freshers.
- Mention exact improvement areas.
- Do not include markdown.
- Do not include extra text outside JSON.
`.trim();
}
