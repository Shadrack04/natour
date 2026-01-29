exports.restrict = (...roles) => {
  return (req, res, next) => {
    try {
      const authorizedRoles = roles;
      const isAuthorized = authorizedRoles.includes(req.user.role);

      if (!isAuthorized) {
        const error = new Error('Not permitted');
        error.statusCode = 403;
        throw error;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
