import fs from 'fs';
import path from 'path';
import { Command } from 'commander';
import { runPrepKitPipeline } from '../pipeline/orchestrator';
import {
  BatchCaseInput,
  BatchCaseResult,
  BatchEvaluationOutput
} from '../../models/types';

async function main() {
  const program = new Command();

  program
    .name('evaluate')
    .description('Run Trao AI Interview Prep Kit evaluation over a batch of cases')
    .requiredOption('-i, --input <path>', 'Path to input cases JSON file')
    .requiredOption('-o, --output <path>', 'Path to output kits JSON file')
    .parse(process.argv);

  const options = program.opts();


  const baseDir = process.env.INIT_CWD || process.cwd();

  let inputPath = path.resolve(baseDir, options.input);
  if (!fs.existsSync(inputPath)) {
    if (fs.existsSync(path.resolve(process.cwd(), options.input))) {
      inputPath = path.resolve(process.cwd(), options.input);
    } else if (fs.existsSync(path.resolve(process.cwd(), '..', options.input))) {
      inputPath = path.resolve(process.cwd(), '..', options.input);
    }
  }

  const outputPath = path.resolve(baseDir, options.output);

  if (!fs.existsSync(inputPath)) {
    console.error(`Error: Input file does not exist: ${inputPath}`);
    process.exit(1);
  }

  console.log(`[Evaluate CLI] Reading batch cases from: ${inputPath}`);
  const rawInput = fs.readFileSync(inputPath, 'utf-8');
  let cases: BatchCaseInput[];

  try {
    cases = JSON.parse(rawInput);
    if (!Array.isArray(cases)) {
      throw new Error('Input file must contain an array of case objects.');
    }
  } catch (err: any) {
    console.error(`Error parsing input JSON: ${err.message}`);
    process.exit(1);
  }

  console.log(`[Evaluate CLI] Found ${cases.length} test case(s) to process.`);
  const results: BatchCaseResult[] = [];

  for (let i = 0; i < cases.length; i++) {
    const c = cases[i];
    console.log(`\n========================================`);
    console.log(`[Case ${i + 1}/${cases.length}] Processing case: "${c.id}" (${c.company_url}) for ${c.days} days`);
    console.log(`========================================`);

    try {
      const kit = await runPrepKitPipeline(
        {
          id: c.id,
          jd: c.jd,
          company_url: c.company_url,
          days: c.days
        },
        (step, total, phase, msg) => {
          console.log(`  [${step}/${total}] [${phase}] ${msg}`);
        }
      );

      console.log(`✓ Case "${c.id}" generated successfully.`);
      results.push({
        id: c.id,
        status: 'ok',
        kit,
        error: null
      });
    } catch (err: any) {
      console.error(`✗ Case "${c.id}" failed: ${err.message}`);
      results.push({
        id: c.id,
        status: 'failed',
        kit: null,
        error: {
          code: err.code || 'GENERATION_ERROR',
          message: err.message || 'Pipeline encountered a fatal error on this case.'
        }
      });
    }
  }

  const evaluationOutput: BatchEvaluationOutput = {
    version: '1.0',
    generated_at: new Date().toISOString(),
    kits: results
  };

  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(evaluationOutput, null, 2), 'utf-8');
  console.log(`\n[Evaluate CLI] Finished! Wrote ${results.length} kit results to: ${outputPath}`);
}

main().catch((err) => {
  console.error('Fatal CLI Error:', err);
  process.exit(1);
});
