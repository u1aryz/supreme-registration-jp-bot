// eslint-disable-next-line import/prefer-default-export
export const sleep = (ms: number): Promise<number> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
