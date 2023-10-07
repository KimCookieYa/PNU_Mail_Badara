export type Response = {
  data: {
    type: string;
    message: string;
    data?: {
      exist?: true;
      count?: number;
      commits?: Commit[];
    };
  };
};

export type DepartmentList = {
  [key: string]: string;
};

export interface Commit {
  sha: string;
  commit: {
    author: {
      name: string;
      date: string;
    };
    message: string;
  };
}
