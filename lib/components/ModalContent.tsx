import { PropsWithChildren } from "react";

interface IProps extends PropsWithChildren {
  actions: React.ReactNode[];
}

export default function ModelContent({ children, actions }: IProps) {
  return (
    <div className="flex flex-col justify-center items-center h-full z-10 p-10  ">
      <div
        id="content"
        className="dark:bg-zinc-900 bg-white p-5 md:w-80 w-full dark:text-white rounded-md flex flex-col"
      >
        <span className="text-xl font-semibold">Giris yap</span>
        <div className="pt-5">{children}</div>

        <div
          id="actions"
          className="flex gap-5 mt-10 self-end border-t w-full pt-3 dark:border-gray-700"
        >
          {actions.map((action) => action)}
        </div>
      </div>
    </div>
  );
}
