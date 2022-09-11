import { Fragment } from "react";
import { Popover, Transition } from "@headlessui/react";
import { MenuIcon, XIcon } from "@heroicons/react/outline";
import { ChevronRightIcon } from "@heroicons/react/solid";

type HeaderProps = {
  navigation: { name: string; href: string; isActive?: Boolean }[];
};

export const Header = (props: HeaderProps) => {
  const { navigation } = props;
  return (
    <Popover as="header" className="relative">
      <div className="bg-gray-900 pt-6 p-4">
        <nav
          className="relative max-w-7xl mx-auto flex items-center justify-between px-6"
          aria-label="Global"
        >
          <div className="flex items-center flex-1">
            <div className="flex items-center justify-between w-full">
              <a href="#">
                <h1 className="w-auto h-10 tracking-tight font-extrabold text-white mt-5 text-6xl flex">
                  <span className="block">Kedy</span>
                  <span className="block text-indigo-400">Bot</span>
                </h1>
              </a>
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
            <a
              href="#"
              className="text-base font-medium text-white hover:text-gray-300"
            >
              Log in
            </a>
            <a
              href="#"
              className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700"
            >
              Start free trial
            </a>
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
                  Existing user?{" "}
                  <a href="#" className="text-gray-900 hover:underline">
                    Login
                  </a>
                </p>
              </div>
            </div>
          </div>
        </Popover.Panel>
      </Transition>
    </Popover>
  );
};

type LayoutProps = {
  children: React.ReactNode;
};

export const Layout = (props: LayoutProps) => {
  return (
    <main>
      <div className="bg-gray-900 pt-16">{props.children}</div>
    </main>
  );
};

export const Content = () => {
  return (
    <Layout>
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <div className="">
            <a
              href="#"
              className="inline-flex items-center text-white bg-black rounded-full p-1 pr-2 text-base hover:text-gray-200"
            >
              <span className="px-3 py-0.5 text-white text-xs font-semibold leading-5 uppercase tracking-wide bg-indigo-500 rounded-full">
                We're hiring
              </span>
              <span className="ml-4 text-sm">Visit our main page</span>
              <ChevronRightIcon
                className="ml-2 w-5 h-5 text-gray-500"
                aria-hidden="true"
              />
            </a>
            <h1 className="tracking-tight font-extrabold text-white mt-5 text-6xl">
              <span className="block">A better way to</span>
              <span className="block text-indigo-400">have fun in discord</span>
            </h1>
            <p className="text-gray-300 mt-5 text-xl">
              Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure qui
              Lorem cupidatat commodo. Elit sunt amet fugiat veniam occaecat
              fugiat.
            </p>
          </div>
        </div>
        <div className="mx-auto max-w-2xl px-6" style={{ height: 220 }} />
      </div>
    </Layout>
  );
};

export const PedalContent = () => {
  return (
    <Layout>
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h1 className="tracking-tight font-extrabold text-white mt-5 text-6xl">
            <span className="block">Baking your Equalizer</span>
            <span className="block text-indigo-400">have fun in discord</span>
          </h1>
          <div className="py-7"></div>
          <div className="inline-flex items-center text-white bg-black rounded-full p-3 pr-3 text-base">
            <span className="px-3 py-5 text-white text-xs font-semibold leading-5 uppercase tracking-wide hover:bg-indigo-500 rounded-full">
              Waiting for server response
            </span>
            <span className="px-5 py-3 ml-4 text-sm hover:bg-blue-600 rounded-full tracking-wide">
              Started
            </span>
            <span className="grid px-5 py-5 ml-4 text-sm group hover:bg-yellow-600 rounded-full tracking-wide">
              In progress
              <p className="hidden ml-4 text-sm group-hover:block">%100</p>
            </span>
            <span className="px-5 py-3 ml-4 text-sm hover:bg-green-600 rounded-full tracking-wide">
              Done
            </span>
            <ChevronRightIcon
              className="ml-2 w-5 h-5 text-gray-500"
              aria-hidden="true"
            />
          </div>
          <p className="text-gray-300 mt-5 text-xl">
            Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure qui
            Lorem cupidatat commodo. Elit sunt amet fugiat veniam occaecat
            fugiat.
          </p>
        </div>
        <div className="mx-auto max-w-2xl px-6" style={{ height: 220 }} />
      </div>
    </Layout>
  );
};

export const Form = () => {
  return (
    <div className="mt-12">
      <form action="#" className="max-w-xl mx-auto">
        <div className="flex">
          <div className="min-w-0 flex-1">
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              className="block w-full px-4 py-3 rounded-md border-0 text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-300 focus:ring-offset-gray-900"
            />
          </div>
          <div className="mt-0 ml-3">
            <button
              type="submit"
              className="block w-full py-3 px-4 rounded-md shadow bg-indigo-500 text-white font-medium hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-300 focus:ring-offset-gray-900"
            >
              Start free trial
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-300 mt-4">
          Start your free 14-day trial, no credit card necessary. By providing
          your email, you agree to our{" "}
          <a href="#" className="font-medium text-white">
            terms of service
          </a>
          .
        </p>
      </form>
    </div>
  );
};

export const HeroImage = () => {
  return (
    <div className="mt-12 -mb-48">
      <div className="mx-auto max-w-2xl px-6">
        {/* Illustration taken from Lucid Illustrations: https://lucid.pixsellz.io/ */}
        <img
          className="w-full"
          src="https://tailwindui.com/img/component-images/cloud-illustration-indigo-400.svg"
          alt=""
        />
      </div>
    </div>
  );
};

export const FooterImage = () => {
  return (
    <div>
      {/* Hero card */}
      <div className="relative">
        <div className="absolute inset-x-0 bottom-0 h-1/2" />
        <div className="max-w-7xl mx-auto px-6">
          <div className="relative shadow-xl rounded-2xl overflow-hidden">
            <div className="absolute inset-0">
              <img
                className="h-full w-full object-cover"
                src="https://ichef.bbci.co.uk/news/976/cpsprodpb/C17B/production/_126313594_gettyimages-1217576289.jpg"
                alt="Cat"
              />
              <div className="absolute inset-0 bg-indigo-700 mix-blend-multiply" />
            </div>
            <div className="relative px-6 py-24">
              <h1 className="text-center font-extrabold tracking-tight text-5xl">
                <span className="block text-white">Take control of your</span>
                <span className="block text-indigo-200">customer support</span>
              </h1>
              <p className="mt-6 mx-auto text-center text-xl text-indigo-200 max-w-3xl">
                Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure qui
                lorem cupidatat commodo. Elit sunt amet fugiat veniam occaecat
                fugiat aliqua.
              </p>
              <div className="mt-10 mx-auto max-w-none flex justify-center">
                <div className="space-y-0 mx-auto inline-grid grid-cols-2 gap-5">
                  <a
                    href="#"
                    className="flex items-center justify-center py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-indigo-700 bg-white hover:bg-indigo-50 px-8"
                  >
                    Get started
                  </a>
                  <a
                    href="#"
                    className="flex items-center justify-center py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-500 bg-opacity-60 hover:bg-opacity-70 px-8"
                  >
                    Live demo
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
