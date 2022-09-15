import type { NextPage } from "next";
import Image from "next/image";
import worker from "../../public/workers.jpg";

import { Content } from "../components";

const Home: NextPage = () => {
  return (
    <>
      <Content />
      <div className="bg-gray-900">
        <div className="flex justify-center pt-8">
          <Image alt="workers" src={worker}></Image>
        </div>
        <div className="h-96"></div>
      </div>
    </>
  );
};

export default Home;
