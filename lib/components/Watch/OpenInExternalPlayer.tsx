import { Button } from "@/components/ui/button";

enum PlayerType {
  VLC = "vlc",
  MPV = "mpv",
}

const players = [
  {
    key: PlayerType.VLC,
    name: "VLC",
    className: "bg-orange-500 hover:bg-orange-600",
  },
  {
    key: PlayerType.MPV,
    name: "MPV",
    className: "bg-blue-500 hover:bg-blue-600",
  },
];

interface OpenInExternalPlayerProps {
  url: string;
}

export function OpenInExternalPlayer({ url }: OpenInExternalPlayerProps) {
  const handleExternalPlayer = (player: PlayerType, url: string) => {
    switch (player) {
      case PlayerType.VLC:
        // Open VLC with the provided URL
        window.open("vlc://" + url, "_blank");
        break;
      case PlayerType.MPV:
        window.open("mpv://" + url, "_blank");
        break;

      default:
        console.warn(
          "Unsupported player type or no handler implemented for:",
          player
        );
        break;
    }
  };

  return (
    <div className="flex flex-col items-center text-center h-full w-full justify-center">
      <h1 className="text-xl font-semibold">Maalesef...</h1>
      <p className="mb-4">
        Bu içerik, tarayıcıda oynatılamıyor. Lütfen VLC Player gibi bir uygulama
        kullanarak izleyin.
      </p>
      <div className="flex">
        {players.map((player) => (
          <Button
            className={`mr-2 ${player.className}`}
            key={player.name}
            onClick={() => handleExternalPlayer(player.key, url)}
          >
            {player.name.toUpperCase()} Oynatıcısı ile Aç
          </Button>
        ))}
      </div>
    </div>
  );
}
