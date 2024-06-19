import { Button as NextUIButton } from "@nextui-org/button";
import classNames from "classnames";
import { PropsWithChildren } from "react";
type I = PropsWithChildren & React.ButtonHTMLAttributes<HTMLButtonElement>;

interface IProps extends I {
  rounded?: boolean;
  secondary?: boolean;
  onClick?: () => void;
  href?: string;
  className?: string;
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export default function Button({
  onClick,
  href,
  children,
  secondary,
  className,
  isLoading,
  icon,
}: IProps) {
  return (
    <NextUIButton
      type="button"
      href={href}
      isLoading={isLoading}
      onClick={onClick}
      startContent={icon}
      className={classNames(
        {
          "bg-red-100 hover:bg-red-100 text-red-800": secondary,
          "bg-red-600  hover:bg-red-700 text-white": !secondary,
        },
        className
      )}
    >
      {children}
    </NextUIButton>
  );
}
