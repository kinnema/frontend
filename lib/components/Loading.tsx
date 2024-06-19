import { CircularProgress } from "@nextui-org/progress";

export function Loading({
  fullscreen,
  sizeClass,
}: {
  fullscreen?: boolean;
  sizeClass?: string;
}) {
  if (fullscreen) {
    return (
      <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black/60 z-10">
        <CircularProgress label="Loading..." />
      </div>
    );
  }

  return <CircularProgress label="Loading..." className="flex self-center" />;
}
