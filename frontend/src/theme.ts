import { extendTheme, type ThemeConfig } from "@chakra-ui/react";

const config: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

const theme = extendTheme({
  // Pallette: https://coolors.co/c9c4b2-ddd8c4-c0d1b6-a3c9a8-84b59f-69a297-749189-6b6b6b-945d5d-50808e
  colors: {
    beige: {
      100: "#EFEAE2",
      200: "#E4DFD0",
      300: "#DAD5C7",
      400: "#D0CBBA",
      500: "#C9C4B2",
      600: "#B5B09E",
      700: "#A9A08C",
      800: "#94947A",
      900: "#888770",
    },
    white: {
      100: "#F6F4EA",
      200: "#EAF2DB",
      300: "#E3E1D2",
      400: "#E0E0C8",
      500: "#DDD8C4",
      600: "#CBC4B5",
      700: "#BEB8A6",
      800: "#AFA394",
      900: "#9E9888",
    },
    teagreen: {
      100: "#E7ECD9",
      200: "#DAE9D0",
      300: "#D1DFCA",
      400: "#C8D8C0",
      500: "#C0D1B6",
      600: "#AFBFAE",
      700: "#9DB099",
      800: "#8CA08B",
      900: "#7A8F7C",
    },
    green: {
      100: "#D8E7D6",
      200: "#C5DAC8",
      300: "#B8D2BA",
      400: "#ABCBB1",
      500: "#A3C9A8",
      600: "#93B699",
      700: "#82A488",
      800: "#729A78",
      900: "#617F68",
    },
    seagreen: {
      100: "#B5D3C8",
      200: "#A8C9BC",
      300: "#99C0B2",
      400: "#8CB7A8",
      500: "#84B59F",
      600: "#79A992",
      700: "#689285",
      800: "#598079",
      900: "#4D706B",
    },
    poolgreen: {
      100: "#A5C8BD",
      200: "#91BBC7",
      300: "#7FB0A7",
      400: "#74A7A2",
      500: "#69A297",
      600: "#5C938C",
      700: "#528178",
      800: "#47706C",
      900: "#3B6159",
    },
    tealgreen: {
      100: "#9CABA2",
      200: "#90A199",
      300: "#849896",
      400: "#7C908F",
      500: "#749189",
      600: "#66827A",
      700: "#5B736F",
      800: "#506562",
      900: "#435555",
    },
    grey: {
      100: "#9B9B9B",
      200: "#8D8D8D",
      300: "#828282",
      400: "#767676",
      500: "#6B6B6B",
      600: "#605F5F",
      700: "#545454",
      800: "#484848",
      900: "#3D3D3D",
    },
    carmine: {
      100: "#A39090",
      200: "#967E7E",
      300: "#907474",
      400: "#874D4D",
      500: "#806464",
      600: "#755858",
      700: "#704C4C",
      800: "#654040",
      900: "#603434",
    },
    red: {
      100: "#B58181",
      200: "#AB7777",
      300: "#9F6E6E",
      400: "#946565",
      500: "#945d5d",
      600: "#875252",
      700: "#784646",
      800: "#6D3C3C",
      900: "#5D2F2F",
    },
    bluegreen: {
      100: "#85A2A6",
      200: "#7C9999",
      300: "#688F92",
      400: "#5E8686",
      500: "#50808E",
      600: "#457778",
      700: "#386468",
      800: "#2E5155",
      900: "#204842",
    },
  },
  fonts: {
    body: "system-ui, sans-serif",
    heading: "Georgia, serif",
    mono: "Menlo, monospace",
  },
  fontSizes: {
    xs: "0.75rem",
    sm: "0.875rem",
    md: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
    "5xl": "3rem",
    "6xl": "3.75rem",
    "7xl": "4.5rem",
    "8xl": "6rem",
    "9xl": "8rem",
  },
  fontWeights: {
    hairline: 100,
    thin: 200,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },
  lineHeights: {
    normal: "normal",
    none: 1,
    shorter: 1.25,
    short: 1.375,
    base: 1.5,
    tall: 1.625,
    taller: "2",
    "3": ".75rem",
    "4": "1rem",
    "5": "1.25rem",
    "6": "1.5rem",
    "7": "1.75rem",
    "8": "2rem",
    "9": "2.25rem",
    "10": "2.5rem",
  },
  letterSpacings: {
    tighter: "-0.05em",
    tight: "-0.025em",
    normal: "0",
    wide: "0.025em",
    wider: "0.05em",
    widest: "0.1em",
  },
  config,
  styles: {
    global: () => ({
      body: {
        bg: "#545454",
        color: "#C9C4B2",
      },
    }),
  },
});

export default theme;