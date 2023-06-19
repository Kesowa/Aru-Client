import * as fs from "fs";
import { Table, TableRow, HeightRule, TableCell, Paragraph, TextRun, BorderStyle, VerticalAlign, FrameAnchorType, HorizontalPositionRelativeFrom, ImageRun, VerticalPositionRelativeFrom, AlignmentType, HorizontalPositionAlign, ShadingType, VerticalPositionAlign, Footer, PageNumber, PageOrientation } from "docx";

const table1 = new Table({
    width: {
        size: "13.97cm",
    },
    float: {
        absoluteHorizontalPosition: "0cm",
        absoluteVerticalPosition: "0.5cm"
    },
    rows: [
        new TableRow({
            height: {
                value: "0.6cm",
                rule: HeightRule.EXACT
            },
            children: [
                new TableCell({
                    width: {
                        size: "40%",
                    },
                    rowSpan: 2,
                    columnSpan: 2,
                    children: [
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "Total Area of Block",
                                    bold: true,
                                })
                            ]
                        }),
                    ],
                    borders: {
                        bottom: {
                            style: BorderStyle.THICK,
                            color: "000000",
                            size: 15,
                        }
                    },
                    verticalAlign: VerticalAlign.CENTER,
                }),
                new TableCell({
                    width: {
                        size: "20%",
                    },
                    children: [
                        new Paragraph("Area in Sq. Km."),
                    ],
                }),
                new TableCell({
                    width: {
                        size: "20%",
                    },
                    children: [
                        new Paragraph("Area in Sq. Mt."),
                    ],
                }),
                new TableCell({
                    width: {
                        size: "20%",
                    },
                    children: [
                        new Paragraph("Area in Acres."),
                    ],
                    borders: {
                        right: {
                            style: BorderStyle.THICK,
                            color: "000000",
                            size: 15,
                        }
                    },
                }),
            ]
        }),
        new TableRow({
            height: {
                value: "0.6cm",
                rule: HeightRule.EXACT
            },
            children: [
                new TableCell({
                    width: {
                        size: "20%",
                    },
                    children: [
                        new Paragraph("0.14"),
                    ],
                    borders: {
                        bottom: {
                            style: BorderStyle.THICK,
                            color: "000000",
                            size: 15,
                        }
                    }
                }),
                new TableCell({
                    width: {
                        size: "20%",
                    },
                    children: [
                        new Paragraph("142129.41"),
                    ],
                    borders: {
                        bottom: {
                            style: BorderStyle.THICK,
                            color: "000000",
                            size: 15,
                        }
                    }
                }),
                new TableCell({
                    width: {
                        size: "20%",
                    },
                    children: [
                        new Paragraph("35.12"),
                    ],
                    borders: {
                        bottom: {
                            style: BorderStyle.THICK,
                            color: "000000",
                            size: 15,
                        },
                        right: {
                            style: BorderStyle.THICK,
                            color: "000000",
                            size: 15,
                        }
                    },
                }),
            ]
        }),
        new TableRow({
            height: {
                value: "0.6cm",
                rule: HeightRule.EXACT
            },
            children: [
                new TableCell({
                    width: {
                        size: "40%",
                    },
                    children: [
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "Structure of Block",
                                    bold: true,
                                })
                            ]
                        }),
                    ],
                    columnSpan: 2,
                }),
                new TableCell({
                    width: {
                        size: "40%",
                    },
                    children: [
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "Boundary Area",
                                    bold: true,
                                })
                            ]
                        }),
                    ],
                    columnSpan: 2,
                }),
                new TableCell({
                    width: {
                        size: "20%",
                    },
                    children: [
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "Total % Area",
                                    bold: true,
                                })
                            ]
                        }),
                    ],
                    borders: {
                        right: {
                            style: BorderStyle.THICK,
                            color: "000000",
                            size: 15,
                        }
                    },
                }),
            ]
        }),
        new TableRow({
            height: {
                value: "0.6cm",
                rule: HeightRule.EXACT
            },
            children: [
                new TableCell({
                    width: {
                        size: "40%",
                    },
                    children: [],
                    columnSpan: 2,
                }),
                new TableCell({
                    width: {
                        size: "20%",
                    },
                    children: [
                        new Paragraph("In Sq. Mt."),
                    ],
                }),
                new TableCell({
                    width: {
                        size: "20%",
                    },
                    children: [
                        new Paragraph("In Acres"),
                    ],
                }),
                new TableCell({
                    width: {
                        size: "20%",
                    },
                    children: [
                        new Paragraph("100"),
                    ],
                    borders: {
                        right: {
                            style: BorderStyle.THICK,
                            color: "000000",
                            size: 15,
                        }
                    },
                }),
            ]
        }),
        new TableRow({
            height: {
                value: "0.6cm",
                rule: HeightRule.EXACT
            },
            children: [
                new TableCell({
                    width: {
                        size: "40%",
                    },
                    children: [new Paragraph("Private Space")],
                    verticalAlign: VerticalAlign.CENTER,
                    columnSpan: 2,
                }),
                new TableCell({ 
                    width: { 
                        size: "20%" 
                    }, 
                    children: [] 
                }),
                new TableCell({ 
                    width: { 
                        size: "20%" 
                    }, 
                    children: [] 
                }),
                new TableCell({ 
                    width: { 
                        size: "20%" 
                    }, 
                    children: [],
                    borders: {
                        right: {
                            style: BorderStyle.THICK,
                            color: "000000",
                            size: 15,
                        }
                    },
                }),
            ]
        }),
        new TableRow({
            height: {
                value: "0.6cm",
                rule: HeightRule.EXACT
            },
            children: [
                new TableCell({
                    width: {
                        size: "10%",
                    },
                    children: [],
                    rowSpan: 4,
                }),
                new TableCell({
                    width: {
                        size: "30%",
                    },
                    children: [new Paragraph("Private Commercial")],
                    verticalAlign: VerticalAlign.CENTER,
                }),
                new TableCell({ 
                    width: { 
                        size: "20%" 
                    }, 
                    children: [new Paragraph("0")], 
                }),
                new TableCell({ 
                    width: { 
                        size: "20%" 
                    }, 
                    children: [new Paragraph("0.00")], 
                }),
                new TableCell({ 
                    width: { 
                        size: "20%" 
                    }, 
                    children: [new Paragraph("0.00")],
                    borders: {
                        right: {
                            style: BorderStyle.THICK,
                            color: "000000",
                            size: 15,
                        }
                    }, 
                }),
            ]
        }),
        new TableRow({
            height: {
                value: "0.6cm",
                rule: HeightRule.EXACT
            },
            children: [
                new TableCell({
                    width: {
                        size: "30%",
                    },
                    children: [new Paragraph("Residential")],
                    verticalAlign: VerticalAlign.CENTER,
                }),
                new TableCell({ 
                    width: { 
                        size: "20%" 
                    }, 
                    children: [new Paragraph("76473.75")], 
                }),
                new TableCell({ 
                    width: { 
                        size: "20%" 
                    }, 
                    children: [new Paragraph("18.90")], 
                }),
                new TableCell({ 
                    width: { 
                        size: "20%" 
                    }, 
                    children: [new Paragraph("53.81")], 
                    borders: {
                        right: {
                            style: BorderStyle.THICK,
                            color: "000000",
                            size: 15,
                        }
                    },
                }),
            ]
        }),
        new TableRow({
            height: {
                value: "0.6cm",
                rule: HeightRule.EXACT
            },
            children: [
                new TableCell({
                    width: {
                        size: "30%",
                    },
                    children: [new Paragraph("Govt. Commercial")],
                    verticalAlign: VerticalAlign.CENTER,
                }),
                new TableCell({ 
                    width: { 
                        size: "20%" 
                    }, 
                    children: [new Paragraph("0")], 
                }),
                new TableCell({ 
                    width: { 
                        size: "20%" 
                    }, 
                    children: [new Paragraph("0.00")], 
                }),
                new TableCell({ 
                    width: { 
                        size: "20%" 
                    }, 
                    children: [new Paragraph("0.00")], 
                    borders: {
                        right: {
                            style: BorderStyle.THICK,
                            color: "000000",
                            size: 15,
                        }
                    },
                }),
            ]
        }),
        new TableRow({
            height: {
                value: "0.6cm",
                rule: HeightRule.EXACT
            },
            children: [
                new TableCell({
                    width: {
                        size: "30%",
                    },
                    children: [new Paragraph("Housing Complex")],
                    verticalAlign: VerticalAlign.CENTER,
                }),
                new TableCell({ 
                    width: { 
                        size: "20%" 
                    }, 
                    children: [new Paragraph("0")], 
                }),
                new TableCell({ 
                    width: { 
                        size: "20%" 
                    }, 
                    children: [new Paragraph("0.00")], 
                }),
                new TableCell({ 
                    width: { 
                        size: "20%" 
                    }, 
                    children: [new Paragraph("0.00")], 
                    borders: {
                        right: {
                            style: BorderStyle.THICK,
                            color: "000000",
                            size: 15,
                        }
                    },
                }),
            ]
        }),
        new TableRow({
            height: {
                value: "0.6cm",
                rule: HeightRule.EXACT
            },
            children: [
                new TableCell({
                    width: {
                        size: "40%",
                    },
                    children: [new Paragraph("Public Space")],
                    verticalAlign: VerticalAlign.CENTER,
                    columnSpan: 2,
                }),
                new TableCell({ 
                    width: { 
                        size: "20%" 
                    }, 
                    children: [] 
                }),
                new TableCell({ 
                    width: { 
                        size: "20%" 
                    }, 
                    children: [] 
                }),
                new TableCell({ 
                    width: { 
                        size: "20%" 
                    }, 
                    children: [],
                    borders: {
                        right: {
                            style: BorderStyle.THICK,
                            color: "000000",
                            size: 15,
                        }
                    },
                }),
            ]
        }),
        new TableRow({
            height: {
                value: "0.6cm",
                rule: HeightRule.EXACT
            },
            children: [
                new TableCell({
                    width: {
                        size: "10%",
                    },
                    children: [],
                    rowSpan: 7,
                }),
                new TableCell({
                    width: {
                        size: "30%",
                    },
                    children: [new Paragraph("Government")],
                    verticalAlign: VerticalAlign.CENTER,
                }),
                new TableCell({ 
                    width: { 
                        size: "20%" 
                    }, 
                    children: [new Paragraph("14259.07")], 
                }),
                new TableCell({ 
                    width: { 
                        size: "20%" 
                    }, 
                    children: [new Paragraph("3.52")], 
                }),
                new TableCell({ 
                    width: { 
                        size: "20%" 
                    }, 
                    children: [new Paragraph("10.03")], 
                    borders: {
                        right: {
                            style: BorderStyle.THICK,
                            color: "000000",
                            size: 15,
                        }
                    },
                }),
            ]
        }),
        new TableRow({
            height: {
                value: "0.6cm",
                rule: HeightRule.EXACT
            },
            children: [
                new TableCell({
                    width: {
                        size: "30%",
                    },
                    children: [new Paragraph("Motorable Roads")],
                    verticalAlign: VerticalAlign.CENTER,
                }),
                new TableCell({ 
                    width: { 
                        size: "20%" 
                    }, 
                    children: [new Paragraph("19495.55")], 
                }),
                new TableCell({ 
                    width: { 
                        size: "20%" 
                    }, 
                    children: [new Paragraph("4.82")], 
                }),
                new TableCell({ 
                    width: { 
                        size: "20%" 
                    }, 
                    children: [new Paragraph("13.72")], 
                    borders: {
                        right: {
                            style: BorderStyle.THICK,
                            color: "000000",
                            size: 15,
                        }
                    },
                }),
            ]
        }),
        new TableRow({
            height: {
                value: "0.6cm",
                rule: HeightRule.EXACT
            },
            children: [
                new TableCell({
                    width: {
                        size: "30%",
                    },
                    children: [new Paragraph("Footpath")],
                    verticalAlign: VerticalAlign.CENTER,
                }),
                new TableCell({ 
                    width: { 
                        size: "20%" 
                    }, 
                    children: [new Paragraph("4873.41")], 
                }),
                new TableCell({ 
                    width: { 
                        size: "20%" 
                    }, 
                    children: [new Paragraph("1.20")], 
                }),
                new TableCell({ 
                    width: { 
                        size: "20%" 
                    }, 
                    children: [new Paragraph("3.43")], 
                    borders: {
                        right: {
                            style: BorderStyle.THICK,
                            color: "000000",
                            size: 15,
                        }
                    },
                }),
            ]
        }),
        new TableRow({
            height: {
                value: "0.6cm",
                rule: HeightRule.EXACT
            },
            children: [
                new TableCell({
                    width: {
                        size: "30%",
                    },
                    children: [new Paragraph("Cycle Track")],
                    verticalAlign: VerticalAlign.CENTER,
                }),
                new TableCell({ 
                    width: { 
                        size: "20%" 
                    }, 
                    children: [new Paragraph("584.46")], 
                }),
                new TableCell({ 
                    width: { 
                        size: "20%" 
                    }, 
                    children: [new Paragraph("0.14")], 
                }),
                new TableCell({ 
                    width: { 
                        size: "20%" 
                    }, 
                    children: [new Paragraph("0.41")], 
                    borders: {
                        right: {
                            style: BorderStyle.THICK,
                            color: "000000",
                            size: 15,
                        }
                    },
                }),
            ]
        }),
        new TableRow({
            height: {
                value: "0.6cm",
                rule: HeightRule.EXACT
            },
            children: [
                new TableCell({
                    width: {
                        size: "30%",
                    },
                    children: [new Paragraph("Parks and Green")],
                    verticalAlign: VerticalAlign.CENTER,
                }),
                new TableCell({ 
                    width: { 
                        size: "20%" 
                    }, 
                    children: [new Paragraph("14430.05")], 
                }),
                new TableCell({ 
                    width: { 
                        size: "20%" 
                    }, 
                    children: [new Paragraph("3.57")], 
                }),
                new TableCell({ 
                    width: { 
                        size: "20%" 
                    }, 
                    children: [new Paragraph("10.15")], 
                    borders: {
                        right: {
                            style: BorderStyle.THICK,
                            color: "000000",
                            size: 15,
                        }
                    },
                }),
            ]
        }),
        new TableRow({
            height: {
                value: "0.6cm",
                rule: HeightRule.EXACT
            },
            children: [
                new TableCell({
                    width: {
                        size: "30%",
                    },
                    children: [new Paragraph("Waterbody")],
                    verticalAlign: VerticalAlign.CENTER,
                }),
                new TableCell({ 
                    width: { 
                        size: "20%" 
                    }, 
                    children: [new Paragraph("701.82")], 
                }),
                new TableCell({ 
                    width: { 
                        size: "20%" 
                    }, 
                    children: [new Paragraph("0.17")], 
                }),
                new TableCell({ 
                    width: { 
                        size: "20%" 
                    }, 
                    children: [new Paragraph("0.49")], 
                    borders: {
                        right: {
                            style: BorderStyle.THICK,
                            color: "000000",
                            size: 15,
                        }
                    },
                }),
            ]
        }),
        new TableRow({
            height: {
                value: "0.6cm",
                rule: HeightRule.EXACT
            },
            children: [
                new TableCell({
                    width: {
                        size: "30%",
                    },
                    children: [],
                }),
                new TableCell({ 
                    width: { 
                        size: "20%" 
                    }, 
                    children: [], 
                }),
                new TableCell({ 
                    width: { 
                        size: "20%" 
                    }, 
                    children: [], 
                }),
                new TableCell({ 
                    width: { 
                        size: "20%" 
                    }, 
                    children: [], 
                    borders: {
                        right: {
                            style: BorderStyle.THICK,
                            color: "000000",
                            size: 15,
                        }
                    },
                }),
            ]
        }),
        new TableRow({
            height: {
                value: "0.6cm",
                rule: HeightRule.EXACT
            },
            children: [
                new TableCell({
                    width: {
                        size: "40%",
                    },
                    children: [new Paragraph("Other")],
                    verticalAlign: VerticalAlign.CENTER,
                    columnSpan: 2,
                    borders: {
                        bottom: {
                            style: BorderStyle.THICK,
                            color: "000000",
                            size: 15,
                        }
                    }
                }),
                new TableCell({ 
                    width: { 
                        size: "20%" 
                    }, 
                    children: [new Paragraph("11311.3")],
                    borders: {
                        bottom: {
                            style: BorderStyle.THICK,
                            color: "000000",
                            size: 15,
                        }
                    }
                }),
                new TableCell({ 
                    width: { 
                        size: "20%" 
                    }, 
                    children: [new Paragraph("2.80")],
                    borders: {
                        bottom: {
                            style: BorderStyle.THICK,
                            color: "000000",
                            size: 15,
                        }
                    }
                }),
                new TableCell({ 
                    width: { 
                        size: "20%" 
                    }, 
                    children: [new Paragraph("7.96")],
                    borders: {
                        bottom: {
                            style: BorderStyle.THICK,
                            color: "000000",
                            size: 15,
                        },
                        right: {
                            style: BorderStyle.THICK,
                            color: "000000",
                            size: 15,
                        }
                    }
                }),
            ]
        }),
    ]
});

