export interface MessageContentType {
  [postIndex: string]: {
    title: string;
    link: string;
    pubDate: string;
    images: string[];
  };
}

export interface MessageType {
  latestPostIndex?: number;
  message?: MessageContentType;
}

export interface MessagesType {
  [board_name: string]: MessageType;
}
