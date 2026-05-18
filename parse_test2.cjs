const JSZip = require("jszip");
const fs = require("fs");
const buf = fs.readFileSync("/Users/wuyuqiankingsoft/Desktop/周报/创新业务部2026-4-22.docx");
JSZip.loadAsync(buf).then(zip => zip.file("word/document.xml").async("string")).then(xml => {
  const tables = [];
  const tableRegex = /<w:tbl[ >][\s\S]*?<\/w:tbl>/g;
  let tableMatch;
  while ((tableMatch = tableRegex.exec(xml)) !== null) {
    const tableXml = tableMatch[0];
    const rows = [];
    const rowRegex = /<w:tr[\s>][\s\S]*?<\/w:tr>/g;
    let rowMatch;
    while ((rowMatch = rowRegex.exec(tableXml)) !== null) {
      const cells = [];
      const cellRegex = /<w:tc[\s>][\s\S]*?<\/w:tc>/g;
      let cellMatch;
      while ((cellMatch = cellRegex.exec(rowMatch[0])) !== null) {
        const texts = [];
        const textRegex = /<w:t[^>]*>([^<]*)<\/w:t>/g;
        let textMatch;
        while ((textMatch = textRegex.exec(cellMatch[0])) !== null) {
          texts.push(textMatch[1]);
        }
        cells.push(texts.join(""));
      }
      rows.push(cells);
    }
    tables.push(rows);
  }

  console.log("Total tables:", tables.length);
  tables.forEach((rows, ti) => {
    console.log("\n=== Table " + (ti + 1) + " (" + rows.length + " rows) ===");
    console.log("Header:", JSON.stringify(rows[0]));
    if (rows[1]) {
      var preview = rows[1].map(function(c) {
        return c.length > 50 ? c.slice(0, 50) + "..." : c;
      });
      console.log("Row1:", JSON.stringify(preview));
    }
  });
}).catch(function(e) { console.error(e); });