const table2 = new Table({
    width: {
        size: "13.97cm",
    },
    float: {
        absoluteHorizontalPosition: "0cm",
        absoluteVerticalPosition: "12cm"
    },
    rows: [
        new TableRow({
            height: {
                value: "0.9cm",
                rule: HeightRule.EXACT
            },
            children: [
                new TableCell({
                    width: {
                        size: "100%",
                    },
                    columnSpan: 5,
                    children: [
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "Occupancy",
                                    bold: true
                                })
                            ]
                        }),
                    ],
                    borders: {
                        bottom: {
                            style: BorderStyle.THICK,
                            color: "000000",
                            size: 15,
                        },
                        right: {
                            style: BorderStyle.THICK,
                            color: "000000",
                            size: 15,
                        }
                    },
                    verticalAlign: VerticalAlign.CENTER,
                }),
            ]
        }),
        new TableRow({
            height: {
                value: "0.9cm",
                rule: HeightRule.EXACT
            },
            children: [
                new TableCell({
                    width: {
                        size: "20%",
                    },
                    children: [],
                }),
                new TableCell({
                    width: {
                        size: "20%",
                    },
                    children: [new Paragraph("Visibly Occupied")],
                }),
                new TableCell({
                    width: {
                        size: "20%",
                    },
                    children: [new Paragraph("Visibly Under Cons.")],
                }),
                new TableCell({
                    width: {
                        size: "20%",
                    },
                    children: [new Paragraph("Visibly Vacant")],
                }),
                new TableCell({
                    width: {
                        size: "20%",
                    },
                    children: [new Paragraph("Total No. of Plots")],
                    borders: {
                        right: {
                            style: BorderStyle.THICK,
                            color: "000000",
                            size: 15,
                        }
                    },
                }),
            ]
        }),
        new TableRow({
            height: {
                value: "0.45cm",
                rule: HeightRule.EXACT
            },
            children: [
                new TableCell({
                    width: {
                        size: "20%",
                    },
                    children: [new Paragraph("Private Commercial")],
                }),
                new TableCell({
                    width: {
                        size: "20%",
                    },
                    children: [new Paragraph("0")],
                }),
                new TableCell({
                    width: {
                        size: "20%",
                    },
                    children: [new Paragraph("0")],
                }),
                new TableCell({
                    width: {
                        size: "20%",
                    },
                    children: [new Paragraph("0")],
                }),
                new TableCell({
                    width: {
                        size: "20%",
                    },
                    children: [new Paragraph("0")],
                    borders: {
                        right: {
                            style: BorderStyle.THICK,
                            color: "000000",
                            size: 15,
                        }
                    },
                }),
            ]
        }),
        new TableRow({
            height: {
                value: "0.45cm",
                rule: HeightRule.EXACT
            },
            children: [
                new TableCell({
                    width: {
                        size: "20%",
                    },
                    children: [new Paragraph("Residential")],
                }),
                new TableCell({
                    width: {
                        size: "20%",
                    },
                    children: [new Paragraph("157")],
                }),
                new TableCell({
                    width: {
                        size: "20%",
                    },
                    children: [new Paragraph("22")],
                }),
                new TableCell({
                    width: {
                        size: "20%",
                    },
                    children: [new Paragraph("50")],
                }),
                new TableCell({
                    width: {
                        size: "20%",
                    },
                    children: [new Paragraph("229")],
                    borders: {
                        right: {
                            style: BorderStyle.THICK,
                            color: "000000",
                            size: 15,
                        }
                    },
                }),
            ]
        }),
        new TableRow({
            height: {
                value: "0.45cm",
                rule: HeightRule.EXACT
            },
            children: [
                new TableCell({
                    width: {
                        size: "20%",
                    },
                    children: [new Paragraph("Govt. Commercial")],
                }),
                new TableCell({
                    width: {
                        size: "20%",
                    },
                    children: [new Paragraph("0")],
                }),
                new TableCell({
                    width: {
                        size: "20%",
                    },
                    children: [new Paragraph("0")],
                }),
                new TableCell({
                    width: {
                        size: "20%",
                    },
                    children: [new Paragraph("0")],
                }),
                new TableCell({
                    width: {
                        size: "20%",
                    },
                    children: [new Paragraph("0")],
                    borders: {
                        right: {
                            style: BorderStyle.THICK,
                            color: "000000",
                            size: 15,
                        }
                    },
                }),
            ]
        }),
        new TableRow({
            height: {
                value: "0.45cm",
                rule: HeightRule.EXACT
            },
            children: [
                new TableCell({
                    width: {
                        size: "20%",
                    },
                    children: [new Paragraph("Housing Complex")],
                }),
                new TableCell({
                    width: {
                        size: "20%",
                    },
                    children: [new Paragraph("0")],
                }),
                new TableCell({
                    width: {
                        size: "20%",
                    },
                    children: [new Paragraph("0")],
                }),
                new TableCell({
                    width: {
                        size: "20%",
                    },
                    children: [new Paragraph("0")],
                }),
                new TableCell({
                    width: {
                        size: "20%",
                    },
                    children: [new Paragraph("0")],
                    borders: {
                        right: {
                            style: BorderStyle.THICK,
                            color: "000000",
                            size: 15,
                        }
                    },
                }),
            ]
        }),
        new TableRow({
            height: {
                value: "0.45cm",
                rule: HeightRule.EXACT
            },
            children: [
                new TableCell({
                    width: {
                        size: "20%",
                    },
                    children: [new Paragraph("Government")],
                    borders: {
                        bottom: {
                            style: BorderStyle.THICK,
                            color: "000000",
                            size: 15,
                        }
                    },
                }),
                new TableCell({
                    width: {
                        size: "20%",
                    },
                    children: [new Paragraph("3")],
                    borders: {
                        bottom: {
                            style: BorderStyle.THICK,
                            color: "000000",
                            size: 15,
                        }
                    },
                }),
                new TableCell({
                    width: {
                        size: "20%",
                    },
                    children: [new Paragraph("1")],
                    borders: {
                        bottom: {
                            style: BorderStyle.THICK,
                            color: "000000",
                            size: 15,
                        }
                    },
                }),
                new TableCell({
                    width: {
                        size: "20%",
                    },
                    children: [new Paragraph("7")],
                    borders: {
                        bottom: {
                            style: BorderStyle.THICK,
                            color: "000000",
                            size: 15,
                        }
                    },
                }),
                new TableCell({
                    width: {
                        size: "20%",
                    },
                    children: [new Paragraph("11")],
                    borders: {
                        bottom: {
                            style: BorderStyle.THICK,
                            color: "000000",
                            size: 15,
                        },
                        right: {
                            style: BorderStyle.THICK,
                            color: "000000",
                            size: 15,
                        }
                    },
                }),
            ]
        }),
    ],
});

