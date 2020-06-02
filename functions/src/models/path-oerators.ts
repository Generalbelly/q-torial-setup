export const PATH_ALL: string = 'ALL';
export const PATH_EQUALS: string = 'EQUALS';
export const PATH_STARTS_WITH: string = 'STARTS_WITH';
export const PATH_REGEX: string = 'REGEX';

export default [
  {
    value: PATH_ALL,
    text: 'All the url paths',
    pathPriority: 0,
  },
  {
    value: PATH_EQUALS,
    text: 'url paths that are equal to',
    pathPriority: 1,
  },
  {
    value: PATH_STARTS_WITH,
    text: 'url paths that start with',
    pathPriority: 3,
  },
  {
    value: PATH_REGEX,
    text: 'url paths that match the following regular expression: ',
    pathPriority: 2,
  },
];

export const validateUrlPath = (pathOperator: string, pathValue: string, urlPath: string) => {
  const evaluators = {
    [PATH_EQUALS]: (pv: string, up: string) => pv === up,
    [PATH_STARTS_WITH]: (pv: string, up: string) => up.startsWith(pv),
    [PATH_REGEX]: (pv: string, up: string) => new RegExp(pv).test(up),
    [PATH_ALL]: (pv: string, up: string) => true,
  };
  return evaluators[pathOperator](pathValue, urlPath);
};
