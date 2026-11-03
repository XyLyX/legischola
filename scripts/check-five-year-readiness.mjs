import fs from "node:fs";
import assert from "node:assert/strict";
const data=JSON.parse(fs.readFileSync(new URL("../data/ggsipu-ba-llb-2026-curriculum.json",import.meta.url),"utf8"));
const papers=[7,7,6,6,7,6,11,11,18,2];
const units=[28,28,24,24,25,24,37,40,65,2];
for(let s=1;s<=10;s++){
 const group=data.papers.filter(p=>p.semester===s);
 assert.equal(group.length,papers[s-1],"Semester "+s+" paper count");
 assert.equal(group.reduce((n,p)=>n+p.units.length,0),units[s-1],"Semester "+s+" unit count");
 assert(group.every(p=>p.source_page_start&&p.source_page_end),"Missing provenance in semester "+s);
 console.log("PASS semester "+s);
}
console.log("Structural syllabus checks only; authenticated functional tests remain outstanding.");
