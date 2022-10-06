import { Fragment } from "react";
import { Popover, Transition } from "@headlessui/react";
import { MenuIcon, XIcon } from "@heroicons/react/outline";
import { ChevronRightIcon } from "@heroicons/react/solid";
import { useSession, signIn, signOut } from "next-auth/react";

import Link from "next/link";
import Head from "next/head";
import create from "zustand";

import { Announcement } from "./modals";
import { Toast } from "./toast";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Equalizer", href: "/pypedal" },
] as const;

export type ThemeModes = "retro" | "dracula" | "synthwave";

interface Theme {
  mode: ThemeModes;
  setMode(mode: ThemeModes): void;
}

export const useTheme = create<Theme>((set) => ({
  mode: "synthwave",
  setMode: (mode) => set({ mode }),
}));

export const Header: React.FC<{
  navigation: typeof navigation;
}> = ({ navigation }) => {
  const { data: session } = useSession();
  return (
    <Popover as="header" className="relative">
      <div className="bg-gray-900 pt-6 p-4">
        <nav
          className="relative max-w-7xl mx-auto flex items-center justify-between px-6"
          aria-label="Global"
        >
          <div className="flex items-center flex-1">
            <div className="flex items-center justify-between w-full">
              <Link href="/">
                <a>
                  <h1 className="w-auto h-10 tracking-tight font-extrabold text-white mt-5 text-6xl flex">
                    <span className="block">Kedy</span>
                    <span className="block text-indigo-400">Bot</span>
                  </h1>
                </a>
              </Link>
              <div className="-mr-2 flex items-center">
                <Popover.Button className="bg-gray-900 rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:bg-gray-800 focus:outline-none focus:ring-2 focus-ring-inset focus:ring-white">
                  <span className="sr-only">Open main menu</span>
                  <MenuIcon className="h-6 w-6" aria-hidden="true" />
                </Popover.Button>
              </div>
            </div>
            <div className="hidden space-x-8">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-base font-medium text-white hover:text-gray-300"
                >
                  {item.name}
                </a>
              ))}
            </div>
          </div>
          <div className="hidden">
            {session ? (
              <a
                href="#"
                className="text-base font-medium text-white hover:text-gray-300"
              >
                Signed in as {session?.user?.id} <br />
                <button onClick={() => signOut()}>Sign out</button>
              </a>
            ) : (
              <a
                href="#"
                className="text-base font-medium text-white hover:text-gray-300"
                onClick={() => signIn("discord")}
              >
                Log in
              </a>
            )}
          </div>
        </nav>
      </div>

      <Transition
        as={Fragment}
        enter="duration-150 ease-out"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="duration-100 ease-in"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
      >
        <Popover.Panel
          focus
          className="absolute z-10 top-0 inset-x-0 p-4 transition transform origin-top"
        >
          <div className="rounded-3xl shadow-md bg-white ring-1 ring-black ring-opacity-5 overflow-hidden">
            <div className="px-5 pt-4 flex items-center justify-between">
              <div>
                <h1 className="h-8 w-auto">KedyBot</h1>
              </div>
              <div className="-mr-2">
                <Popover.Button className="bg-white rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-600">
                  <span className="sr-only">Close menu</span>
                  <XIcon className="h-6 w-6" aria-hidden="true" />
                </Popover.Button>
              </div>
            </div>
            <div className="pt-5 pb-6">
              <div className="px-2 space-y-1">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-50"
                  >
                    {item.name}
                  </a>
                ))}
              </div>
              <div className="mt-6 px-5">
                <a
                  href="#"
                  className="block text-center w-full py-3 px-4 rounded-md shadow bg-indigo-600 text-white font-medium hover:bg-indigo-700"
                >
                  Invite Bot
                </a>
              </div>
              <div className="mt-6 px-5">
                <p className="text-center text-base font-medium text-gray-500">
                  {session ? (
                    <>
                      <a className="text-gray-900 hover:underline">
                        Logged in as {session?.user?.name}
                      </a>
                      {" | "}
                      <button
                        onClick={() => signOut()}
                        className="p-1 rounded-md shadow bg-indigo-600 text-white font-medium hover:bg-indigo-700"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      Existing user?{" "}
                      <a
                        onClick={() => signIn("discord")}
                        className="text-gray-900 hover:underline"
                      >
                        Login
                      </a>
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        </Popover.Panel>
      </Transition>
    </Popover>
  );
};

export const Layout: React.FC<{ children: JSX.Element | JSX.Element[] }> = ({
  children,
}) => {
  const { mode } = useTheme();
  return (
    <div data-theme={mode}>
      <Head>
        <title>KedyBot</title>
        <link
          rel="apple-touch-icon"
          sizes="57x57"
          href="/icons/apple-icon-57x57.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="60x60"
          href="/icons/apple-icon-60x60.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="72x72"
          href="/icons/apple-icon-72x72.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="76x76"
          href="/icons/apple-icon-76x76.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="114x114"
          href="/icons/apple-icon-114x114.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="120x120"
          href="/icons/apple-icon-120x120.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="144x144"
          href="/icons/apple-icon-144x144.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="152x152"
          href="/icons/apple-icon-152x152.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/icons/apple-icon-180x180.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href="/icons/android-icon-192x192.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/icons/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="96x96"
          href="/icons/favicon-96x96.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/icons/favicon-16x16.png"
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta
          name="msapplication-TileImage"
          content="/icons/ms-icon-144x144.png"
        />
        <meta name="theme-color" content="#ffffff" />
      </Head>
      <Announcement />
      <Header navigation={navigation} />
      <Toast />
      <main>
        <div className="bg-gray-900 pt-16">{children}</div>
      </main>
    </div>
  );
};

export const Content = () => {
  return (
    <Layout>
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <div className="">
            <Link href="/pypedal">
              <a className="inline-flex items-center text-white bg-black rounded-full p-1 pr-2 text-base hover:text-gray-200">
                <span className="px-3 py-0.5 text-white text-xs font-semibold leading-5 uppercase tracking-wide bg-indigo-500 rounded-full">
                  We{"'"}re developing
                </span>
                <span className="ml-4 text-sm">Visit our Equalizer page</span>
                <ChevronRightIcon
                  className="ml-2 w-5 h-5 text-gray-500"
                  aria-hidden="true"
                />
              </a>
            </Link>
            <h1 className="tracking-tight font-extrabold text-white mt-5 text-6xl">
              <span className="block">A better way to</span>
              <span className="block text-indigo-400">have fun in discord</span>
            </h1>
            <p className="text-gray-300 mt-5 text-xl">
              As you can clearly see... we are working!
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};
