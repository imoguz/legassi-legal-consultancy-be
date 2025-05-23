"use strict";

//  middleware to handle role-based access control

function requireAuth(roles = []) {
  return (req, res, next) => {
    const user = req.user;
    console.log("perm", user);
    if (!user) {
      res.errorStatusCode = 401;
      return next(new Error("Authentication required."));
    }

    if (!user.isActive || !user.isVerified) {
      res.errorStatusCode = 403;
      return next(
        new Error(
          "Your account must be active and verified to access this resource."
        )
      );
    }

    if (roles.length && !roles.includes(user.role)) {
      res.errorStatusCode = 403;
      return next(
        new Error(
          `You must have one of the following roles: ${roles.join(", ")}`
        )
      );
    }

    return next();
  };
}

module.exports = requireAuth;
