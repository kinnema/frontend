import { cn } from "../utils";

export function Loading({
  fullscreen,
  description,
}: {
  fullscreen?: boolean;
  sizeClass?: string;
  description?: string;
}) {
  if (fullscreen) {
    return (
      <div className="fixed top-0 left-0 w-full h-full flex flex-col justify-center items-center bg-black/60 z-10">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn("animate-spin")}
        >
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>

        {description && <h1 className="text-lg mt-5">{description}</h1>}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center">
      <div className="animate-spin">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn()}
        >
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
      </div>
    </div>
  );
}
