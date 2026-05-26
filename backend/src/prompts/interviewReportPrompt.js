export function buildInterviewReportPrompt({ conversation }) {
  return `
You are an interview evaluator.

Create final interview report from the full interview conversation.

Conversation:
${conversation}

Return only valid JSON:
{
  "overallScore": 78,
  "communicationScore": 8,
  "technicalScore": 7,
  "problemSolvingScore": 8,
  "confidenceScore": 7,
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "bestAnswer": "candidate's best answer summary",
  "weakestAnswer": "candidate's weakest answer summary",
  "improvementPlan": ["step 1", "step 2", "step 3"],
  "finalVerdict": "short final verdict"
}

Rules:
- Be practical.
- Keep report useful for a fresher or student.
- Mention exact improvement areas.
- Do not include markdown.
- Return valid JSON only.
`.trim();
}
