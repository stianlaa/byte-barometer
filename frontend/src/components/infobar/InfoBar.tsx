import { VStack } from "@chakra-ui/react";
import About from "./About";
import BackendStatusIndicator from "./BackendStatusIndicator";

export enum BackendStatus {
  RUNNING,
  ERROR,
  UNKNOWN,
}

type InfoBarProps = {
  backendStatus: BackendStatus;
};

function InfoBar({ backendStatus }: InfoBarProps) {

  return (
    <VStack position="absolute" bottom="1rem" left="1rem">
      <About />
      <BackendStatusIndicator backendStatus={backendStatus} />
    </VStack>
  );
}

export default InfoBar;
