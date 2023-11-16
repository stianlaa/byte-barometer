import { Button, HStack } from "@chakra-ui/react";
import { EXAMPLE_SUBJECTS, EXAMPLE_SUBJECT_COUNT } from "../../constants";

type QuickQueryListProps = {
    onClickQuery: (s: string) => void;
};


function getRandomElements<T>(arr: T[], n: number): T[] {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, n);
}


const exampleSubjects = getRandomElements(EXAMPLE_SUBJECTS, EXAMPLE_SUBJECT_COUNT);

function QuickQueryList({ onClickQuery }: QuickQueryListProps) {
    const queryList = exampleSubjects
        .map((subject, i) =>
        (
            <Button
                key={`qq-${i}`}
                p="0 0.5rem 0 0.5rem"
                bg="grey.500"
                color="beige.500"
                onClick={() => onClickQuery(subject)}
                fontSize="xs"
            >
                {subject}
            </Button>)
        );
    return (<HStack>{queryList}</HStack>)

}

export default QuickQueryList;