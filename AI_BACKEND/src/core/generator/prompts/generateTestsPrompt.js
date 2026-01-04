
export const GENERATE_TEST_PROMPT = (journey) => `
You are to produce a Playwright test (CommonJS) that implements the following journey steps.
Return only code inside a single code block.

Journey name: ${journey.name}
Steps: ${JSON.stringify(journey.steps, null, 2)}

For each step:
- Use data-testid when possible, else stable selectors.
- After each meaningful action add: await page.screenshot({ path: 'proofs/${journey.name}_step<STEP>.png' });

Return only the test code.
`;
