import { Link } from "react-router-dom";
import { Home, BarChart2, DollarSign, Settings, Bell } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

const Header = () => {
  return (
    <header className="border-b px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
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
            className="lucide lucide-zap"
          >
            <path d="M10.23 20.31L7.86 23 1 12 13.56 1 16.14 3.73 12.01 10.21 21.01 10.21 16.14 14.21 22.46 14.21 10.23 20.31Z" />
          </svg>
          Smart Energy Meter
        </h1>

        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink href="/" className={navigationMenuTriggerStyle()}>
                <Home className="mr-2 h-4 w-4" />
                Dashboard
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="/analytics" className={navigationMenuTriggerStyle()}>
                <BarChart2 className="mr-2 h-4 w-4" />
                Analytics
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="/billing" className={navigationMenuTriggerStyle()}>
                <DollarSign className="mr-2 h-4 w-4" />
                Billing
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="/settings" className={navigationMenuTriggerStyle()}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      <Button variant="outline" size="icon" className="relative">
        <Bell className="h-5 w-5" />
        <Badge
          variant="destructive"
          className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center rounded-full p-0 text-xs"
        >
          2
        </Badge>
      </Button>
    </header>
  );
};

export default Header; 