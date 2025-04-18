import { createContext, useContext, useState } from "react";
import "./index.less";

export const LoaderContext = createContext({
  loading: 0,
  setLoading: (l: boolean) => {},
});

export const useLoader = (init: number) => {
  const [loaderCounter, setLoaderCounter] = useState(init);
  const setLoading = (l: boolean) => {
    if (l) setLoaderCounter((prev) => prev + 1);
    else setLoaderCounter((prev) => Math.max(0, prev - 1));
  };
  return { loading: loaderCounter, setLoading };
};

function Loader() {
  const { loading } = useContext(LoaderContext);
  return (
    <div
      className={loading > 0 ? "loader-wrapper vsbl" : "loader-wrapper nt-vsbl"}
    >
      <div id="loader_bar">
        <b></b>
        <i></i>
      </div>
    </div>
  );
}

export default Loader;
