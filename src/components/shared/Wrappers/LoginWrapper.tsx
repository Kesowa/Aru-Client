import { ReactNode, useContext } from "react";
import { Route, Redirect } from "react-router-dom";
import { AuthContext } from "src/services/authUtils";

interface IProps {
  children?: ReactNode;
  exact?: boolean;
  path?: string;
}

function LoginWrapper({ children, ...rest }: Readonly<IProps>) {
  const { Auth } = useContext(AuthContext);
  return (
    <Route
      {...rest}
      render={({ location }) =>
        !Auth.isLoggedIn ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: "/dashboard",
              state: { from: location },
            }}
          />
        )
      }
    />
  );
}

export default LoginWrapper;
