import CryptoJS from 'crypto-js';

export const hashPassword = (password: string): string => {
  return CryptoJS.SHA256(password).toString();
};

export const verifyPassword = (password: string, hash: string): boolean => {
  return hashPassword(password) === hash;
};
