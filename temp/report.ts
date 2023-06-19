import * as fs from "fs";
import { Document, Packer } from "docx";
import { page1 } from "./reportPg1";
import { page2 } from "./reportPg2";


const doc = new Document({
    background: {
        color: "D9D9D9",
    },
    sections: [
        page1,
        page2,
    ]
});

Packer.toBuffer(doc).then((buffer) => {
    fs.writeFileSync("Report.docx", buffer);
});
