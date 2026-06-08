export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface OpenAIChatResponse {
  choices?: Array<{ message?: { content?: string } }>
}

export async function fetchAIChatReply(
  messages: ChatMessage[],
  eventsContext: string,
  restaurantsContext: string,
  courseContext: string,
  apiKey: string,
): Promise<string> {
  const courseSection = courseContext
    ? `\n- 사용자가 이미 담아 둔 코스가 있으면 그 순서·시간을 존중하고, 빈 시간대나 부족한 구간만 보완할 것
- "내 코스", "지금 코스" 질문에는 아래 [사용자 코스]를 기준으로 답변

[사용자 코스]
${courseContext}`
    : ''

  const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      max_tokens: 400,
      messages: [
        {
          role: 'system',
          content: `당신은 광주 관광 AI 가이드입니다. 아래 광주 행사·맛집 목록을 참고해 한국어로 친절하게 답변하세요.
- 3~5문장 이내로 간결하게
- 추천 시 반드시 목록에 있는 **정확한 행사명·맛집명**을 그대로 사용
- 목록에 없는 장소·행사는 지어내지 말 것
- 코스 추천 시 행사 → 명소 → 맛집 → 이동 순서로 안내${courseSection}

[광주 행사 목록]
${eventsContext || '현재 등록된 행사 정보 없음'}

[광주 맛집 목록]
${restaurantsContext || '현재 등록된 맛집 정보 없음'}`,
        },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
    }),
  })

  if (!openaiRes.ok) {
    throw new Error('OpenAI request failed')
  }

  const data = (await openaiRes.json()) as OpenAIChatResponse
  const reply = data.choices?.[0]?.message?.content?.trim()

  if (!reply) {
    throw new Error('Empty chat response')
  }

  return reply
}
