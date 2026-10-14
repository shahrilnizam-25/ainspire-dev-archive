import {strict as assert} from 'node:assert';
import {test} from 'node:test';
import {existsSync, readFileSync} from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import {revealDestination} from '../src/shared/navigation';

test('navigation reveals and focuses the selected section, respecting reduced motion', () => {
  const original = globalThis.window;
  const events: unknown[] = [];
  let reduced = false;
  globalThis.window = {matchMedia: () => ({matches: reduced}), scrollTo: (o: unknown) => events.push(['page', o])} as unknown as Window & typeof globalThis;
  const node = {closest: () => null, scrollIntoView: (o: unknown) => events.push(['section', o]), focus: (o: unknown) => events.push(['focus', o])} as unknown as HTMLElement;
  try {
    assert.equal(revealDestination(node), true);
    assert.deepEqual(events, [['section', {behavior: 'smooth', block: 'start'}], ['focus', {preventScroll: true}]]);
    events.length = 0; reduced = true;
    revealDestination(node);
    assert.deepEqual(events[0], ['section', {behavior: 'instant', block: 'start'}]);
    events.length = 0;
    revealDestination(node, 'page');
    assert.deepEqual(events, [['page', {top: 0, behavior: 'instant'}], ['focus', {preventScroll: true}]]);
    events.length = 0;
    assert.equal(revealDestination(null), false);
    assert.equal(revealDestination({...node, closest: () => ({})} as unknown as HTMLElement), false);
    assert.deepEqual(events, []);
  } finally {globalThis.window = original;}
});

/** Follow the actual portal import graph; exclude retired, unreachable screens. */
function portalSources() {
  const seen = new Set<string>();
  const queue = ['src/App.tsx', 'src/components/HRPortal.tsx'];
  const sources: ts.SourceFile[] = [];
  while (queue.length) {
    const file = queue.pop()!;
    if (seen.has(file)) continue;
    seen.add(file);
    const source = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, file.endsWith('tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
    sources.push(source);
    for (const statement of source.statements) {
      if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier) || !statement.moduleSpecifier.text.startsWith('.')) continue;
      const base = path.normalize(path.join(path.dirname(file), statement.moduleSpecifier.text));
      const dependency = [base+'.tsx', base+'.ts'].find(existsSync);
      if (dependency) queue.push(dependency);
    }
  }
  return sources;
}

test('all reachable portal buttons are wired and all literal page links resolve', () => {
  const issues: string[] = [];
  let buttons = 0;
  const routes = new Set<string>();
  const checkLink = (href: string, file: string) => {
    if (!href.trim() || href === '#' || /^javascript:/i.test(href)) issues.push(file+': placeholder or unsafe link');
    if (!href.startsWith('/') || href.startsWith('//')) return;
    const route = href.split(/[?#]/)[0];
    routes.add(route);
    if (!existsSync(path.join('app', route, 'page.tsx'))) issues.push(file+': missing page '+route);
  };
  for (const source of portalSources()) {
    const visit = (node: ts.Node) => {
      if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
        const attrs = node.attributes.properties.filter(ts.isJsxAttribute);
        const attr = (name: string) => attrs.find(a => a.name.getText(source) === name);
        if (node.tagName.getText(source) === 'button') {
          buttons++;
          if (!attr('onClick') && !(attr('type')?.initializer && ts.isStringLiteral(attr('type')!.initializer!) && (attr('type')!.initializer as ts.StringLiteral).text === 'submit')) issues.push(source.fileName+': unwired button');
        }
        const href = attr('href')?.initializer;
        if (href && ts.isStringLiteral(href)) checkLink(href.text, source.fileName);
      }
      // Navigation menus keep their hrefs in catalogue objects.
      if (ts.isPropertyAssignment(node) && node.name.getText(source) === 'href' && ts.isStringLiteral(node.initializer)) checkLink(node.initializer.text, source.fileName);
      ts.forEachChild(node, visit);
    };
    visit(source);
  }
  assert.deepEqual(issues, []);
  assert.ok(buttons > 30, 'Audit must cover the employee, HR and supervisor portal graph');
  assert.deepEqual([...routes].sort(), ['/', '/hr', '/supervisor']);
  console.log('Portal source audit:', buttons, 'button definitions; page destinations:', [...routes].join(', '));
});
