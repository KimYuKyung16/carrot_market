import client from "@libs/server/client";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import { NextApiRequest, NextApiResponse } from "next";
import { withApiSession } from "@libs/server/withSession";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const {
    query: { id },
  } = req;
  if (req.method === "POST") {
    const {
      body: { chatId, message, notification },
      session: { user },
    } = req;

    const chat = await client.chatMessage.create({
      data: {
        message,
        Chat: {
          connect: {
            id: +chatId,
          },
        },
        User: {
          connect: {
            id: user?.id,
          },
        },
        notification,
      },
    });
    res.json({
      ok: true,
      chat,
    });
  }
  if (req.method === "GET") {
    const productName = await client.chat.findUnique({
      include: {
        product: {
          select: {
            name: true,
            id: true,
            state: true,
          },
        },
      },
      where: {
        id: +(id as string | string[]).toString(),
      },
    });
    const chatMessages = await client.chatMessage.findMany({
      include: {
        User: {
          select: {
            avatar: true,
            name: true,
          },
        },
      },
      where: {
        chatId: +(id as string | string[]).toString(),
      },
    });
    res.json({
      ok: true,
      chatMessages,
      productName,
    });
  }
  if (req.method === "DELETE") {
    const {
      body: { id: chatMessageId },
      session: { user },
    } = req;
    const message = await client.chatMessage.delete({
      where: {
        id: +(chatMessageId as string | string[]).toString(),
      }
    })
    res.json({
      ok: true,
    });
  }
}
export default withApiSession(
  withHandler({
    methods: ["GET", "POST", "DELETE"],
    handler,
  })
);
