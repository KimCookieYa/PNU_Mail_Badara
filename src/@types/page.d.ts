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

export type DepartmentObject = {
  [key: string]: string;
};

export type Department = {
  code: string;
  name: string;
  board_names: string[];
  boards: string[];
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
