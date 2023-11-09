import {
  Heading,
  Popover,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
  VStack,
  Text,
  IconButton,
} from "@chakra-ui/react";
import { TbCoffee, TbCoffeeOff, TbDropletQuestion } from 'react-icons/tb';
import { MdOutlineCoffeeMaker } from 'react-icons/md';
import { BackendStatus } from "./InfoBar"

type BackendStatusIndicatorProps = {
  backendStatus: BackendStatus;
};

const selectIcon = (status: string) => {
  switch (status) {
    case "DISABLED":
      return <TbCoffeeOff size="32px" />;
    case "WARM_UP":
      return <MdOutlineCoffeeMaker size="32px" />;
    case "RUNNING":
      return <TbCoffee size="32px" />;
    default:
      return <TbDropletQuestion size="32px" />
  }
};

const selectDescription = (status: string) => {
  switch (status) {
    case "DISABLED":
      return <>
        <Heading size="md">Disabled!</Heading>
        <Text>
          The backend has been manually disabled and will not respond to requests. Sorry about the inconvenience!
        </Text>
      </>
    case "WARM_UP":
      return <>
        <Heading size="md">Warming up!</Heading>
        <Text>
          The backend provisions GPU resources when it
          expects traffic, for instance when visitors come by. It might take
          a short while for the system to warm up.
        </Text>
      </>
    case "RUNNING":
      return <>
        <Heading size="md">Running!</Heading>
        <Text>
          The backend has provisioned GPU resources, responds and should be ready to respond to queries. Ask away!
        </Text>
      </>
    default:
      return <>
        <Heading size="md">Unknown</Heading>
        <Text>
          We currently have no information about the state of the backend.
        </Text>
      </>
  }
};

function BackendStatusIndicator({
  backendStatus,
}: BackendStatusIndicatorProps) {

  return (
    <Popover>
      <PopoverTrigger>
        <IconButton
          size="lg"
          bg="transparent"
          color="beige.700"
          aria-label="Show backend status"
          icon={selectIcon(backendStatus.status)}
        />
      </PopoverTrigger>
      <PopoverContent p={4} bg="grey.500" w="60%" borderColor="grey.300">
        <PopoverCloseButton size="md" m="0.5rem" p="0.5rem" />
        <PopoverBody>
          <VStack spacing={2}>
            {selectDescription(backendStatus.status)}
          </VStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}

export default BackendStatusIndicator;