const textBoxBelowTable2 = new Paragraph({
    frame: {
        position: {
            x: 50,
            y: 9500,
        },
        width: 7850,
        height: 1000,
        anchor: {
            horizontal: FrameAnchorType.MARGIN,
            vertical: FrameAnchorType.MARGIN,
        },
    },
    border: {
        top: { style: BorderStyle.SINGLE, size: 7, },
        bottom: { style: BorderStyle.SINGLE, size: 7, },
        left: { style: BorderStyle.SINGLE, size: 7, },
        right: { style: BorderStyle.SINGLE, size: 7, },
    },
    children: [
        new TextRun("**(Building Occupied: Sanctioned Plot, Which Have Received Completion Certificate, "+
        "Plot Availing Construction Power, Plot Availing Permanent Water Connection, Per Plot Revenue Tax, "+
        "Trade License Data Not Integrated)"),
    ],
});

const mapImagePage2 = new Paragraph({
    children: [
        new ImageRun({
            data: fs.readFileSync("./images/geojsonCover1.jpg"),
            transformation: {
                width: 350,
                height: 250,
            },
            floating: {
                horizontalPosition: {
                    relative: HorizontalPositionRelativeFrom.LEFT_MARGIN,
                    offset: 6650000,
                },
                verticalPosition: {
                    relative: VerticalPositionRelativeFrom.TOP_MARGIN,
                    offset: 2250000,
                }
            },
        }),
    ]
});

