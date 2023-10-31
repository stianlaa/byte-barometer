import "./index.css";
import {
  Heading,
  IconButton,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
  VStack,
  Text,
  Link,
} from "@chakra-ui/react";
import { ExternalLinkIcon, QuestionIcon } from "@chakra-ui/icons";

function About() {
  return (
    <Popover>
      <PopoverTrigger>
        <IconButton
          size="lg"
          bg="transparent"
          color="beige.700"
          aria-label="Disclaimer"
          icon={<QuestionIcon w="70%" h="70%" />}
        />
      </PopoverTrigger>
      <PopoverContent p={4} bg="grey.500" w="40%" borderColor="grey.300">
        <PopoverArrow />
        <PopoverCloseButton size="md" m="0.5rem" p="0.5rem" />
        <PopoverBody>
          <VStack spacing={2}>
            <Heading size="md">Hi there!</Heading>
            <Text>
              This is one of my side projects, so there might be a bug or two
              hiding around. Check out the
              <Link
                href="https://github.com/stianlaa/byte-barometer"
                isExternal
                color="poolgreen.200"
              >
                {" "}
                source code <ExternalLinkIcon mx="2px" />
              </Link>
              and if you're feeling adventurous, throw in a pull request.
            </Text>
            <Text>
              New comments are added continiously and automatically, but I will
              cap it at the latest 500,000 sentences or to save on costs.
            </Text>
            <Text>
              About the sentiment analysis it is aspect based around your query
              subject. So long queries confuse it somewhat.
            </Text>
          </VStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}

export default About;
