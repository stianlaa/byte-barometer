import { Box, SimpleGrid } from "@chakra-ui/react";
import "./App.css";
import "./index.css";

function App() {
  return (
    <Box w="100%">
      <Box w="100%" h="100px" bg="blue.500">
        Wide Element
      </Box>

      <SimpleGrid columns={2} spacing={10}>
        <Box h="100px" bg="green.500">
          Element 1
        </Box>
        <Box h="100px" bg="red.500">
          Element 2
        </Box>
      </SimpleGrid>
    </Box>
  );
}

export default App;
