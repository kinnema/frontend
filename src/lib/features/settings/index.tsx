"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

const SETTINGS = [
  {
    name: "App",
    sub: [
      {
        name: "Plugins",
        href: "/plugins",
      },
      {
        name: "Updates",
        href: "updates",
      },
      {
        name: "Subtitles",
        href: "/settings/subtitles",
      },
    ],
  },
];

export default function AppSettingsFeature() {
  return (
    <Card className="w-full max-w-md mx-auto my-8 md:my-12">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Settings</CardTitle>
        <CardDescription>Manage your app preferences.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        {SETTINGS.map((setting) => (
          <div className="grid gap-4">
            <h3 className="text-lg font-semibold">{setting.name}</h3>

            {setting.sub.map((subMenu) => (
              <Link to={subMenu.href}>
                <Button variant="ghost" className="justify-between w-full px-0">
                  <span>{subMenu.name}</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            ))}
          </div>
        ))}
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Button className="w-full">Save Changes</Button>
        <Button variant="outline" className="w-full bg-transparent">
          Reset to Defaults
        </Button>
      </CardFooter>
    </Card>
  );
}
