import { ReactNode, useContext } from "react";
import { Route, Redirect } from "react-router-dom";
import LoginErrorModal from "../../Login/LoginErrorModal";
import { AuthContext } from "src/services/authUtils";

interface IProps {
  children?: ReactNode;
  exact?: boolean;
  path?: string;
}

function PrivateRoute({ children, ...rest }: Readonly<IProps>) {
  const { Auth } = useContext(AuthContext);
  return (
    <Route
      {...rest}
      render={({ location }) => {
        if (Auth.isLoggedIn) return children;
        if (Auth.isError) return <LoginErrorModal />;
        return <Redirect
          to={{
            pathname: "/login",
            state: { from: location },
          }}
        />
      }
      }
    />
  );
}

export default PrivateRoute;
