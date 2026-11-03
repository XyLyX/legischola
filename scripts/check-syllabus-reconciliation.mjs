import fs from "node:fs";
import assert from "node:assert/strict";
const source = JSON.parse(fs.readFileSync(new URL("../data/ggsipu-ba-llb-2026-curriculum.json", import.meta.url), "utf8"));
const catalogue = JSON.parse(fs.readFileSync(new URL("../references/exam-papers/index.json", import.meta.url), "utf8"));
const sha = "2f86f7eccaa31df437b2f8dba8b18a8aba04c3316aecff7438904b778046a65e";
assert.equal(source.source_sha256, sha, "Syllabus source changed: perform a fresh academic diff");
assert.equal(source.page_count, 202);
assert.equal(source.papers.length, 81);
const expected = [
  ["LLB101", "Legal Method"],
  ["LLB103", "Law of Contract-I"],
  ["LLB105", "English"],
  ["BALLB107", "History"],
  ["BALLB109", "Sociology"],
  ["BALLB111", "Political Science"],
  ["BALLB113", "Economics"],
];
const semester1 = source.papers.filter(p => p.semester === 1);
assert.equal(semester1.length, 7, "Semester 1 syllabus count changed");
for (const [code, fragment] of expected) {
  const paper = semester1.find(p => p.paper_code.replace(/[^A-Za-z0-9]/g, "").toUpperCase() === code);
  assert(paper, "Missing syllabus paper: " + code);
  assert(paper.subject_name.toLowerCase().includes(fragment.toLowerCase()), "Unexpected subject for " + code);
}
const exams = catalogue.papers.filter(p => p.semester === 1 && p.institution === "Delhi Metropolitan Education");
assert.equal(exams.length, 5, "Exam catalogue count changed: reconcile new source papers");
const codes = new Set(exams.map(p => p.paper_code.replace(/[^A-Za-z0-9]/g, "").toUpperCase()));
for (const code of ["LLB101","LLB103","LLB105","BALLB107","BALLB109"]) assert(codes.has(code), "Missing exam reference: " + code);
for (const code of ["BALLB111","BALLB113"]) assert(!codes.has(code), "New paper requires updating reconciliation");
console.log("Source fingerprint verified; 7 semester-1 syllabus subjects, 5 exam references, 2 subjects without source papers.");
