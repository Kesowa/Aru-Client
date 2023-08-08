import { MentionsInput, Mention } from "react-mentions";
import { mentions, mentionsInput } from "./styles";

const Mentions = (props) => {
  return (
    <>
      <MentionsInput
        value={props.value}
        onChange={props.handleChange}
        a11ySuggestionsListLabel={"Suggested mentions"}
        style={mentionsInput}
      >
        <Mention
          style={mentions}
          data={props.tags}
          displayTransform={(id, display) => `@${display}`}
        />
      </MentionsInput>
    </>
  );
};

export default Mentions;
