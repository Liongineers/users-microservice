export type Link = {
    href: string;
    method?: string;
};
export type Links = Record<string, Link>;
export declare function userLinks(userId: string): Links;
export declare function collectionLinks(): Links;
export declare function operationLinks(jobId: string, userId?: string, resultPath?: string): Links;
