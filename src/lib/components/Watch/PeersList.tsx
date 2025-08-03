import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"; // Import ScrollBar for horizontal scroll indicator

interface IPeer {
  id: string;
  name: string;
}

interface IProps {
  peers: IPeer[];
}

export default function PeersList({ peers }: IProps) {
  return (
    <Card className="w-full max-w-3xl mx-auto shadow-xl rounded-2xl border-2 border-primary/20 overflow-hidden">
      <CardHeader className="pb-4 bg-gradient-to-br from-primary/10 to-background/50">
        <CardTitle className="text-2xl font-bold">Connected Peers</CardTitle>
        <p className="text-sm text-muted-foreground">
          See who's in the room with you.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScrollArea className="w-full whitespace-nowrap pb-4">
          <div className="flex space-x-4 p-1">
            {peers.map((peer) => (
              <div
                key={peer.id}
                className="flex-shrink-0 w-48 flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-primary/10 transition-all duration-200 ease-in-out transform hover:scale-[1.02] cursor-pointer border border-primary/10"
              >
                <div className="relative">
                  <Avatar className="w-16 h-16 border-3 border-background ring-3 ring-primary/60">
                    <AvatarImage src={""} alt={`${peer.name}'s avatar`} />
                    <AvatarFallback>
                      {peer.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex flex-col items-center text-center mt-2">
                  <p className="font-medium text-base leading-tight">
                    {peer.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <ScrollBar
            orientation="horizontal"
            className="h-2 bg-primary/20 rounded-full"
          />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
