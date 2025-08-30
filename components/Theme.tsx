import { useColorScheme } from "nativewind";
import { Button } from "./ui/button";
import { Icon } from "./ui/icon";
import { MoonStarIcon, SunIcon } from "lucide-react-native";


export function ThemeToggle() {
  const { colorScheme, toggleColorScheme } = useColorScheme();

  return (
    <Button onPress={toggleColorScheme} size="icon" variant="ghost" className="rounded-full">
      <Icon as={THEME_ICONS[colorScheme ?? 'light']} className="size-6" />
    </Button>
  );
}
const THEME_ICONS = {
  light: SunIcon,
  dark: MoonStarIcon,
};