const missionNameTextBox = new Paragraph({
    frame: {
        position: {
            x: 9700,
            y: 8000,
        },
        width: 3800,
        height: 500,
        anchor: {
            horizontal: FrameAnchorType.MARGIN,
            vertical: FrameAnchorType.MARGIN,
        },
        alignment: {
            x: HorizontalPositionAlign.CENTER,
            y: VerticalPositionAlign.TOP,
        }
    },
    shading: {
        type: ShadingType.SOLID,
        color: "69C7E9"
    },
    alignment: AlignmentType.CENTER,
    children: [
        new TextRun({
            text: "ACTION AREA - 01",
            size: "11pt",
            bold: true,
        }),
        new TextRun({
            text: "AC Block",
            size: "11pt",
            bold: true,
            break: 1,
        })
    ]
});

const headingTextBox = new Paragraph({
    frame: {
        position: {
            x: 9600,
            y: 400,
        },
        width: 4200,
        height: 1600,
        anchor: {
            horizontal: FrameAnchorType.MARGIN,
            vertical: FrameAnchorType.MARGIN,
        },
        alignment: {
            x: HorizontalPositionAlign.CENTER,
            y: VerticalPositionAlign.TOP,
        }
    },
    border: {
        top: { style: BorderStyle.SINGLE, size: 20, color: "FFFFFF" },
        bottom: { style: BorderStyle.SINGLE, size: 20, color: "FFFFFF" },
        left: { style: BorderStyle.SINGLE, size: 20, color: "FFFFFF" },
        right: { style: BorderStyle.SINGLE, size: 20, color: "FFFFFF" },
    },
    alignment: AlignmentType.CENTER,
    children: [
        new TextRun({
            text: "Summary",
            size: "30pt",
            bold: true,
            font: "Arial",
            color: "4A442A"
        }),
        new TextRun({
            text: "Report",
            size: "30pt",
            bold: true,
            font: "Arial",
            color: "4A442A",
            break: 1,
        })
    ]
});

const idTextBox = new Paragraph({
    frame: {
        position: {
            x: 12100,
            y: 0,
        },
        width: 2000,
        height: 1500,
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

const designBorderTextBox = new Paragraph({
    frame: {
        position: {
            x: 11750,
            y: 1300,
        },
        width: 2100,
        height: 800,
        anchor: {
            horizontal: FrameAnchorType.MARGIN,
            vertical: FrameAnchorType.MARGIN,
        },
    },
    border: {
        bottom: { style: BorderStyle.SINGLE, size: 40, color: "69C7E9" },
        right: { style: BorderStyle.SINGLE, size: 40, color: "69C7E9" },
    },
    children: []
});

export const page2 = {
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
        table1,
        table2,
        textBoxBelowTable2,
        mapImagePage2,
        missionNameTextBox,
        headingTextBox,
        idTextBox,
        designBorderTextBox,
    ]
}