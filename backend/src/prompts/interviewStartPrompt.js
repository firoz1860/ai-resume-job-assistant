export function buildInterviewStartPrompt({ targetRole, interviewType, difficulty, skills, projects, experience, jobDescription }) {
  return `
You are an experienced technical interviewer.

Create only one interview question.

Candidate details:
Target role: ${targetRole}
Interview type: ${interviewType}
Difficulty: ${difficulty}
Skills: ${skills || 'Not provided'}
Projects: ${projects || 'Not provided'}
Experience: ${experience || 'Not provided'}
Job description: ${jobDescription || 'Not provided'}

Rules:
- Ask only one question.
- Question should be specific to the candidate profile.
- Do not give the answer.
- Keep question clear and interview-like.
- If project-based interview, ask about architecture, decisions, challenges, or impact.
- If technical interview, ask role-specific concepts.
- If HR interview, ask a behavioral question.
- If system design, ask a practical design question.
`.trim();
}
