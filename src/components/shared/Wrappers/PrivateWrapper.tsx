import { ReactNode, useContext } from "react";
import { Route, Redirect } from "react-router-dom";
import LoginErrorModal from "../../Login/LoginErrorModal";
import { AuthContext } from "src/services/authUtils";

interface IProps {
  children?: ReactNode;
  exact?: boolean;
  path?: string;
}

function PrivateRoute({ children, ...rest }: IProps) {
  const { Auth } = useContext(AuthContext);
  return (
    <Route
      {...rest}
      render={({ location }) =>
        Auth.isLoggedIn ? (
          children
        ) : Auth.isError ? (
          <LoginErrorModal />
        ) : (
          <Redirect
            to={{
              pathname: "/login",
              state: { from: location },
            }}
          />
        )
      }
    />
  );
}

export default PrivateRoute;
