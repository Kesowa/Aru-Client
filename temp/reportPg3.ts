import * as fs from "fs";
import { Table, BorderStyle, TableRow, HeightRule, TableCell, ShadingType, Paragraph, AlignmentType, TextRun, VerticalAlign, FrameAnchorType, convertInchesToTwip } from "docx";
import { commonPageFooter, commonPageProperties } from "./reportUtils";

const pg3Heading = new Paragraph({
    frame: {
        position: {
            x: 5250,
            y: 0,
        },
        width: 3000,
        height: 400,
        anchor: {
            horizontal: FrameAnchorType.MARGIN,
            vertical: FrameAnchorType.MARGIN,
        },
    },
    children: [
        new TextRun({
            text: "Block Specific Insights",
            size: "14pt",
            font: "Calibri",
            bold: true,
            allCaps: true,
        })
    ]
});

const pg3Table1 = new Table({
    width: {
        size: "24.92cm",
    },
    float: {
        absoluteHorizontalPosition: "0cm",
        absoluteVerticalPosition: "1.25cm"
    },
    borders: {
        top: { style: BorderStyle.NONE, size: 0 },
        bottom: { style: BorderStyle.NONE, size: 0 },
        left: { style: BorderStyle.NONE, size: 0 },
        right: { style: BorderStyle.NONE, size: 0 },
    },
    rows: [
        new TableRow({
            height: {
                value: "0.75cm",
                rule: HeightRule.EXACT
            },
            children: [
                new TableCell({
                    width: {
                        size: "25%",
                    },
                    shading: {
                        color: "384454",
                        type: ShadingType.SOLID,
                    },
                    children: [
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                                new TextRun({
                                    text: "Roads",
                                    bold: true,
                                    color: "FFFFFF",
                                    size: "12pt",
                                    font: "Calibri"
                                })
                            ]
                        }),
                    ],
                    borders: {
                        bottom: {
                            style: BorderStyle.THICK,
                            color: "FFFFFF",
                            size: 20,
                        },
                        right: {
                            style: BorderStyle.THICK,
                            color: "FFFFFF",
                            size: 20,
                        },
                    },
                    verticalAlign: VerticalAlign.CENTER,
                }),
                new TableCell({
                    width: {
                        size: "25%",
                    },
                    shading: {
                        color: "384454",
                        type: ShadingType.SOLID,
                    },
                    children: [
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                                new TextRun({
                                    text: "Footpath",
                                    bold: true,
                                    color: "FFFFFF",
                                    size: "12pt",
                                    font: "Calibri"
                                })
                            ]
                        }),
                    ],
                    borders: {
                        bottom: {
                            style: BorderStyle.THICK,
                            color: "FFFFFF",
                            size: 20,
                        },
                        right: {
                            style: BorderStyle.THICK,
                            color: "FFFFFF",
                            size: 20,
                        }
                    },
                    verticalAlign: VerticalAlign.CENTER,
                }),
                new TableCell({
                    width: {
                        size: "25%",
                    },
                    shading: {
                        color: "384454",
                        type: ShadingType.SOLID,
                    },
                    children: [
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                                new TextRun({
                                    text: "Greenery",
                                    bold: true,
                                    color: "FFFFFF",
                                    size: "12pt",
                                    font: "Calibri"
                                })
                            ]
                        }),
                    ],
                    borders: {
                        bottom: {
                            style: BorderStyle.THICK,
                            color: "FFFFFF",
                            size: 20,
                        },
                        right: {
                            style: BorderStyle.THICK,
                            color: "FFFFFF",
                            size: 20,
                        }
                    },
                    verticalAlign: VerticalAlign.CENTER,
                }),
                new TableCell({
                    width: {
                        size: "25%",
                    },
                    shading: {
                        color: "384454",
                        type: ShadingType.SOLID,
                    },
                    children: [
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                                new TextRun({
                                    text: "Canal",
                                    bold: true,
                                    color: "FFFFFF",
                                    size: "12pt",
                                    font: "Calibri"
                                })
                            ]
                        }),
                    ],
                    borders: {
                        bottom: {
                            style: BorderStyle.THICK,
                            color: "FFFFFF",
                            size: 20,
                        }
                    },
                    verticalAlign: VerticalAlign.CENTER,
                }),
            ]
        }),
        new TableRow({
            height: {
                value: "6.5cm",
                rule: HeightRule.EXACT
            },
            children: [
                new TableCell({
                    margins:{
                        top: 100,
                    },
                    width: {
                        size: "25%",
                    },
                    shading: {
                        color: "8FAADC",
                        type: ShadingType.SOLID,
                    },
                    children: [
                        new Paragraph({
                            text: "No. of roads: 23",
                            numbering: {
                                reference: "pg3-table1-column1",
                                level: 0
                            }
                        }),
                        new Paragraph({
                            text: "Road's Length: 3913.31 mt. (Approx)",
                            numbering: {
                                reference: "pg3-table1-column1",
                                level: 0
                            }
                        }),
                        new Paragraph({
                            text: "Roads are sharing with adjacent blocks:",
                            numbering: {
                                reference: "pg3-table1-column1",
                                level: 0
                            }
                        }),
                        new Paragraph({
                            text: "Adjacent block: AF, AD, AG, AA",
                            numbering: {
                                reference: "pg3-table1-column1",
                                level: 1
                            }
                        }),
                        new Paragraph({
                            text: "Street no. of roads: 32, 39, 41, 51, 64",
                            numbering: {
                                reference: "pg3-table1-column1",
                                level: 1
                            }
                        }),
                        new Paragraph({
                            text: "Road Segment Length: 1633.50 mt.(Approx)",
                            numbering: {
                                reference: "pg3-table1-column1",
                                level: 1
                            }
                        }),
                        new Paragraph({
                            text: "Street no. sharing with adjacent block: ",
                            numbering: {
                                reference: "pg3-table1-column1",
                                level: 1
                            }
                        }),
                        new Paragraph({
                            text: "51 with AA block",
                            numbering: {
                                reference: "pg3-table1-column1",
                                level: 2
                            }
                        }),
                        new Paragraph({
                            text: "64 with AD and AG block",
                            numbering: {
                                reference: "pg3-table1-column1",
                                level: 2
                            }
                        }),
                        new Paragraph({
                            text: "39, 41 and 42 with AF block",
                            numbering: {
                                reference: "pg3-table1-column1",
                                level: 2
                            }
                        }),
                        new Paragraph({
                            text: "Major Road Problem: NA",
                            numbering: {
                                reference: "pg3-table1-column1",
                                level: 0
                            }
                        }),
                    ],
                    borders: {
                        right: {
                            style: BorderStyle.THICK,
                            color: "FFFFFF",
                            size: 20,
                        }
                    },
                }),
                new TableCell({
                    width: {
                        size: "25%",
                    },
                    shading: {
                        color: "8FAADC",
                        type: ShadingType.SOLID,
                    },
                    children: [
                        new Paragraph({
                            text: "Street with footpath: 32, 47, 51, 64, 41",
                            numbering: {
                                reference: "pg3-table1-column2",
                                level: 0,
                                custom: true
                            }
                        }),
                        new Paragraph({
                            text: "Street with partial footpath: 39",
                            numbering: {
                                reference: "pg3-table1-column2",
                                level: 0
                            }
                        }),
                        new Paragraph({
                            text: "Street without footpath: 34, 36, 38, 40, 42, 43, 44, 46, 48, 49, 50, 52, 54, 56, 58, 60, 62",
                            numbering: {
                                reference: "pg3-table1-column2",
                                level: 0
                            }
                        }),
                    ],
                    borders: {
                        right: {
                            style: BorderStyle.THICK,
                            color: "FFFFFF",
                            size: 20,
                        }
                    },
                }),
                new TableCell({
                    width: {
                        size: "25%",
                    },
                    shading: {
                        color: "8FAADC",
                        type: ShadingType.SOLID,
                    },
                    children: [
                        new Paragraph({
                            text: "Area: 14430.05 sq. mt.",
                            numbering: {
                                reference: "pg3-table1-column3",
                                level: 0
                            }
                        }),
                        new Paragraph({
                            text: "No. of tree: 197",
                            numbering: {
                                reference: "pg3-table1-column3",
                                level: 0
                            }
                        }),
                        new Paragraph({
                            text: "Green verges and public park:",
                            numbering: {
                                reference: "pg3-table1-column3",
                                level: 0
                            }
                        }),
                        new Paragraph({
                            text: "AC Block Park",
                            numbering: {
                                reference: "pg3-table1-column3",
                                level: 1
                            }
                        }),
                        new Paragraph({
                            text: "NKDA Park",
                            numbering: {
                                reference: "pg3-table1-column3",
                                level: 1
                            }
                        }),
                        new Paragraph({
                            text: "NKDA Sensory Park",
                            numbering: {
                                reference: "pg3-table1-column3",
                                level: 1
                            }
                        }),
                    ],
                    borders: {
                        right: {
                            style: BorderStyle.THICK,
                            color: "FFFFFF",
                            size: 20,
                        }
                    },
                }),
                new TableCell({
                    width: {
                        size: "25%",
                    },
                    shading: {
                        color: "8FAADC",
                        type: ShadingType.SOLID,
                    },
                    children: [
                        new Paragraph({
                            text: "Name & Length (Approx.)",
                            indent: {
                                left: convertInchesToTwip(0.1),
                            }
                        }),
                        new Paragraph({
                            text: "C Canal: 338.86 mt.",
                            numbering: {
                                reference: "pg3-table1-column4",
                                level: 0
                            }
                        }),
                    ],
                }),
            ]
        })
    ]
});

