import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  ORIGINAL_CODE_LICENSE_NOTICE,
  SOURCES_REGISTRY,
} from './sourcesRegistry';

describe('sources and licenses registry', () => {
  it('links FLEX and BASS-II to official NTRS URLs as externally linked, not locally archived', () => {
    const flex = SOURCES_REGISTRY.find((s) => s.id === 'dataset-flex');
    const bass2 = SOURCES_REGISTRY.find((s) => s.id === 'dataset-bass2');
    assert.ok(flex);
    assert.ok(bass2);
    assert.equal(flex.stableUrl, 'https://ntrs.nasa.gov/citations/20150023456');
    assert.equal(bass2.stableUrl, 'https://ntrs.nasa.gov/citations/20210011385');
    assert.equal(flex.verifiedStatus, 'Check publisher terms');
    assert.equal(bass2.verifiedStatus, 'Check publisher terms');
    assert.match(flex.bundlingStatus ?? '', /Externally linked/i);
    assert.match(bass2.bundlingStatus ?? '', /Externally linked/i);
    assert.doesNotMatch(flex.licenseOrReuse, /reference-docs\/aistudio/i);
    assert.doesNotMatch(bass2.licenseOrReuse, /reference-docs\/aistudio/i);
    assert.match(flex.title, /Table IX/i);
    assert.match(bass2.title, /Table 5\.1/i);
    assert.match(bass2.title, /Eq\. 6\.1/i);
  });

  it('documents Apache-2.0 LICENSE for original code, excludes third-party items, and flags uncertain files', () => {
    const categories = new Set(SOURCES_REGISTRY.map((s) => s.category));
    assert.deepEqual(categories, new Set(['dataset', 'api', 'image', 'library']));

    const licenseText = fs.readFileSync(path.resolve(process.cwd(), 'LICENSE'), 'utf8');
    assert.match(licenseText, /Apache License/);
    assert.match(licenseText, /Version 2\.0/);

    const pkgJson = JSON.parse(
      fs.readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf8')
    ) as {
      private?: boolean;
      license?: string;
      scripts?: Record<string, string>;
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };

    assert.equal(pkgJson.private, true);
    assert.equal(pkgJson.license, 'Apache-2.0');
    assert.match(ORIGINAL_CODE_LICENSE_NOTICE.status, /Apache-2\.0/i);
    assert.match(ORIGINAL_CODE_LICENSE_NOTICE.detail, /does NOT apply to NASA/i);

    const promptImage = SOURCES_REGISTRY.find((s) => s.id === 'image-prompt-reference');
    const unusedPromptFiles = SOURCES_REGISTRY.find(
      (s) => s.id === 'dataset-unused-prompt-files'
    );
    assert.equal(promptImage?.verifiedStatus, 'Flagged for review');
    assert.equal(unusedPromptFiles?.verifiedStatus, 'Flagged for review');

    const testScript = pkgJson.scripts?.test ?? '';
    for (const expectedTestPath of [
      'src/data/sourcesRegistry.test.ts',
      'src/utils/csvParser.test.ts',
      'src/utils/geminiModel.test.ts',
      'src/utils/grounding.test.ts',
      'src/utils/physics.test.ts',
    ]) {
      assert.ok(testScript.includes(expectedTestPath), `npm test missing ${expectedTestPath}`);
    }

    const libraryText = SOURCES_REGISTRY.filter((s) => s.category === 'library')
      .map((s) => `${s.title} ${s.licenseOrReuse}`)
      .join('\n');

    for (const dep of [
      ...Object.keys(pkgJson.dependencies ?? {}),
      ...Object.keys(pkgJson.devDependencies ?? {}),
    ]) {
      const shortName = dep.startsWith('@types/') ? dep.replace('@types/', '') : dep;
      assert.ok(
        libraryText.includes(shortName),
        `Missing library documentation entry for ${dep}`
      );
    }

    assert.equal(pkgJson.dependencies?.motion, undefined);
    assert.equal(/\bmotion\b/.test(libraryText), false);
  });
});
