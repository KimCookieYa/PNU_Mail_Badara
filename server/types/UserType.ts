export interface UserType {
  email: string;
  latest_post_indexes: number[];
  department_code: string;
  subscribe_time: Date;
}

export interface UsersType {
  users: UserType[];
}
