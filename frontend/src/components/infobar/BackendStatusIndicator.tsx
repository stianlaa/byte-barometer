import {
  Heading,
  Button,
  Popover,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
  VStack,
  Text,
} from "@chakra-ui/react";
// import { SpinnerIcon } from "@chakra-ui/icons";
import { BackendStatus } from "./InfoBar"

type BackendStatusIndicatorProps = {
  backendStatus: BackendStatus;
};

// const selectIcon = (status: string) => {
//   switch (status) {
//     case "DISABLED":
//       return <SpinnerIcon w="70%" h="70%" />;
//     case "WARM_UP":
//       return <SpinnerIcon w="70%" h="70%" />;

//     case "RUNNING":
//       return <SpinnerIcon w="70%" h="70%" />;

//     case "UNKNOWN":
//       return <SpinnerIcon w="70%" h="70%" />;

//     default:
//       return <SpinnerIcon w="70%" h="70%" />;
//   }
// };

function BackendStatusIndicator({
  backendStatus,
}: BackendStatusIndicatorProps) {
  return (
    <Popover>
      <PopoverTrigger>
        {/* <IconButton
          size="lg"
          bg="transparent"
          color="beige.700"
          icon={selectIcon(status.status)}
        /> */}
        <Button size="lg" bg="transparent" color="beige.700">
          {backendStatus.status}
        </Button>
      </PopoverTrigger>
      <PopoverContent p={4} bg="grey.500" w="60%" borderColor="grey.300">
        <PopoverCloseButton size="md" m="0.5rem" p="0.5rem" />
        <PopoverBody>
          <VStack spacing={2}>
            <Heading size="md">Warming up!</Heading>
            <Text>
              To manage costs the backend provisions GPU resources when it
              expects traffic, for instance when visitors come by. It might take
              a short while for the system to warm up.
            </Text>
          </VStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}

export default BackendStatusIndicator;
