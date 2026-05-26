export function buildInterviewFeedbackPrompt({ targetRole, interviewType, difficulty, question, answer, history }) {
  return `
You are conducting a live interview.

Evaluate the candidate answer and ask the next question.

Interview context:
Target role: ${targetRole}
Interview type: ${interviewType}
Difficulty: ${difficulty}

Current question:
${question}

Candidate answer:
${answer}

Previous conversation:
${history || 'No previous conversation.'}

Return only valid JSON:
{
  "score": 8,
  "feedback": "specific feedback in simple language",
  "betterAnswer": "a better version of the candidate answer",
  "mistakes": ["mistake 1", "mistake 2"],
  "nextQuestion": "next interview question"
}

Rules:
- Be honest but helpful.
- Do not be too harsh.
- Feedback should be specific.
- Next question should be based on the candidate answer or role.
- Ask only one next question.
- Do not include markdown.
- Return valid JSON only.
`.trim();
}
