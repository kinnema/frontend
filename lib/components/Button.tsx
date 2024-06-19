import { ButtonProps, Button as NextUIButton } from "@nextui-org/button";
import classNames from "classnames";

interface IProps extends ButtonProps {
  rounded?: boolean;
  secondary?: boolean;
  onClick?: (e: any) => void;
  href?: string;
  className?: string;
  icon?: React.ReactNode;
}

export default function Button({
  onClick,
  href,
  children,
  secondary,
  className,
  icon,
  ...rest
}: IProps) {
  return (
    <NextUIButton
      type="button"
      href={href}
      onClick={(e) => onClick && onClick(e)}
      startContent={icon}
      className={classNames(
        {
          "bg-red-100 hover:bg-red-100 text-red-800": secondary,
          "bg-red-600  hover:bg-red-700 text-white": !secondary,
        },
        className
      )}
      {...rest}
    >
      {children}
    </NextUIButton>
  );
}
