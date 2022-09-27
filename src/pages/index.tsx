import type { NextPage } from "next";
import Image from "next/image";
import worker from "../../public/workers.jpg";

import { Content } from "../components";
import { createRef, Suspense } from "react";
import dynamic from "next/dynamic";
import { usePlayerStore } from "../components/player";

const DynamicPlayer = dynamic(
  () => import("../components/player").then((module) => module.MusicPlayer),
  {
    loading: () => <div>Loading...</div>,
    ssr: false,
  }
);

const Home: NextPage = () => {
  const store = usePlayerStore();
  const audioInputRef = createRef<HTMLInputElement>();
  const onFileChange = (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    console.log("onFileChange", audioInputRef.current?.files);
    const file = audioInputRef.current?.files?.item(0);
    if (!file) return;

    const src = URL.createObjectURL(file);
    store.setSrc(src);
  };
  return (
    <>
      <Content />
      <div className="bg-gray-900">
        <div className="flex justify-center pt-8">
          <Image alt="workers" src={worker}></Image>
        </div>
        <div className="flex justify-center text-white text-xl m-12 p-12 bg-purple-900">
          <form className="grid mr-5" onSubmit={onFileChange}>
            <label
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
              htmlFor="file_input"
            >
              Upload file
            </label>
            <input
              className="block w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 cursor-pointer dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
              type="file"
              accept="audio/*"
              ref={audioInputRef}
            />
            <p
              className="mt-1 text-sm text-gray-500 dark:text-gray-300"
              id="file_input_help"
            >
              Any sound file (MAX. 300MB).
            </p>
            <button
              onClick={(e) => {
                e.preventDefault();
                onFileChange();
              }}
            >
              Load
            </button>
          </form>
          <DynamicPlayer />
        </div>
        <div className="h-96"></div>
      </div>
    </>
  );
};

export default Home;
