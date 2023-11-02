import { VStack } from "@chakra-ui/react";
import About from "./About";
import BackendStatus from "./BackendStatus";

function InfoBar() {
  return (
    <VStack position="absolute" top="1rem" left="1rem">
      <About />
      <BackendStatus />
    </VStack>
  );
}

export default InfoBar;
