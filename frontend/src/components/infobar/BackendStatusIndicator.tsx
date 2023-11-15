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
import { BackendStatus } from "./InfoBar"

type BackendStatusIndicatorProps = {
  backendStatus: BackendStatus;
};

const selectIcon = (status: BackendStatus) => {
  switch (status) {
    case BackendStatus.ERROR:
      return <TbCoffeeOff size="32px" />;
    case BackendStatus.RUNNING:
      return <TbCoffee size="32px" />;
    default:
      return <TbDropletQuestion size="32px" />
  }
};

const selectDescription = (status: BackendStatus) => {
  switch (status) {
    case BackendStatus.ERROR:
      return <>
        <Heading size="md">Disabled!</Heading>
        <Text>
          The backend has been manually disabled and will not respond to requests. Sorry about the inconvenience!
        </Text>
      </>
    case BackendStatus.RUNNING:
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
          icon={selectIcon(backendStatus)}
        />
      </PopoverTrigger>
      <PopoverContent p={4} m={4} bg="grey.500" borderColor="grey.300">
        <PopoverCloseButton size="md" m="0.5rem" p="0.5rem" />
        <PopoverBody>
          <VStack spacing={2}>
            {selectDescription(backendStatus)}
          </VStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}

export default BackendStatusIndicator;
