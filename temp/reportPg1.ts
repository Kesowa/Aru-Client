import * as fs from "fs";
import { PageOrientation, Footer, Paragraph, AlignmentType, TextRun, PageNumber, ImageRun, HorizontalPositionRelativeFrom, VerticalPositionRelativeFrom, FrameAnchorType, Table, TableRow, HeightRule, TableCell, VerticalAlign } from "docx";

export const page1 = {
    properties: {
        page: {
            margin: {
                top: 500,
            },
            size: {
                orientation: PageOrientation.LANDSCAPE,
            },
        },
    },
    footers: {
        default: new Footer({
            children: [
                new Paragraph({
                    alignment: AlignmentType.RIGHT,
                    children: [
                        new TextRun({
                            size: "14pt",
                            children: ["Page: ", PageNumber.CURRENT],
                        }),
                    ],
                }),
            ],
        }),
    },
    children: [
        new Paragraph({
            children: [
                new ImageRun({
                    data: fs.readFileSync("./images/NKDA_Logo.png"),
                    transformation: {
                        width: 100,
                        height: 100,
                    },
                    floating: {
                        horizontalPosition: {
                            relative: HorizontalPositionRelativeFrom.LEFT_MARGIN,
                            // align: HorizontalPositionAlign.LEFT,
                            offset: 814400,
                        },
                        verticalPosition: {
                            relative: VerticalPositionRelativeFrom.TOP_MARGIN,
                            offset: 1014400,
                        }
                    },
                }),
            ]
        }),
        new Paragraph({
            frame: {
                position: {
                    x: 300,
                    y: 400,
                },
                width: 50000,
                height: 1000,
                anchor: {
                    horizontal: FrameAnchorType.MARGIN,
                    vertical: FrameAnchorType.MARGIN,
                },
            },
            alignment: AlignmentType.CENTER,
            children: [
                new TextRun({
                    text: "Geospatial Intelligence Block Report",
                    color: "000000",
                    size: "24pt",
                    font: {
                        name: "Calibri Light",
                    },
                }),
                new TextRun({
                    text: "ACTION AREA I",
                    color: "595959",
                    size: "28pt",
                    font: {
                        name: "Verdana",
                    },
                    break: 2,
                }),
                new TextRun({
                    text: "BLOCK AC",
                    color: "4A442A",
                    size: "54pt",
                    font: {
                        name: "Arial",
                    },
                    bold: true,
                    break: 1,
                }),
            ]
        }),
        new Paragraph({
            children: [
                new ImageRun({
                    data: fs.readFileSync("./images/FSIPL_Logo.png"),
                    transformation: {
                        width: 110,
                        height: 100,
                    },
                    floating: {
                        horizontalPosition: {
                            relative: HorizontalPositionRelativeFrom.RIGHT_MARGIN,
                            // align: HorizontalPositionAlign.RIGHT,
                            offset: -814400,
                        },
                        verticalPosition: {
                            relative: VerticalPositionRelativeFrom.TOP_MARGIN,
                            offset: 1014400,
                        }
                    },
                }),
            ]
        }),
        new Paragraph({
            children: [
                new ImageRun({
                    data: fs.readFileSync("./images/geojsonCover1.jpg"),
                    transformation: {
                        width: 500,
                        height: 365,
                    },
                    floating: {
                        horizontalPosition: {
                            relative: HorizontalPositionRelativeFrom.LEFT_MARGIN,
                            // align: HorizontalPositionAlign.RIGHT,
                            offset: 814400,
                        },
                        verticalPosition: {
                            relative: VerticalPositionRelativeFrom.TOP_MARGIN,
                            offset: 3160000,
                        }
                    },
                }),
            ]
        }),
        new Table({
            width: {
                size: "11.74cm",
            },
            float: {
                absoluteHorizontalPosition: "14cm",
                absoluteVerticalPosition: "7.9cm"
            },
            rows: [
                new TableRow({
                    height: {
                        value: "2cm",
                        rule: HeightRule.EXACT
                    },
                    children: [
                        new TableCell({
                            shading: {
                                fill: "5B9BD5",
                            },
                            width: {
                                size: "25%",
                            },
                            margins: {
                                left: 100,
                                right: 100
                            },
                            children: [
                                new Paragraph("BLOCK/AC"),
                            ],
                            verticalAlign: VerticalAlign.CENTER,
                        }),
                        new TableCell({
                            shading: {
                                fill: "5B9BD5",
                            },
                            columnSpan: 2,
                            width: {
                                size: "75%",
                            },
                            margins: {
                                left: 100,
                                right: 100
                            },
                            children: [
                                new Paragraph("Akash Adhikary & Subhendu Kumar Panja")
                            ],
                            verticalAlign: VerticalAlign.CENTER,
                        }),
                    ]
                }),
                new TableRow({
                    height: {
                        value: "3cm",
                        rule: HeightRule.EXACT
                    },
                    children: [
                        new TableCell({
                            shading: {
                                fill: "5B9BD5",
                            },
                            width: {
                                size: "25%",
                            },
                            margins: {
                                left: 100,
                                right: 100
                            },
                            children: [
                                new Paragraph("Date: 12/01/2023")
                            ],
                            verticalAlign: VerticalAlign.CENTER,
                        }),
                        new TableCell({
                            shading: {
                                fill: "D2DEEF",
                            },
                            width: {
                                size: "35%",
                            },
                            margins: {
                                left: 100,
                                right: 100
                            },
                            children: [
                                new Paragraph("P: +91 9163827816")
                            ],
                            verticalAlign: VerticalAlign.CENTER,
                        }),
                        new TableCell({
                            shading: {
                                fill: "D2DEEF",
                            },
                            width: {
                                size: "40%",
                            },
                            margins: {
                                left: 100,
                                right: 100
                            },
                            children: [
                                new Paragraph("Y: akash.adhikary@shanta.in\n  &\n  subhendu.panja@shanta.in"),
                            ],
                            verticalAlign: VerticalAlign.CENTER,
                        }),
                    ]
                }),
                new TableRow({
                    height: {
                        value: "4.6cm",
                        rule: HeightRule.EXACT
                    },
                    children: [
                        new TableCell({
                            shading: {
                                fill: "5B9BD5",
                            },
                            width: {
                                size: "25%",
                            },
                            margins: {
                                left: 100,
                                right: 100
                            },
                            children: [
                                new Paragraph("STATEMENT OF CONFIDENTIALITY")
                            ],
                            verticalAlign: VerticalAlign.CENTER,
                        }),
                        new TableCell({
                            shading: {
                                fill: "D2DEEF",
                            },
                            columnSpan: 2,
                            width: {
                                size: "75%",
                            },
                            margins: {
                                left: 100,
                                right: 100
                            },
                            children: [
                                new Paragraph("This report is a part of an ongoing contract with Newtown Kolkata Development Authority "+
                                "and is issued for parties  under contract only. Terms and Conditions of contract "+ 
                                "preside over all parties and their actors.")
                            ],
                            verticalAlign: VerticalAlign.CENTER,
                        }),
                    ]
                }),
            ]
        }),
        new Paragraph({
            frame: {
                position: {
                    x: 12500,
                    y: 2700,
                },
                width: 2250,
                height: 1000,
                anchor: {
                    horizontal: FrameAnchorType.MARGIN,
                    vertical: FrameAnchorType.MARGIN,
                },
            },
            children: [
                new TextRun({
                    text: "FSIPL/NKDA/R/003",
                    color: "7E7E7E",
                    size: "12pt",
                    font: {
                        name: "Arial MT",
                    },
                }),
            ],
        }),
    ],
}