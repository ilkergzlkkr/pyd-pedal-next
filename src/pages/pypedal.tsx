import type React from "react";
import type { NextPage } from "next";
import { Fragment, useState, useEffect } from "react";
import { Transition, Listbox, Disclosure } from "@headlessui/react";
import { CheckIcon, ChevronUpIcon } from "@heroicons/react/solid";
import { ChevronDoubleRightIcon } from "@heroicons/react/outline";
import { Layout } from "../components";
import {
  boards,
  Board,
  getBoardDescription,
  getBoardName,
  StatusResponse,
} from "../utils/pypedal";
import { trpc } from "../utils/trpc";
import { useToastStore } from "../components/toast";

const PedalContent: NextPage = () => {
  const information =
    "Remember, this is a closed-beta feature. There could be any bug or issue. Please report it to the developer.";

  const { newToast } = useToastStore();
  // show user the beta information once
  useEffect(() => {
    newToast({ title: "Closed-Beta", body: information });
  }, [newToast]);

  // user input
  const [input, setInput] = useState({ query: "", sent: false });
  const [board, setBoard] = useState<Board>(boards[0]);

  // response
  const [response, setResponse] = useState<StatusResponse>();

  trpc.proxy.pypedal.status.useSubscription(
    {
      url: input.query,
      board_name: board,
    },
    {
      enabled: input.sent,
      onData(response) {
        console.log("SERVER RESPONSE", response, "input", input);
        setResponse(response);
      },
      onError({ message, data }) {
        console.log(message);
        setInput({ query: "", sent: false });

        if (data) {
          newToast({ title: "Error", body: message, type: "error" });
        }

        // special case for invalid board
        if (data?.code === "BAD_REQUEST") {
          if (data.zodError?.fieldErrors["url"]) {
            newToast({
              title: "Invalid URL",
              body: "Please enter a valid URL.",
              type: "error",
            });
          }
        }
      },
    }
  );

  return (
    <Layout>
      <div className="">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h1 className="tracking-tight font-extrabold text-white mt-5 text-5xl">
            <span className="block">
              {response?.state === "DONE"
                ? "Serving"
                : input.sent
                ? "Baking"
                : "Create"}{" "}
              your Equalizer
            </span>
            <span className="block text-indigo-400">have fun listening</span>
          </h1>
          <div className="py-7"></div>
          <>
            {input.sent || (
              <div className="font-extrabold">
                <div className="mx-auto max-w-7xl ">
                  <input
                    className="container mb-8 py-1 p-5 border border-indigo-800 rounded-sm"
                    placeholder="Youtube Link"
                    onChange={(e) =>
                      setInput({ ...input, query: e.target.value })
                    }
                  ></input>
                  <div className="">
                    <SelectBoard selected={board} setSelected={setBoard} />
                  </div>
                  <button
                    className={`m-2 mt-4 px-5 py-3 text-6xl text-indigo-300 transition-colors duration-150 rounded-lg focus:shadow-outline ${
                      input.query === ""
                        ? "hover:bg-slate-900"
                        : "hover:bg-indigo-900 hover:text-white"
                    } `}
                    type="submit"
                    onClick={() => setInput({ ...input, sent: true })}
                    disabled={input.query === ""}
                  >
                    Start Processing
                  </button>
                </div>
              </div>
            )}

            {input.sent && (
              <div className="flex container text-white bg-black rounded-full p-6 mb-16 text-base">
                <span
                  className={`place-self-center p-6 text-white text-xs font-semibold leading-5 uppercase tracking-wide ${
                    !response && "bg-indigo-500"
                  } rounded-full`}
                >
                  Waiting for server response
                </span>
                <span
                  className={`place-self-center p-6 ml-1 text-sm ${
                    response?.state === "STARTED" && "bg-blue-600"
                  } rounded-full tracking-wide`}
                >
                  Started
                </span>
                <span
                  className={`place-self-center p-6 ml-1 text-sm group ${
                    response?.state === "IN_PROGRESS" && "bg-yellow-600"
                  } rounded-full tracking-wide`}
                >
                  In progress
                  <div
                    className={`${
                      response?.state === "IN_PROGRESS" ? "block" : "hidden"
                    } rounded-full tracking-wide`}
                  >
                    <p className="inline-flex tracking-wide">
                      {response?.status?.stage}
                    </p>
                    <p className="inline-flex tracking-wide">
                      {response?.status?.percentage}
                    </p>
                    {/* <BeakerIcon className="mx-6 text-slate-400" /> */}
                  </div>
                </span>
                <span
                  className={`place-self-center p-6 ml-1 text-sm ${
                    response?.state === "DONE" && "bg-green-600"
                  } rounded-full tracking-wide`}
                >
                  Done
                </span>
                <ChevronDoubleRightIcon
                  className="place-self-center ml-2 w-5 h-5 text-gray-500"
                  aria-hidden="true"
                />
              </div>
            )}
          </>
          <div
            className={`container mt-11 mb-11 text-6xl tracking-tight font-extrabold text-white ${
              response?.result ? "" : "hidden"
            }`}
          >
            <a
              rel="noopener noreferrer"
              href={response?.result || ""}
              target="_blank"
              className="flex justify-center p-2 text-indigo-300 transition-colors duration-150 rounded-lg focus:shadow-outline hover:bg-indigo-900 hover:text-white"
            >
              Preview or Download
            </a>
            {/* copy url button */}
          </div>
          <div className="text-gray-300 mt-5 mb-5 text-xl">
            <p className="flex mb-5">
              {getBoardName(board)}: {getBoardDescription(board)}
            </p>
            <p>{information}</p>
          </div>
        </div>
        <div className="h-64" />
        <FAQs />
        <div className="h-60" />
      </div>
    </Layout>
  );
};

export const SelectBoard: React.FC<{
  selected: Board;
  setSelected: React.Dispatch<React.SetStateAction<Board>>;
}> = ({ selected, setSelected }) => {
  return (
    <Listbox value={selected} onChange={setSelected}>
      <div className="flex container justify-center">
        <Listbox.Button className="inline-flex px-32 rounded-lg bg-white py-2 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
          <span className="block truncate">{getBoardName(selected)}</span>
          <span className="pointer-events-none">
            <ChevronDoubleRightIcon className="h-5 w-5 text-gray-400" />
          </span>
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute mt-1 max-h-60 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {boards.map((board, idx) => (
              <Listbox.Option
                key={idx}
                className={({ active }) =>
                  `relative cursor-default select-none py-2 pl-10 pr-4 ${
                    active ? "bg-amber-100 text-amber-900" : "text-gray-900"
                  }`
                }
                value={board}
              >
                {({ selected }) => (
                  <>
                    <span
                      className={`block truncate ${
                        selected ? "font-medium" : "font-normal"
                      }`}
                    >
                      {getBoardName(board)}
                    </span>
                    {selected ? (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600">
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    ) : null}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
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
