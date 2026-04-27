export declare class EncyclopediaController {
    examples(): {
        items: {
            id: string;
            title: string;
            author: string;
            style: string;
            excerpt: string;
            notes: string;
        }[];
    };
    vocabulary(): {
        items: {
            word: string;
            definition: string;
        }[];
    };
    tips(): {
        items: {
            id: string;
            title: string;
            body: string;
        }[];
    };
    structure(): {
        sections: {
            name: string;
            description: string;
        }[];
        tips: string;
    };
}
