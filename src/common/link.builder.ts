export type Link = { href: string; method?: string };
export type Links = Record<string, Link>;

export function userLinks(userId: string): Links {
    return {
        self:       { href: `/users/${userId}`, method: 'GET' },
        update:     { href: `/users/${userId}`, method: 'PATCH' },
        delete:     { href: `/users/${userId}`, method: 'DELETE' },
        collection: { href: `/users`, method: 'GET' },
        export:     { href: `/users/${userId}/export`, method: 'POST' },
    };
}

export function collectionLinks(): Links {
    return {
        self:   { href: `/users`, method: 'GET' },
        create: { href: `/users/create_user`, method: 'POST' },
    };
}

export function operationLinks(jobId: string, userId?: string, resultPath?: string): Links {
    const links: Links = {
        self: { href: `/users/operations/${jobId}`, method: 'GET' },
    };
    if (userId) links.user = { href: `/users/${userId}`, method: 'GET' };
    if (resultPath) links.result = { href: resultPath, method: 'GET' };
    return links;
}
