import type { NextPage } from "next";
import Link from "next/link";
import FloatingButton from "@components/floating-button";
import Layout from "@components/layout";
import { Stream } from "@prisma/client";
import useSWR from "swr";
import Image from "next/image";
import { useEffect } from "react";
import useUser from "@libs/client/useUser";

interface StreamsResponse {
  ok: boolean;
  streams: Stream[];
}

const Streams: NextPage = () => {
  const { user } = useUser();
  const { data } = useSWR<StreamsResponse>(`/api/streams`); // 주소가 SWR의 key 역할을 한다.
  useEffect(() => {
    localStorage.removeItem("productSearch");
  }, []);
  return (
    <Layout hasTabBar title="라이브">
      <div className=" divide-y-[1px] space-y-4">
        {user &&
          data?.streams.map((stream) => (
            <Link key={stream.id} href={`/streams/${stream.id}`}>
              <a className="pt-4 block  px-4">
                <div className="h-0 w-full aspect-w-16 aspect-h-9 bg-black overflow-hidden">
                  <iframe
                    src={`https://customer-qkzviq88w8n4p4hm.cloudflarestream.com/${stream.cloudflareId}/thumbnails/thumbnail.jpg?height=305`}
                    className="w-full h-full rounded-md shadow-sm border-none "
                    allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                    allowFullScreen={true}
                  ></iframe>
                </div>
                <h1 className="text-2xl mt-2 font-bold text-gray-900">
                  {stream.name}
                </h1>
              </a>
            </Link>
          ))}
        <FloatingButton href="/streams/create">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            ></path>
          </svg>
        </FloatingButton>
      </div>
    </Layout>
  );
};

export default Streams;
