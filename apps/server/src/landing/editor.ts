import fs from 'node:fs/promises';
import path from 'node:path';
import { runManagedAgent } from './claudeManaged.js';
import { execa } from 'execa';
import { config } from '../config.js';
import { fileURLToPath } from 'node:url';

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export async function editLandingApp({
  projectDir,
  changePrompt,
}: {
  projectDir: string;
  changePrompt: string;
}): Promise<void> {
  const mainPath = path.join(projectDir, 'src', 'main.jsx');
  const stylesPath = path.join(projectDir, 'src', 'styles.css');

  const mainCode = await fs.readFile(mainPath, 'utf-8').catch(() => '');
  const stylesCode = await fs.readFile(stylesPath, 'utf-8').catch(() => '');

  const task = `Here is the current landing page code and a change request. Apply the changes and return ONLY the complete updated files.

## Change request
${changePrompt}

## src/main.jsx
\`\`\`jsx
${mainCode}
\`\`\`

## src/styles.css
\`\`\`css
${stylesCode}
\`\`\`

Return the updated files in this exact format (no markdown fences around the whole response, just the file markers):

--- FILE: src/main.jsx ---
<complete updated jsx code>

--- FILE: src/styles.css ---
<complete updated css code>
`;

  const response = await runManagedAgent('editor', task);

  // Parse the response for file sections
  const mainMatch = response.match(/---\s*FILE:\s*src\/main\.jsx\s*---\n?([\s\S]*?)(?=---\s*FILE:|$)/i);
  const stylesMatch = response.match(/---\s*FILE:\s*src\/styles\.css\s*---\n?([\s\S]*?)(?=---\s*FILE:|$)/i);

  if (mainMatch?.[1]) {
    await fs.writeFile(mainPath, mainMatch[1].trim() + '\n');
  }
  if (stylesMatch?.[1]) {
    await fs.writeFile(stylesPath, stylesMatch[1].trim() + '\n');
  }

  // Rebuild
  await execa('pnpm', ['exec', 'vite', 'build', projectDir, '--outDir', path.join(projectDir, 'dist')], {
    cwd: serverRoot,
    stdio: 'pipe',
    timeout: 120_000,
  });
}
