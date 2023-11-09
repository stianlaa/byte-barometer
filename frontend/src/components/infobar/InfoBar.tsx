import { VStack } from "@chakra-ui/react";
import About from "./About";
import BackendStatusIndicator from "./BackendStatusIndicator";

export type BackendStatus = {
  status: string;
  deploymentSpec: string | undefined;
};

type InfoBarProps = {
  backendStatus: BackendStatus;
};

function InfoBar({ backendStatus }: InfoBarProps) {

  return (
    <VStack position="absolute" top="1rem" left="1rem">
      <About />
      <BackendStatusIndicator backendStatus={backendStatus} />
    </VStack>
  );
}

export default InfoBar;
