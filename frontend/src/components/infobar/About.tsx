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
  Link,
} from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { FaInfoCircle } from 'react-icons/fa';

function About() {
  return (
    <Popover>
      <PopoverTrigger>
        <Button
          bg="transparent"
          color="beige.700"
          aria-label="Disclaimer"
          p="0"
        >
          <FaInfoCircle size="32px" />
        </Button>
      </PopoverTrigger>
      <PopoverContent p={4} m={4} bg="grey.500" borderColor="grey.300">
        <PopoverCloseButton size="md" m="0.5rem" p="0.5rem" />
        <PopoverBody>
          <VStack spacing={2}>
            <Heading size="md">Hi there!</Heading>
            <Text>
              This is a fun project that tries to answer
              <Text fontStyle="italic" as="span">
                {" "}
                "What does HackerNews think about {'<'}subject{'>'}?"{" "}
              </Text>
              Have a look at the
              <Link
                href="https://github.com/stianlaa/byte-barometer"
                isExternal
                color="poolgreen.200"
              >
                {" "}
                source code
                <ExternalLinkIcon mx="2px" />
              </Link>{" "}
              if you're curious!
            </Text>
            <Text>
              New comments are added hourly, but it will be cut off at the
              latest 500,000 text chunks or so, in order to save on costs.
            </Text>
            <Text>
              The sentiment analysis is aspect based, and focused around your query
              subject. So use short and concise queries for the best results.
            </Text>
          </VStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}

export default About;
