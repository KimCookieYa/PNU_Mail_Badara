export interface UserType {
  email: string;
  latest_post_indexs: number[];
  department_code: string;
  subscribe_time: Date;
}

export interface UsersType {
  users: UserType[];
}
