import { ReactNode } from "react";
import { Route, Redirect } from "react-router-dom";
import { connect } from "react-redux";
import LoginErrorModal from "../../Login/LoginErrorModal";

interface IProps {
  children?: ReactNode;
  Auth?: any;
  exact?: boolean;
  path?: string;
}

function PrivateRoute({ children, Auth, ...rest }: IProps) {
  console.log("Auth34", Auth);
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

const mapStateToProps = (state: any) => ({
  Auth: state.Auth,
});

export default connect(mapStateToProps, {})(PrivateRoute);
