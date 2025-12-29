
import { askChat, extractText } from '../../infra/openai/openaiClient.js';
import { GENERATE_TEST_PROMPT } from './prompts/generateTestsPrompt.js';

export async function generateTestForJourney(journey) {
  const prompt = GENERATE_TEST_PROMPT(journey);
  const messages = [{ role:'system', content:'You are a Playwright test generator.' }, { role:'user', content: prompt }];
  const resp = await askChat({ messages, model: 'gpt-4.0-mini', max_tokens: 1200 });
  const text = extractText(resp);
  // try to pull code block
  const m = text.match(/```[\s\S]*```/);
  const code = m ? m[0].replace(/```/g,'').trim() : text;
  return code;
}
