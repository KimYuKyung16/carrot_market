import type { NextPage } from "next";
import Layout from "@components/layout";
import Message from "@components/message";
import { io } from "socket.io-client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import useMutation from "@libs/client/useMutation";
import { Chat, ChatMessage, User } from "@prisma/client";
import useUser from "@libs/client/useUser";
import useSWR from "swr";
import { getDateTime } from "@libs/client/getDateTime";

interface MessageResponse {
  ok: boolean;
  post: ChatMessage;
}

interface MessageListWithUser extends ChatMessage {
  User: User;
  Chat: { product: { name: string } };
}

interface ChatWithProduct extends Chat {
  product: { name: string };
}

interface MessageListResponse {
  ok: boolean;
  chatMessages: MessageListWithUser[];
  productName: ChatWithProduct;
}

const socket = io("http://localhost:5000");
const ChatDetail: NextPage = () => {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const sendRef = useRef<HTMLInputElement>(null);
  const { user, isLoading } = useUser();
  const [saveMessage, { loading }] = useMutation<MessageResponse>(
    `/api/chats/${router.query.id}/message`,
    "POST"
  );
  const { data: messageList } = useSWR<MessageListResponse>( // 기존에 있던 메시지 리스트
    router.query.id ? `/api/chats/${router.query.id}/message` : null
  );

  const [existMessage, setExistMessage] = useState<any[]>([]);
  const [sendMessage, setSendMessage] = useState("");
  const onChangeTest = (e: any) => {
    setSendMessage(e.target.value);
  };
  useEffect(() => {
    if (!messageList?.chatMessages || messageList?.chatMessages.length === 0)
      return;
    setExistMessage([...messageList?.chatMessages]);
  }, [messageList]);

  const onClickSendBtn = () => {
    if ((!router.query.id && !user) || loading) {
      alert("메시지 전송에 실패했습니다.");
      return;
    }
    if (!sendRef.current) return; 
    sendRef.current.value = "";
    socket.emit("message", {
      roomNum: router.query.id,
      message: {
        avatar: user?.avatar,
        name: user?.name,
        userId: user?.id,
        createdAt: new Date(),
        message: sendMessage,
      },
    });
    saveMessage({ chatId: router.query.id, message: sendMessage });
  };

  useEffect(() => {
    socket.on("send Message", (msg: any) => {
      setExistMessage((prev) => [
        ...prev,
        {
          User: { avatar: msg.avatar, name: msg.name },
          createdAt: msg.createdAt,
          message: msg.message,
          userId: msg.userId,
        },
      ]);
    });

    return () => {
      socket.off("send Message");
      socket.emit("leaveRoom", String(router.query.id));
    };
  }, [user]);

  useEffect(() => {
    // socket room 떠나기
    socket.emit("setRoomNum", router.query.id);
  }, [router]);

  useEffect(() => {
    // 스크롤 제일 아래로
    if (!scrollRef.current) return;
    const { scrollHeight } = scrollRef.current;
    window.scrollTo(0, scrollHeight); // 바로 이동
    // window.scrollTo({top: scrollHeight, behavior: 'smooth'}) // 부드럽게 이동
  }, [existMessage]);

  return (
    <Layout canGoBack title={messageList?.productName.product.name}>
      <div ref={scrollRef} className="py-10 pb-16 px-4 space-y-4">
        {existMessage
          ? existMessage.map((message, i) => {
              let { year, month, day, hour, minute } = getDateTime(
                message.createdAt
              );

              return user?.id === message.userId ? (
                <Message
                  key={i}
                  date={hour + ":" + minute}
                  name={message.User.name}
                  message={message.message}
                  avatarUrl={message.User.avatar}
                  reversed
                />
              ) : (
                <Message
                  key={i}
                  date={hour + ":" + minute}
                  name={message.User.name}
                  message={message.message}
                  avatarUrl={message.User.avatar}
                />
              );
            })
          : null}

        <form className="fixed py-2 bottom-0 inset-x-0">
          <div className="flex relative max-w-lg items-center h-9 w-full mx-auto border border-gray-300 rounded-md">
            <input
              ref={sendRef}
              onChange={onChangeTest}
              type="text"
              className="h-full px-2 shadow-sm rounded-full w-full border-gray-300 focus:ring-orange-500 focus:outline-none pr-12 focus:border-orange-500"
            />
            <div className="absolute inset-y-0 flex py-1.5 pr-1.5 right-0">
              <input
                type="button"
                value="→"
                onClick={onClickSendBtn}
                className="flex focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 items-center bg-orange-500 rounded-full px-3 hover:bg-orange-600 text-sm text-white"
              >
                {/* &rarr; */}
              </input>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default ChatDetail;