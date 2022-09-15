import type React from "react";
import { Fragment, useState } from "react";
import { Dialog, Transition, Listbox, Disclosure } from "@headlessui/react";
import { CheckIcon, ChevronUpIcon } from "@heroicons/react/solid";
import { NewspaperIcon, XIcon } from "@heroicons/react/outline";
import { ChevronDoubleRightIcon } from "@heroicons/react/outline";
import { Header, Layout } from "../components";
import {
  boards,
  Board,
  getBoardDescription,
  getBoardName,
  StatusResponse,
} from "../utils/pypedal";
import { trpc } from "../utils/trpc";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Equalizer", href: "/" },
];

export default function Page() {
  return (
    <>
      <Announcement />
      <div className="relative overflow-hidden">
        <Header navigation={navigation} />

        <PedalContent />
      </div>
    </>
  );
}

export const PedalContent = () => {
  const [input, setInput] = useState<{
    query: string;
    sent: boolean;
  }>({ query: "", sent: false });

  const [board, setBoard] = useState<Board>(boards[0]);
  const [response, setResponse] = useState<StatusResponse>();

  trpc.useSubscription(
    [
      "pypedal.status",
      {
        url: input.query,
        board_name: board,
      },
    ],
    {
      enabled: input.sent,
      onNext(response) {
        console.log("SERVER RESPONSE", response, "input", input);
        setResponse(response);
      },
      onError({ message, data }) {
        if (data?.code === "BAD_REQUEST") {
          if (message.includes("regex")) {
            console.log("BAD URL");
            setInput({ query: "", sent: false });
          }
        } else if (data?.code === "PRECONDITION_FAILED") {
          console.log("NOT CONNECTED TO SERVER");
          setInput({ query: "", sent: false });
        }
      },
    }
  );

  const information =
    "Remember, this is a closed-beta feature. There could be any bug or issue. Please report it to the developer.";
  return (
    <Layout>
      <BetaReminder title="Closed-Beta" body={information} />
      <div className="mx-auto max-w-7xl">
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
                    <MyListbox selected={board} setSelected={setBoard} />
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

export const MyListbox: React.FC<{
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

export const Announcement = () => {
  const [isOpen, setIsOpen] = useState(true);
  if (!isOpen) return null;
  return (
    <div className="bg-indigo-600">
      <div className="mx-auto max-w-7xl py-3 px-3 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between">
          <div className="flex w-0 flex-1 items-center">
            <span className="flex rounded-lg bg-indigo-800 p-2">
              <NewspaperIcon
                className="h-6 w-6 text-white"
                aria-hidden="true"
              />
            </span>
            <p className="ml-3 truncate font-medium text-white">
              <span className="md:hidden">We announced a new product!</span>
              <span className="hidden md:inline">
                Big news! We{"'"}re excited to announce a brand new product.
              </span>
            </p>
          </div>
          <div className="order-3 mt-2 w-full flex-shrink-0 sm:order-2 sm:mt-0 sm:w-auto">
            <a
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center rounded-md border border-transparent bg-white px-4 py-2 text-sm font-medium text-indigo-600 shadow-sm hover:bg-indigo-50"
            >
              Learn more
            </a>
          </div>
          <div className="order-2 flex-shrink-0 sm:order-3 sm:ml-3">
            <button
              type="button"
              className="-mr-1 flex rounded-md p-2 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-white sm:-mr-2"
              onClick={() => setIsOpen(false)}
            >
              <span className="sr-only">Dismiss</span>
              <XIcon className="h-6 w-6 text-white" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const BetaReminder: React.FC<{
  open?: boolean;
  title: string;
  body: string;
  ok?: string;
}> = ({ open = true, title, body, ok = "Got it, thanks!" }) => {
  const [isOpen, setIsOpen] = useState(open);

  return (
    <>
      {/* <div className="fixed inset-0 flex items-center justify-center">
        <button
          type="button"
          onClick={openModal}
          className="rounded-md bg-black bg-opacity-20 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
        >
          Open dialog
        </button>
      </div> */}

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setIsOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    {title}
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">{body}</p>
                  </div>

                  <div className="mt-4">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={() => setIsOpen(false)}
                    >
                      {ok}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
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
