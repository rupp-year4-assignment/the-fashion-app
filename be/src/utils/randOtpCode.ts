export const generateOtp = (length: number = 6): Promise<string> => {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;

  return Promise.resolve(
    Math.floor(min + Math.random() * (max - min + 1)).toString()
  );
};
