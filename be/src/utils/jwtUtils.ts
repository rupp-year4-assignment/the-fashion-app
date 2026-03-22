import jwt from "jsonwebtoken";

export const generateAccessToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_ACCESS_SECRET || "access_secret", {
    expiresIn: "15m",
  });
};

export const generateRefreshToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || "refresh_secret", {
    expiresIn: "7d",
  });
};

export const verifyAccessToken = (token: string): any => {
  try {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET || "access_secret");
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return { expired: true };
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return { invalid: true };
    }

    return null;
  }
};

export const verifyRefreshToken = (token: string): any => {
  try {
    return jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET || "refresh_secret"
    );
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return { expired: true };
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return { invalid: true };
    }

    return null;
  }
};

export const verifyToken = (token: string): any => {
  return verifyAccessToken(token);
};
