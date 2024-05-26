import classNames from "classnames";
import { PropsWithChildren } from "react";

type I = PropsWithChildren & React.ButtonHTMLAttributes<HTMLButtonElement>;

interface IProps extends I {
  rounded?: boolean;
  secondary?: boolean;
}

export default function Button({
  children,
  rounded,
  secondary,
  ...rest
}: IProps) {
  return (
    <button
      className={classNames(
        "px-5 py-2.5 rounded-lg text-center font-medium block ",
        {
          "rounded-full": rounded,
          "bg-red-100 hover:bg-red-100 text-red-800": secondary,
          "bg-red-600  hover:bg-red-700 text-white": !secondary,
        }
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