const pg3Table2 = new Table({
    width: {
        size: "24.92cm",
    },
    float: {
        absoluteHorizontalPosition: "0cm",
        absoluteVerticalPosition: "9cm"
    },
    borders: {
        top: { style: BorderStyle.NONE, size: 0 },
        bottom: { style: BorderStyle.NONE, size: 0 },
        left: { style: BorderStyle.NONE, size: 0 },
        right: { style: BorderStyle.NONE, size: 0 },
    },
    rows: [
        new TableRow({
            height: {
                value: "0.75cm",
                rule: HeightRule.EXACT
            },
            children: [
                new TableCell({
                    width: {
                        size: "25%",
                    },
                    shading: {
                        color: "384454",
                        type: ShadingType.SOLID,
                    },
                    children: [
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                                new TextRun({
                                    text: "Water Bodies",
                                    bold: true,
                                    color: "FFFFFF",
                                    size: "12pt",
                                    font: "Calibri"
                                })
                            ]
                        }),
                    ],
                    borders: {
                        bottom: {
                            style: BorderStyle.THICK,
                            color: "FFFFFF",
                            size: 20,
                        },
                        right: {
                            style: BorderStyle.THICK,
                            color: "FFFFFF",
                            size: 20,
                        },
                    },
                    verticalAlign: VerticalAlign.CENTER,
                }),
                new TableCell({
                    width: {
                        size: "25%",
                    },
                    shading: {
                        color: "384454",
                        type: ShadingType.SOLID,
                    },
                    children: [
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                                new TextRun({
                                    text: "Waste Bins",
                                    bold: true,
                                    color: "FFFFFF",
                                    size: "12pt",
                                    font: "Calibri"
                                })
                            ]
                        }),
                    ],
                    borders: {
                        bottom: {
                            style: BorderStyle.THICK,
                            color: "FFFFFF",
                            size: 20,
                        },
                        right: {
                            style: BorderStyle.THICK,
                            color: "FFFFFF",
                            size: 20,
                        }
                    },
                    verticalAlign: VerticalAlign.CENTER,
                }),
                new TableCell({
                    width: {
                        size: "25%",
                    },
                    shading: {
                        color: "384454",
                        type: ShadingType.SOLID,
                    },
                    children: [
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                                new TextRun({
                                    text: "Major Construction Sites",
                                    bold: true,
                                    color: "FFFFFF",
                                    size: "12pt",
                                    font: "Calibri"
                                })
                            ]
                        }),
                    ],
                    borders: {
                        bottom: {
                            style: BorderStyle.THICK,
                            color: "FFFFFF",
                            size: 20,
                        },
                        right: {
                            style: BorderStyle.THICK,
                            color: "FFFFFF",
                            size: 20,
                        }
                    },
                    verticalAlign: VerticalAlign.CENTER,
                }),
                new TableCell({
                    width: {
                        size: "25%",
                    },
                    shading: {
                        color: "384454",
                        type: ShadingType.SOLID,
                    },
                    children: [
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                                new TextRun({
                                    text: "Cycle Track",
                                    bold: true,
                                    color: "FFFFFF",
                                    size: "12pt",
                                    font: "Calibri"
                                })
                            ]
                        }),
                    ],
                    borders: {
                        bottom: {
                            style: BorderStyle.THICK,
                            color: "FFFFFF",
                            size: 20,
                        }
                    },
                    verticalAlign: VerticalAlign.CENTER,
                }),
            ]
        }),
        new TableRow({
            height: {
                value: "2.5cm",
                rule: HeightRule.EXACT
            },
            children: [
                new TableCell({
                    margins:{
                        top: 100,
                    },
                    width: {
                        size: "25%",
                    },
                    shading: {
                        color: "EAD1C0",
                        type: ShadingType.SOLID,
                    },
                    children: [
                        new Paragraph({
                            text: "Name: AC Block",
                            indent: {
                                left: convertInchesToTwip(0.1),
                            }
                        }),
                        new Paragraph({
                            text: "Perimeter: 99.79 sq. mt.",
                            numbering: {
                                reference: "pg3-table2-column1",
                                level: 0
                            }
                        }),
                        new Paragraph({
                            text: "Area: 701.82 sq. mt.",
                            numbering: {
                                reference: "pg3-table2-column1",
                                level: 0
                            }
                        }),
                        new Paragraph({
                            text: "Clean: Not Verified",
                            numbering: {
                                reference: "pg3-table2-column1",
                                level: 0
                            }
                        }),
                        new Paragraph({
                            text: "Swimmable: Not Verified",
                            numbering: {
                                reference: "pg3-table2-column1",
                                level: 0
                            }
                        }),
                    ],
                    borders: {
                        right: {
                            style: BorderStyle.THICK,
                            color: "FFFFFF",
                            size: 20,
                        }
                    },
                }),
                new TableCell({
                    width: {
                        size: "25%",
                    },
                    shading: {
                        color: "EAD1C0",
                        type: ShadingType.SOLID,
                    },
                    children: [
                        new Paragraph({
                            text: "NA",
                            alignment: AlignmentType.CENTER,
                        }),
                    ],
                    borders: {
                        right: {
                            style: BorderStyle.THICK,
                            color: "FFFFFF",
                            size: 20,
                        }
                    },
                }),
                new TableCell({
                    width: {
                        size: "25%",
                    },
                    shading: {
                        color: "EAD1C0",
                        type: ShadingType.SOLID,
                    },
                    children: [
                        new Paragraph({
                            text: "23 Nos",
                            alignment: AlignmentType.CENTER,
                        }),
                    ],
                    borders: {
                        right: {
                            style: BorderStyle.THICK,
                            color: "FFFFFF",
                            size: 20,
                        }
                    },
                }),
                new TableCell({
                    width: {
                        size: "25%",
                    },
                    shading: {
                        color: "EAD1C0",
                        type: ShadingType.SOLID,
                    },
                    children: [
                        new Paragraph({
                            text: "Cycle Track Length: 1800.17 mt. (Approx)",
                            numbering: {
                                reference: "pg3-table2-column4",
                                level: 0
                            }
                        }),
                        new Paragraph({
                            text: "Street with no cycle track: 64, 41",
                            numbering: {
                                reference: "pg3-table2-column4",
                                level: 0
                            }
                        }),
                        new Paragraph({
                            text: "Major Problem: NA",
                            numbering: {
                                reference: "pg3-table2-column4",
                                level: 0
                            }
                        }),
                        new Paragraph({
                            text: "Cycle Route: No",
                            numbering: {
                                reference: "pg3-table2-column4",
                                level: 0
                            }
                        }),
                    ],
                }),
            ]
        })
    ]
});

