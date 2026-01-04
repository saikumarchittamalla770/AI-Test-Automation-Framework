
import OpenAI from "openai";
import { OPENAI_KEY } from '../../config/env.js';

const client = new OpenAI({ apiKey: OPENAI_KEY });



export async function askChat({ model='gpt-4o-mini', messages=[], max_tokens=1500, temperature=0.2 }) {
  // Uses chat completions style from openai SDK v4.x

  console.log("OPENAI_KEY",OPENAI_KEY);
  
  const resp = await client.chat.completions.create({
    model,
    messages,
    max_tokens
  });
  return resp;
}

// helper to extract text
export function extractText(resp){
  try { return resp.choices[0].message.content; } catch { return resp.output_text || ''; }
}
