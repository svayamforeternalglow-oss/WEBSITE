import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  const expire = process.env.JWT_EXPIRE || '30d';
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: expire,
  });
};

export default generateToken;
