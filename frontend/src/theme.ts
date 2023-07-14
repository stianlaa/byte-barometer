import { extendTheme, type ThemeConfig } from "@chakra-ui/react";

const config: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  styles: {
    global: () => ({
      body: {
        bg: "#242424",
        color: "#F5F5F5",
      },
    }),
  },
});

export default theme;
