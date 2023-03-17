import React, { ReactNode } from "react";
import { Route, Redirect } from "react-router-dom";
import { connect } from "react-redux";

interface IProps {
  children?: ReactNode;
  Auth?: any;
  exact?: boolean;
  path?: string;
}

function LoginWrapper({ children, Auth, ...rest }: IProps) {
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

const mapStateToProps = (state: any) => ({
  Auth: state.Auth,
});

export default connect(mapStateToProps, {})(LoginWrapper);
