module.exports = {
  ROLES: {
    USER: 'user',
    ADMIN: 'admin',
  },
  TOKEN_TYPES: {
    ACCESS: 'access',
    REFRESH: 'refresh',
  },
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
  },
};