const pg3Table3 = new Table({
    width: {
        size: "24.92cm",
    },
    float: {
        absoluteHorizontalPosition: "0cm",
        absoluteVerticalPosition: "12.75cm"
    },
    borders: {
        top: { style: BorderStyle.NONE, size: 0 },
        bottom: { style: BorderStyle.NONE, size: 0 },
        left: { style: BorderStyle.NONE, size: 0 },
        right: { style: BorderStyle.NONE, size: 0 },
    },
    rows: [
        new TableRow({
            height: {
                value: "0.75cm",
                rule: HeightRule.EXACT
            },
            children: [
                new TableCell({
                    width: {
                        size: "18%",
                    },
                    columnSpan: 2,
                    shading: {
                        color: "384454",
                        type: ShadingType.SOLID,
                    },
                    children: [
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                                new TextRun({
                                    text: "Street Lights",
                                    bold: true,
                                    color: "FFFFFF",
                                    size: "12pt",
                                    font: "Calibri"
                                })
                            ]
                        }),
                    ],
                    borders: {
                        right: {
                            style: BorderStyle.THICK,
                            color: "D9D9D9",
                            size: 50,
                        },
                    },
                    verticalAlign: VerticalAlign.CENTER,
                }),
                new TableCell({
                    width: {
                        size: "18%",
                    },
                    columnSpan: 2,
                    shading: {
                        color: "384454",
                        type: ShadingType.SOLID,
                    },
                    children: [
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                                new TextRun({
                                    text: "Parking",
                                    bold: true,
                                    color: "FFFFFF",
                                    size: "12pt",
                                    font: "Calibri"
                                })
                            ]
                        }),
                    ],
                    borders: {
                        right: {
                            style: BorderStyle.THICK,
                            color: "D9D9D9",
                            size: 50,
                        },
                    },
                    verticalAlign: VerticalAlign.CENTER,
                }),
                new TableCell({
                    width: {
                        size: "18%",
                    },
                    columnSpan: 2,
                    shading: {
                        color: "384454",
                        type: ShadingType.SOLID,
                    },
                    children: [
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                                new TextRun({
                                    text: "Public Market",
                                    bold: true,
                                    color: "FFFFFF",
                                    size: "12pt",
                                    font: "Calibri"
                                })
                            ]
                        }),
                    ],
                    borders: {
                        right: {
                            style: BorderStyle.THICK,
                            color: "D9D9D9",
                            size: 50,
                        },
                    },
                    verticalAlign: VerticalAlign.CENTER,
                }),
                new TableCell({
                    width: {
                        size: "18%",
                    },
                    columnSpan: 2,
                    shading: {
                        color: "384454",
                        type: ShadingType.SOLID,
                    },
                    children: [
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                                new TextRun({
                                    text: "Stubble Burning",
                                    bold: true,
                                    color: "FFFFFF",
                                    size: "12pt",
                                    font: "Calibri"
                                })
                            ]
                        }),
                    ],
                    borders: {
                        right: {
                            style: BorderStyle.THICK,
                            color: "D9D9D9",
                            size: 50,
                        },
                    },
                    verticalAlign: VerticalAlign.CENTER,
                }),
                new TableCell({
                    width: {
                        size: "28%",
                    },
                    columnSpan: 1,
                    shading: {
                        color: "384454",
                        type: ShadingType.SOLID,
                    },
                    children: [
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                                new TextRun({
                                    text: "Others",
                                    bold: true,
                                    color: "FFFFFF",
                                    size: "12pt",
                                    font: "Calibri"
                                })
                            ]
                        }),
                    ],
                    verticalAlign: VerticalAlign.CENTER,
                }),
            ],
        }),
        new TableRow({
            height: {
                value: "0.75cm",
                rule: HeightRule.EXACT
            },
            children: [
                new TableCell({
                    width: {
                        size: "18%",
                    },
                    columnSpan: 2,
                    shading: {
                        color: "EEE6D1",
                        type: ShadingType.SOLID,
                    },
                    children: [new Paragraph({
                        text: "100",
                        alignment: AlignmentType.CENTER,
                    })],
                    borders: {
                        bottom: {
                            style: BorderStyle.THICK,
                            color: "D9D9D9",
                            size: 50,
                        },
                        right: {
                            style: BorderStyle.THICK,
                            color: "D9D9D9",
                            size: 50,
                        },
                    },
                    verticalAlign: VerticalAlign.CENTER,
                }),
                new TableCell({
                    width: {
                        size: "18%",
                    },
                    columnSpan: 2,
                    shading: {
                        color: "EEE6D1",
                        type: ShadingType.SOLID,
                    },
                    children: [new Paragraph({
                        text: "00",
                        alignment: AlignmentType.CENTER,
                    })],
                    borders: {
                        bottom: {
                            style: BorderStyle.THICK,
                            color: "D9D9D9",
                            size: 50,
                        },
                        right: {
                            style: BorderStyle.THICK,
                            color: "D9D9D9",
                            size: 50,
                        },
                    },
                    verticalAlign: VerticalAlign.CENTER,
                }),
                new TableCell({
                    width: {
                        size: "18%",
                    },
                    columnSpan: 2,
                    shading: {
                        color: "EEE6D1",
                        type: ShadingType.SOLID,
                    },
                    children: [new Paragraph({
                        text: "00",
                        alignment: AlignmentType.CENTER,
                    })],
                    borders: {
                        bottom: {
                            style: BorderStyle.THICK,
                            color: "D9D9D9",
                            size: 50,
                        },
                        right: {
                            style: BorderStyle.THICK,
                            color: "D9D9D9",
                            size: 50,
                        },
                    },
                    verticalAlign: VerticalAlign.CENTER,
                }),
                new TableCell({
                    width: {
                        size: "18%",
                    },
                    columnSpan: 2,
                    shading: {
                        color: "EEE6D1",
                        type: ShadingType.SOLID,
                    },
                    children: [new Paragraph({
                        text: "NA",
                        alignment: AlignmentType.CENTER,
                    })],
                    borders: {
                        bottom: {
                            style: BorderStyle.THICK,
                            color: "D9D9D9",
                            size: 50,
                        },
                        right: {
                            style: BorderStyle.THICK,
                            color: "D9D9D9",
                            size: 50,
                        },
                    },
                    verticalAlign: VerticalAlign.CENTER,
                }),
                new TableCell({
                    width: {
                        size: "28%",
                    },
                    columnSpan: 1,
                    rowSpan: 5,
                    shading: {
                        color: "EEE6D1",
                        type: ShadingType.SOLID,
                    },
                    children: [
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            text: "Neighbourhood Center: 1"
                        }),
                    ],
                    verticalAlign: VerticalAlign.CENTER,
                }),
            ],
        }),
        new TableRow({
            height: {
                value: "0.75cm",
                rule: HeightRule.EXACT
            },
            children: [
                new TableCell({
                    width: {
                        size: "27%",
                    },
                    columnSpan: 3,
                    shading: {
                        color: "384454",
                        type: ShadingType.SOLID,
                    },
                    children: [
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                                new TextRun({
                                    text: "Police Stations/ Fire Stations",
                                    bold: true,
                                    color: "FFFFFF",
                                    size: "12pt",
                                    font: "Calibri"
                                })
                            ]
                        }),
                    ],
                    borders: {
                        right: {
                            style: BorderStyle.THICK,
                            color: "D9D9D9",
                            size: 50,
                        },
                    },
                    verticalAlign: VerticalAlign.CENTER,
                }),
                new TableCell({
                    width: {
                        size: "27%",
                    },
                    columnSpan: 3,
                    shading: {
                        color: "384454",
                        type: ShadingType.SOLID,
                    },
                    children: [
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                                new TextRun({
                                    text: "Water & Drainage Network",
                                    bold: true,
                                    color: "FFFFFF",
                                    size: "12pt",
                                    font: "Calibri"
                                })
                            ]
                        }),
                    ],
                    borders: {
                        right: {
                            style: BorderStyle.THICK,
                            color: "D9D9D9",
                            size: 50,
                        },
                    },
                    verticalAlign: VerticalAlign.CENTER,
                }),
                new TableCell({
                    width: {
                        size: "18%",
                    },
                    columnSpan: 2,
                    shading: {
                        color: "384454",
                        type: ShadingType.SOLID,
                    },
                    children: [
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                                new TextRun({
                                    text: "Public Art",
                                    bold: true,
                                    color: "FFFFFF",
                                    size: "12pt",
                                    font: "Calibri"
                                })
                            ]
                        }),
                    ],
                    borders: {
                        right: {
                            style: BorderStyle.THICK,
                            color: "D9D9D9",
                            size: 50,
                        },
                    },
                    verticalAlign: VerticalAlign.CENTER,
                }),
            ],
        }),
        new TableRow({
            height: {
                value: "0.75cm",
                rule: HeightRule.EXACT
            },
            children: [
                new TableCell({
                    width: {
                        size: "27%",
                    },
                    columnSpan: 3,
                    shading: {
                        color: "EEE6D1",
                        type: ShadingType.SOLID,
                    },
                    children: [
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            text: "00",
                        }),
                    ],
                    borders: {
                        bottom: {
                            style: BorderStyle.THICK,
                            color: "D9D9D9",
                            size: 50,
                        },
                        right: {
                            style: BorderStyle.THICK,
                            color: "D9D9D9",
                            size: 50,
                        },
                    },
                    verticalAlign: VerticalAlign.CENTER,
                }),
                new TableCell({
                    width: {
                        size: "27%",
                    },
                    columnSpan: 3,
                    rowSpan: 3,
                    shading: {
                        color: "EEE6D1",
                        type: ShadingType.SOLID,
                    },
                    children: [
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                                new TextRun("No. of Water Tank: 01"),
                                new TextRun({
                                    text: "Water Logging: NA",
                                    break: 1,
                                }),
                                new TextRun({
                                    text: "Water Harvesting Pit: NA",
                                    break: 1,
                                }),
                            ]
                        }),
                    ],
                    borders: {
                        bottom: {
                            style: BorderStyle.THICK,
                            color: "D9D9D9",
                            size: 50,
                        },
                        right: {
                            style: BorderStyle.THICK,
                            color: "D9D9D9",
                            size: 50,
                        },
                    },
                    verticalAlign: VerticalAlign.CENTER,
                }),
                new TableCell({
                    width: {
                        size: "18%",
                    },
                    columnSpan: 2,
                    shading: {
                        color: "EEE6D1",
                        type: ShadingType.SOLID,
                    },
                    children: [
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            text: "NA",
                        }),
                    ],
                    borders: {
                        right: {
                            style: BorderStyle.THICK,
                            color: "D9D9D9",
                            size: 50,
                        },
                        bottom: {
                            style: BorderStyle.THICK,
                            color: "D9D9D9",
                            size: 50,
                        },
                    },
                    verticalAlign: VerticalAlign.CENTER,
                }),
            ],
        }),
        new TableRow({
            height: {
                value: "0.75cm",
                rule: HeightRule.EXACT
            },
            children: [
                new TableCell({
                    width: {
                        size: "27%",
                    },
                    columnSpan: 3,
                    shading: {
                        color: "384454",
                        type: ShadingType.SOLID,
                    },
                    children: [
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                                new TextRun({
                                    text: "Rooftop Solar",
                                    bold: true,
                                    color: "FFFFFF",
                                    size: "12pt",
                                    font: "Calibri"
                                })
                            ]
                        }),
                    ],
                    borders: {
                        right: {
                            style: BorderStyle.THICK,
                            color: "D9D9D9",
                            size: 50,
                        },
                    },
                    verticalAlign: VerticalAlign.CENTER,
                }),
                new TableCell({
                    width: {
                        size: "18%",
                    },
                    columnSpan: 2,
                    shading: {
                        color: "384454",
                        type: ShadingType.SOLID,
                    },
                    children: [
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                                new TextRun({
                                    text: "Public Gym",
                                    bold: true,
                                    color: "FFFFFF",
                                    size: "12pt",
                                    font: "Calibri"
                                })
                            ]
                        }),
                    ],
                    borders: {
                        right: {
                            style: BorderStyle.THICK,
                            color: "D9D9D9",
                            size: 50,
                        },
                    },
                    verticalAlign: VerticalAlign.CENTER,
                }),
            ],
        }),
        new TableRow({
            height: {
                value: "0.75cm",
                rule: HeightRule.EXACT
            },
            children: [
                new TableCell({
                    width: {
                        size: "27%",
                    },
                    columnSpan: 3,
                    shading: {
                        color: "EEE6D1",
                        type: ShadingType.SOLID,
                    },
                    children: [
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            text: "NA",
                        }),
                    ],
                    borders: {
                        bottom: {
                            style: BorderStyle.THICK,
                            color: "D9D9D9",
                            size: 50,
                        },
                        right: {
                            style: BorderStyle.THICK,
                            color: "D9D9D9",
                            size: 50,
                        },
                    },
                    verticalAlign: VerticalAlign.CENTER,
                }),
                new TableCell({
                    width: {
                        size: "18%",
                    },
                    columnSpan: 2,
                    shading: {
                        color: "EEE6D1",
                        type: ShadingType.SOLID,
                    },
                    children: [
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            text: "NA",
                        }),
                    ],
                    borders: {
                        right: {
                            style: BorderStyle.THICK,
                            color: "D9D9D9",
                            size: 50,
                        },
                        bottom: {
                            style: BorderStyle.THICK,
                            color: "D9D9D9",
                            size: 50,
                        },
                    },
                    verticalAlign: VerticalAlign.CENTER,
                }),
            ],
        }),
    ],
});

const idTextBox = new Paragraph({
    frame: {
        position: {
            x: 12100,
            y: 0,
        },
        width: 2000,
        height: 200,
        anchor: {
            horizontal: FrameAnchorType.MARGIN,
            vertical: FrameAnchorType.MARGIN,
        },
    },
    children: [
        new TextRun({
            text: "FSIPL/NKDA/R/003",
            color: "7E7E7E",
            size: "10pt",
            font: {
                name: "Arial MT",
            },
        }),
    ],
});

export const page3 = {
    properties: commonPageProperties,
    footers: commonPageFooter,
    children: [
        pg3Heading,
        pg3Table1,
        pg3Table2,
        pg3Table3,
        idTextBox
    ],
};

