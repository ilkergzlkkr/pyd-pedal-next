import type { NextPage } from "next";
import { useState } from "react";
import Image from "next/image";
import catDies from "../../public/dies-cat.gif";
import useEventListener from "../utils/useEventListener";

import { Content, Layout } from "../components";

const Home: NextPage = () => {
  const [isCatDead, setIsCatDead] = useState(false);
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.code === "KeyF") setIsCatDead(true);
  };
  useEventListener("keydown", handleKeyDown);
  return (
    <Layout>
      <Content />
      <div>
        <div className="pt-7 flex justify-center">
          {isCatDead ? (
            <p>respected...</p>
          ) : (
            <>
              Press <kbd className="kbd kbd-sm">F</kbd> to pay respects.
            </>
          )}
        </div>
        <div className="flex justify-center pt-8">
          <Image alt="cat dies" src={catDies} height={390}></Image>
        </div>
        <div className="h-96"></div>
      </div>
    </Layout>
  );
};

export default Home;
