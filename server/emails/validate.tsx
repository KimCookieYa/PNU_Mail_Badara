import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Tailwind,
} from "@react-email/components";
import * as React from "react";
import { MessagesType } from "../src/types/MessageType";

interface Props {
  title: string;
  messageList: MessagesType;
}

export default function Validate() {
  return (
    <Html lang="ko">
      <Head>
        <title>asdf</title>
      </Head>
      <Tailwind>
        <Body className="mx-auto my-auto bg-white">
          <Container className="w-[648px] max-x-[648px] px-3 m-auto">
            <Heading className="text-center">이메일 인증</Heading>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
