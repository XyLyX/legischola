// LegiSchola beta curriculum integrity test. Fails closed if the source-mapped
// university scheme loses a semester, source page, elective cluster, or unit.
import fs from "node:fs";
import assert from "node:assert/strict";
const source=JSON.parse(fs.readFileSync(new URL("../data/ggsipu-ba-llb-2026-curriculum.json",import.meta.url),"utf8"));
assert.equal(source.page_count,202);
assert.match(source.source_sha256,/^[a-f0-9]{64}$/);
const papers=source.papers;
assert.equal(papers.length,81,"Unexpected number of paper entries");
const counts={taught:0,elective_catalogue:0,elective_option:0,practical:0,non_university_evaluative:0};
const unitsPerSemester=Array(10).fill(0),keys=new Set(),electives=Array(11).fill(0);
for(const paper of papers){
 assert(Number.isInteger(paper.semester)&&paper.semester>=1&&paper.semester<=10, "Invalid semester");
 assert(paper.source_page_start>=1&&paper.source_page_end<=202&&paper.source_page_start<=paper.source_page_end,"Missing source page");
 assert(["taught","elective_catalogue","elective_option","practical","non_university_evaluative"].includes(paper.paper_type));
 counts[paper.paper_type]++;
 const key=paper.semester+"|"+paper.paper_code;assert(!keys.has(key),"Duplicate paper "+key);keys.add(key);
 const numbers=paper.units.map(x=>x.unit_number).sort((a,b)=>a-b);
 if(paper.paper_type==="elective_catalogue")assert.equal(numbers.length,0);
 else if(paper.paper_type==="practical")assert.deepEqual(numbers,[1],"Practical support must be separate from academic units");
 else assert.deepEqual(numbers,[1,2,3,4],"Source paper missing or duplicated units: "+key);
 if(paper.paper_type==="elective_option"){assert(paper.elective_group,"Elective missing cluster");electives[paper.semester]++;}
 for(const unit of paper.units){assert(unit.unit_title?.length>2&&unit.outline?.length>8,"Missing full unit text");unitsPerSemester[paper.semester-1]++;}
}
assert.deepEqual(counts,{taught:51,elective_catalogue:3,elective_option:21,practical:5,non_university_evaluative:1});
assert.deepEqual(electives.slice(7,10),[4,5,12]);
assert.deepEqual(unitsPerSemester,[28,28,24,24,25,24,37,40,65,2]);
assert(papers.some(p=>p.paper_code==="LLB406"&&p.source_discrepancy),"Preserve known Labour II source conflict");
console.log("10 semesters validated: "+papers.length+" papers, "+unitsPerSemester.reduce((a,b)=>a+b,0)+" source-mapped units/practical entries.");
