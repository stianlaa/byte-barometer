import { Button } from "@chakra-ui/react";
import { EXAMPLE_SUBJECTS } from "../../constants";

type QuickQueryListProps = {
    onClickQuery: (s: string) => void;
};


function getRandomElements<T>(arr: T[], n: number): T[] {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, n);
}


const exampleSubjects = getRandomElements(EXAMPLE_SUBJECTS, 3);

function QuickQueryList({ onClickQuery }: QuickQueryListProps) {
    const queryList = exampleSubjects
        .map((subject, i) =>
        (
            <Button
                key={`qq-${i}`}
                ml="0.5rem"
                p="0 0.5rem 0 0.5rem"
                bg="grey.500"
                color="beige.500"
                onClick={() => onClickQuery(subject)}
            >
                {subject}
            </Button>)
        );
    return (<>{queryList}</>)

}

export default QuickQueryList;