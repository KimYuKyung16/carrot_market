import { Product } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import swal from "sweetalert";
import useSWR from "swr";

interface ItemProps {
  image: string;
  title: string;
  id?: number;
  state: boolean;
  price: number;
  comments?: number;
  hearts?: number;
}

interface ProductResponse {
  ok: boolean;
  product: Product;
}

export default function Item({
  image,
  title,
  state,
  price,
  comments,
  hearts,
  id,
}: ItemProps) {
  const { data } = useSWR<ProductResponse>(`/api/products/${id}`);
  const onClickProduct = () => {
    if (!data) return;
    if (!data.product) {
      swal("판매자에 의해 삭제된 물품입니다");
    }
  };
  return (
    <Link href={`/products/${id}`}>
      <a
        onClick={onClickProduct}
        className="flex px-4 pt-5 w-100 cursor-pointer justify-between"
      >
        <div className="flex space-x-4 w-full">
          {image ? (
            <Image
              priority={true}
              loader={() => {
                return image;
              }}
              src={image}
              className="-z-10 w-20 h-20 bg-gray-400 rounded-md"
              width={80}
              height={80}
              alt="판매 제품"
              placeholder="blur"
              blurDataURL={image}
            />
          ) : (
            <div className="w-20 h-20 bg-gray-400 rounded-md" />
          )}
          <div className="pt-2 flex flex-col">
            <div className="flex space-x-2">
              <h3 className="text-sm font-medium text-gray-900">{title}</h3>
              {state ? (
                <span className="bg-orange-500 rounded-md text-white py-0.5 px-1 text-xs">
                  거래완료
                </span>
              ) : null}
            </div>
            <span className="font-medium mt-1 text-gray-900">₩ {price}</span>
          </div>
        </div>
        {hearts !== undefined || comments !== undefined ? (
          <div className="flex space-x-2 items-end justify-end">
            <div className="flex space-x-0.5 items-center text-sm  text-gray-600">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                ></path>
              </svg>
              <span>{hearts}</span>
            </div>
            <div className="flex space-x-0.5 items-center text-sm  text-gray-600">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                ></path>
              </svg>
              <span>{comments}</span>
            </div>
          </div>
        ) : null}
      </a>
    </Link>
  );
}
