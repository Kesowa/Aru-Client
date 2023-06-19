const mentions = {
  backgroundColor: "#d3d3d3",
  borderRadius: "3px",
};

const mentionsInput = {
  control: {
    backgroundColor: "#fff",
    fontSize: 16,
  },
  input: {
    outline: "none",
    borderRadius: "5px",
  },
  "&multiLine": {
    control: {
      minHeight: 100,
    },
    highlighter: {
      padding: 9,
      border: "1px solid transparent",
    },
    input: {
      padding: 9,
      border: "1px solid silver",
    },
  },

  "&singleLine": {
    display: "inline-block",
    width: 180,

    highlighter: {
      padding: 1,
      border: "2px inset transparent",
    },
    input: {
      padding: 1,
      border: "2px inset",
    },
  },

  suggestions: {
    list: {
      backgroundColor: "white",
      border: "1px solid rgba(0,0,0,0.15)",
      fontSize: 16,
      borderRadius: "5px",
    },
    item: {
      padding: "5px 15px",
      "&focused": {
        backgroundColor: "#d3d3d3",
        borderRadius: "5px",
      },
    },
  },
};

export { mentions, mentionsInput };
