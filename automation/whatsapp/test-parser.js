/**
 * Test script for message-parser.js
 * Run: node automation/whatsapp/test-parser.js
 */

const { parseCommand } = require('./message-parser');

let passed = 0;
let failed = 0;

function assert(condition, label) {
  if (condition) {
    console.log(`  ✓ ${label}`);
    passed++;
  } else {
    console.error(`  ✗ ${label}`);
    failed++;
  }
}

console.log('\n=== Message Parser Tests ===\n');

// --- Approve command ---
console.log('Approve (yes <id>):');
const a1 = parseCommand('yes 47');
assert(a1.valid === true, '"yes 47" is valid');
assert(a1.command === 'approve', '"yes 47" → command: approve');
assert(a1.postId === '47', '"yes 47" → postId: "47"');
assert(a1.error === null, '"yes 47" → no error');

const a2 = parseCommand('yes 1');
assert(a2.command === 'approve' && a2.postId === '1', '"yes 1" → approve post 1');

const a3 = parseCommand('yes 999');
assert(a3.command === 'approve' && a3.postId === '999', '"yes 999" → approve post 999');

// --- Reject command ---
console.log('\nReject (no <id>):');
const r1 = parseCommand('no 47');
assert(r1.valid === true, '"no 47" is valid');
assert(r1.command === 'reject', '"no 47" → command: reject');
assert(r1.postId === '47', '"no 47" → postId: "47"');

const r2 = parseCommand('no 3');
assert(r2.command === 'reject' && r2.postId === '3', '"no 3" → reject post 3');

// --- List command ---
console.log('\nList:');
const l1 = parseCommand('list');
assert(l1.valid === true, '"list" is valid');
assert(l1.command === 'list', '"list" → command: list');
assert(l1.postId === null, '"list" → no postId');

// --- Status command ---
console.log('\nStatus:');
const s1 = parseCommand('status');
assert(s1.valid === true, '"status" is valid');
assert(s1.command === 'status', '"status" → command: status');
assert(s1.postId === null, '"status" → no postId');

// --- Approve all ---
console.log('\nApprove all:');
const aa1 = parseCommand('yes all');
assert(aa1.valid === true, '"yes all" is valid');
assert(aa1.command === 'approve_all', '"yes all" → command: approve_all');
assert(aa1.postId === null, '"yes all" → no postId');

// --- Reject all ---
console.log('\nReject all:');
const ra1 = parseCommand('no all');
assert(ra1.valid === true, '"no all" is valid');
assert(ra1.command === 'reject_all', '"no all" → command: reject_all');
assert(ra1.postId === null, '"no all" → no postId');

// --- Case insensitivity ---
console.log('\nCase insensitivity:');
const c1 = parseCommand('YES 47');
assert(c1.command === 'approve' && c1.postId === '47', '"YES 47" → approve 47');

const c2 = parseCommand('No 12');
assert(c2.command === 'reject' && c2.postId === '12', '"No 12" → reject 12');

const c3 = parseCommand('LIST');
assert(c3.command === 'list', '"LIST" → list');

const c4 = parseCommand('STATUS');
assert(c4.command === 'status', '"STATUS" → status');

const c5 = parseCommand('Yes All');
assert(c5.command === 'approve_all', '"Yes All" → approve_all');

const c6 = parseCommand('NO ALL');
assert(c6.command === 'reject_all', '"NO ALL" → reject_all');

// --- Whitespace handling ---
console.log('\nWhitespace handling:');
const w1 = parseCommand('  yes 47  ');
assert(w1.command === 'approve' && w1.postId === '47', 'Leading/trailing spaces handled');

const w2 = parseCommand('yes   47');
assert(w2.command === 'approve' && w2.postId === '47', 'Multiple spaces between words');

// --- Error: empty/null input ---
console.log('\nError - empty/null input:');
const e1 = parseCommand('');
assert(e1.valid === false, 'Empty string is invalid');
assert(e1.error !== null, 'Empty string has error message');

const e2 = parseCommand(null);
assert(e2.valid === false, 'null is invalid');

const e3 = parseCommand(undefined);
assert(e3.valid === false, 'undefined is invalid');

const e4 = parseCommand('   ');
assert(e4.valid === false, 'Whitespace-only is invalid');

// --- Error: unknown command ---
console.log('\nError - unknown command:');
const u1 = parseCommand('hello');
assert(u1.valid === false, '"hello" is invalid');
assert(u1.error.includes('Unknown command'), '"hello" error mentions unknown command');

const u2 = parseCommand('approve 47');
assert(u2.valid === false, '"approve 47" is invalid (must use "yes")');

const u3 = parseCommand('delete 47');
assert(u3.valid === false, '"delete 47" is invalid');

// --- Error: missing post ID ---
console.log('\nError - missing post ID:');
const m1 = parseCommand('yes');
assert(m1.valid === false, '"yes" alone is invalid');
assert(m1.error.includes('specify a post ID'), '"yes" error asks for post ID');

const m2 = parseCommand('no');
assert(m2.valid === false, '"no" alone is invalid');
assert(m2.error.includes('specify a post ID'), '"no" error asks for post ID');

// --- Error: invalid post ID format ---
console.log('\nError - invalid post ID:');
const i1 = parseCommand('yes abc');
assert(i1.valid === false, '"yes abc" is invalid');
assert(i1.error.includes('must be a number'), '"yes abc" error mentions number');

const i2 = parseCommand('no -5');
assert(i2.valid === false, '"no -5" is invalid (negative)');

const i3 = parseCommand('yes 0');
assert(i3.valid === false, '"yes 0" is invalid (zero)');

const i4 = parseCommand('yes 3.5');
assert(i4.valid === false, '"yes 3.5" is invalid (decimal)');

// --- Summary ---
console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
process.exit(failed > 0 ? 1 : 0);
