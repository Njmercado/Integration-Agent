export function getToolAnswerFromAgentMessages(agentMessages: any[]) {
  const secondLastMessage = agentMessages[agentMessages.length - 2]
  const content = secondLastMessage?.content[0]
  const toolResultContent = content?.content[0]
  const data = toolResultContent?.json
  return data;
}