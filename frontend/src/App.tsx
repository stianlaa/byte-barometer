import {
  Text,
  Box,
  Divider,
  Heading,
  Input,
  SimpleGrid,
  VStack,
} from "@chakra-ui/react";
import "./index.css";
import { useState, KeyboardEvent } from "react";
import axios, { AxiosResponse } from "axios";
import { CommentWithSentiment } from "./Comment";
import Comment from "./Comment";

const VISIBLE_COMMENTS = 3;
const PORT = 3000;

// TODO replace with varying example
const exampleSubject = "Tesla";
const placeholder: any = [
  {
    objectID: "36436131",
    parentID: 36434315,
    author: "Alex-C137",
    commentText:
      "I feel like React is more complicated these days for little gain. I&#x27;ve worked in Knockout.js, Aurelia, Svelte, Vue 2, Vue 3, and now React.js. To me, React.js was more complicated to learn than almost all of them (Knockout.js is older so that felt more complicated to me). My favorite was either Vue 2 or Svelte - they&#x27;re just simple to learn.<p>In my opinion I feel like React.js was ahead of its time, but now we&#x27;re seeing some competitors achieve the same (or better results in terms of benchmarks) with simpler approaches.<p>Keep in mind these are just opinions, and I&#x27;m only about a month into React in a massive web application. That said, it took me like a literal day to learn Vue 2 because it was mostly just like native web development anyways.",
    positive: 0.04706718400120735,
    negative: 0.21177811920642853,
    neutral: 0.741154670715332,
  },
  {
    objectID: "36447191",
    parentID: 36442797,
    author: "hombre_fatal",
    commentText:
      "Libs like Anime.js are declarative and programmatic. They might be implemented with something that looks like your snippet, but that doesn&#x27;t mean your snippet supersedes a declarative, programmatic API. Just like el.innerHTML = &#x27;&lt;h1&gt;hi&lt;&#x2F;h1&gt;&#x27; doesn&#x27;t supersede React.js.",
    positive: 0.000380091107217595,
    negative: 0.0007402621558867395,
    neutral: 0.998879611492157,
  },
  {
    objectID: "36267267",
    parentID: 36263298,
    author: "reducesuffering",
    commentText: "Linux systems &#x2F; command line<p>SQL<p>React.js",
    positive: 0.0001658520777709782,
    negative: 0.00007626012666150928,
    neutral: 0.9997578263282776,
  },
  {
    objectID: "36429414",
    parentID: 36429413,
    author: "TechRecruiting",
    commentText:
      "We are currently looking for a skilled &amp; passionate Senior Full Stack Developer (m&#x2F;f&#x2F;d) to become part of one of our Tech Teams onsite in Hamburg or remote within the EU!<p>All developers at ABOUT YOU are driven by the love of creating outstanding user experiences across our high-scalable applications. Your work will impact the future of how eCommerce is experienced by millions of customers. As a Full Stack Developer (m&#x2F;f&#x2F;d), you will be responsible for contributing to the application architecture and doing intensive, design orientated development on both Frontend and Backend code.<p>Leap to the next level in your career by building game-changing eCommerce Software and Shop.<p>What you will do<p>- Build high traffic web applications with PHP (Symfony or Laravel) and JavaScript &#x2F; TypeScript (Vue.js, React.js)<p>- Engage in decisions ranging from UX Design to Backend architecture together with the Tech Lead and explore new technologies<p>- Build internal &amp; external RESTful API as well as beautiful user interfaces<p>- Work with agile processes that are adapted to the team’s needs<p>- Exchange your knowledge with other developers and be part of our ABOUT YOU TECH community<p>Who you are<p>- Excellent &amp; MVP-focused coding skills in PHP (Symfony or Laravel) minimum of 4 years<p>- Practical &amp; recent experience with JS Frameworks like Vue.js or React.js<p>- Solid background in building complex and beautiful products which are able to handle the requests by millions of users<p>- Good technical understanding of RESTful API’s<p>- Passionate about writing well-structured, efficient and maintainable code, actively keeping the quality of the code base in check\n- Used to work in an English-speaking environment",
    positive: 0.21049143373966217,
    negative: 0.0007587145082652569,
    neutral: 0.7887498736381531,
  },
  {
    objectID: "36428936",
    parentID: 36427583,
    author: "mr90210",
    commentText:
      "I gave up the Javscript rat chase, for now I am sticking with React.js.<p>Svelte has been around for years, and in my opinion it won’t really gain that much traction anymore. (It’s just an opinion, let’s not be religious)",
    positive: 0.42400097846984863,
    negative: 0.0011378554627299309,
    neutral: 0.5748611688613892,
  },
];

function App() {
  const [queryString, setQueryString] = useState<string>(exampleSubject);
  const [positiveComments, setPositiveComments] =
    useState<CommentWithSentiment[]>(placeholder);
  const [negativeComments, setNegativeComments] =
    useState<CommentWithSentiment[]>(placeholder);

  const querySubject = (subject: string) => {
    axios
      .post(`http://localhost:${PORT}/query`, {
        query: subject,
        commentCount: 6,
      })
      .then((response: AxiosResponse<CommentWithSentiment[]>) => {
        const data = response.data;
        console.log(response);
        setPositiveComments(
          data.filter(({ positive, negative }) => positive > negative)
        );
        setNegativeComments(
          data.filter(({ positive, negative }) => positive < negative)
        );
      });
  };

  const handleCompletion = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && queryString) {
      querySubject(queryString);
    }
  };

  return (
    <Box w="100%" bgColor="var(--bg-dark)">
      <Box w="100%">
        <Heading color="white">Byte Barometer</Heading>
        <Text>{queryString}</Text>

        <Input
          value={queryString}
          onChange={(e) => setQueryString(e.target.value)}
          m={5}
          p={5}
          placeholder={`What does hackernews think about.. ${exampleSubject}`}
          color="white"
          size="md"
          w="80%"
          onKeyDown={handleCompletion}
        />
      </Box>

      <Divider />

      <SimpleGrid columns={2} spacing={10}>
        <VStack h="auto" bg="green.500">
          {positiveComments.length > 0
            ? positiveComments
                .slice(0, VISIBLE_COMMENTS)
                .sort((a, b) => b.positive - a.positive)
                .map((comment) => <Comment {...comment} />)
            : null}
        </VStack>
        <VStack h="auto" bg="red.500">
          {negativeComments.length > 0
            ? negativeComments
                .slice(0, VISIBLE_COMMENTS)
                .sort((a, b) => b.negative - a.negative)
                .map((comment) => <Comment {...comment} />)
            : null}
        </VStack>
      </SimpleGrid>
    </Box>
  );
}

export default App;
