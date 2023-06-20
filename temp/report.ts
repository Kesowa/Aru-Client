import * as fs from "fs";
import { AlignmentType, convertInchesToTwip, BorderStyle, Document, Footer, FrameAnchorType, HeightRule, LevelFormat, Packer, PageNumber, PageOrientation, Paragraph, ShadingType, Table, TableCell, TableRow, TextRun, VerticalAlign, HorizontalPositionRelativeFrom, ImageRun, VerticalPositionRelativeFrom } from "docx";
import { page1 } from "./reportPg1";
import { page2 } from "./reportPg2";
import { page3 } from "./reportPg3";
import { commonPageFooter, commonPageProperties, levelOptions } from "./reportUtils";
import { reportMapPage } from "./reportMapPage";

const doc = new Document({
    numbering: {
        config: [
            { reference: "pg3-table1-column1", levels: levelOptions },
            { reference: "pg3-table1-column2", levels: levelOptions },
            { reference: "pg3-table1-column3", levels: levelOptions },
            { reference: "pg3-table1-column4", levels: levelOptions },
            { reference: "pg3-table2-column1", levels: levelOptions },
            { reference: "pg3-table2-column4", levels: levelOptions },
        ],
    },
    background: {
        color: "D9D9D9",
    },
    sections: [
        page1,
        page2,
        page3,
        reportMapPage({
            heading: "ACTION AREA - I", 
            subheading: "BLOCK OVERVIEW", 
            imgPath: "./images/page4Image.jpg",
        }),
        reportMapPage({
            heading: "ACTION AREA - I", 
            subheading: "BLOCK: 'AC' BOUNDARY", 
            imgPath: "./images/page5Image.jpg",
        }),
        reportMapPage({
            heading: "ACTION AREA - I", 
            subheading: "BLOCK: 'AC' PLOT DETAILS", 
            imgPath: "./images/page6Image.jpg",
        }),
        // TODO: Page 7
        reportMapPage({
            heading: "ACTION AREA - I", 
            subheading: "BLOCK: 'AC' BUILT-UP AREA", 
            imgPath: "./images/page8Image.png",
        }),
        reportMapPage({
            heading: "ACTION AREA - I", 
            subheading: "BLOCK: 'AC' AMENITIES AND POI", 
            imgPath: "./images/page9Image.jpg",
        }),
        reportMapPage({
            heading: "ACTION AREA - I", 
            subheading: "BLOCK: 'AC' OTHER FEATURES", 
            imgPath: "./images/page10Image.jpg",
        }),
        reportMapPage({
            heading: "ACTION AREA - I", 
            subheading: "BLOCK: 'AC' ACTIONABLE POINTS", 
            imgPath: "./images/page11Image.jpg",
        }),
        reportMapPage({
            heading: "ACTION AREA - I", 
            subheading: "BLOCK: 'AC' OCCUPIED UNTAXED AREA (ENCROACHMENT)", 
            imgPath: "./images/page12Image.jpg",
        }),
        reportMapPage({
            heading: "ACTION AREA - I", 
            subheading: "BLOCK: 'AC' ROAD DETAILS", 
            imgPath: "./images/page13Image.jpg",
        }),
        reportMapPage({
            heading: "ACTION AREA - I", 
            subheading: "BLOCK: 'AC' FOOTPATH DETAILS", 
            imgPath: "./images/page14Image.jpg",
        }),
        reportMapPage({
            heading: "ACTION AREA - I", 
            subheading: "BLOCK: 'AC' CYCLE TRACK DETAILS", 
            imgPath: "./images/page15Image.jpg",
        }),
        reportMapPage({
            heading: "ACTION AREA - I", 
            subheading: "BLOCK: 'AC' WATERBODIES DETAILS", 
            imgPath: "./images/page16Image.png",
        }),
        reportMapPage({
            heading: "ACTION AREA - I", 
            subheading: "BLOCK: 'AC' GREENERY DETAILS", 
            imgPath: "./images/page17Image.png",
        }),
        reportMapPage({
            heading: "ACTION AREA - I", 
            subheading: "BLOCK: 'AC' WATER TANK", 
            imgPath: "./images/page18Image.png",
        }),
        reportMapPage({
            heading: "ACTION AREA - I", 
            subheading: "BLOCK: 'AC' STREET-LIGHT DETAILS", 
            imgPath: "./images/page19Image.jpg",
        }),
    ]
});

Packer.toBuffer(doc).then((buffer) => {
    fs.writeFileSync("Report.docx", buffer);
});
