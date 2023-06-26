import type React from "react";
import type { NextPage } from "next";
import { useEffect } from "react";
import { Disclosure } from "@headlessui/react";
import { ChevronUpIcon } from "@heroicons/react/solid";
import { Layout } from "../components";

import { useToastStore } from "../components/toast";
import {
  InputEmbedForPlayer,
  LazyPlayer,
  PlayerNavigator,
  usePlayerStore,
} from "../components/player";

const DebugView = () => {
  const player = usePlayerStore((state) => state.player);

  if (!player) return <InputEmbedForPlayer />;
  return (
    <div>
      <LazyPlayer />
      <div className="flex justify-center">
        <PlayerNavigator />
      </div>
    </div>
  );
};

const PedalContent: NextPage = () => {
  const information =
    "Remember, this is a open-beta feature. There could be any bug or issue. Please report it to the developer.";

  const { newToast } = useToastStore();
  // const { player } = usePlayerStore();
  // show user the beta information once
  useEffect(() => {
    newToast({ title: "Open-Beta", body: information });
  }, [newToast]);

  return (
    <Layout>
      <div>
        <div className="flex justify-center items-center text-white text-xl m-12 p-12">
          <DebugView />
        </div>
      </div>
      <div className="h-64" />
      <FAQs />
      <div className="h-60" />
    </Layout>
  );
};

export const FAQs = () => {
  const friend = (via: string, url: string) => {
    return (
      <a
        className="text-purple-900"
        rel="noopener noreferrer"
        target="_blank"
        href={url}
      >
        {via}
      </a>
    );
  };
  const QnA = [
    {
      question: "What does the Equalizer do?",
      answer:
        "The Equalizer is a feature that allows you to adjust the volume of each individual speaker in your system. This is useful if you have a system with multiple speakers and you want to adjust the volume of each speaker to get the best sound quality.",
    },
    {
      question: "Why is there a Equalizer feature in this website?",
      answer: "Because I can.",
    },
    {
      question: "How this become a thing?",
      answer: (
        <>
          Me and my friends{" "}
          {friend("@hamittoysal", "https://instagram.com/hamittoysal")} and{" "}
          {friend("@iguessinan", "https://instagram.com/iguessinan")} were got
          bored and we decided to make this (Equalizer app) for pushing{" "}
          {"'Slowed-Reverb'"} songs to Youtube yolo.
        </>
      ),
    },
    {
      question: "What is the future of this project?",
      answer:
        "I don't know, I'm just a student who wants to learn more about web development and this is my first project. The main thing is that, the website is built for quickly generate a 'Slowed-Reverb' audio and upload it to Youtube via clicking buttons easily.",
    },
  ];
  return (
    <div className="flex w-full px-4 pt-16">
      <h1 className="tracking-tight font-extrabold text-white mt-5 text-5xl">
        Questions <span className="text-indigo-400">and</span> Answers
      </h1>
      <div className="mx-auto w-full max-w-md rounded-2xl bg-white p-2">
        {QnA.map((qna, idx) => (
          <Disclosure key={idx} as="div" className={`${idx > 0 ? "mt-2" : ""}`}>
            {({ open }) => (
              <>
                <Disclosure.Button className="flex justify-between w-full px-4 py-2 text-sm font-medium text-left text-purple-900 bg-purple-100 rounded-lg hover:bg-gray-200 focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75">
                  <span>{qna.question}</span>
                  <ChevronUpIcon
                    className={`${
                      open ? "transform rotate-180" : ""
                    } w-5 h-5 text-gray-500`}
                  />
                </Disclosure.Button>
                <Disclosure.Panel className="px-4 pt-4 pb-2 text-sm text-gray-500">
                  {qna.answer}
                </Disclosure.Panel>
              </>
            )}
          </Disclosure>
        ))}
      </div>
    </div>
  );
};

export default PedalContent;
