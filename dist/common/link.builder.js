"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userLinks = userLinks;
exports.collectionLinks = collectionLinks;
exports.operationLinks = operationLinks;
function userLinks(userId) {
    return {
        self: { href: `/users/${userId}`, method: 'GET' },
        update: { href: `/users/${userId}`, method: 'PATCH' },
        delete: { href: `/users/${userId}`, method: 'DELETE' },
        collection: { href: `/users`, method: 'GET' },
        export: { href: `/users/${userId}/export`, method: 'POST' },
    };
}
function collectionLinks() {
    return {
        self: { href: `/users`, method: 'GET' },
        create: { href: `/users/create_user`, method: 'POST' },
    };
}
function operationLinks(jobId, userId, resultPath) {
    const links = {
        self: { href: `/users/operations/${jobId}`, method: 'GET' },
    };
    if (userId)
        links.user = { href: `/users/${userId}`, method: 'GET' };
    if (resultPath)
        links.result = { href: resultPath, method: 'GET' };
    return links;
}
//# sourceMappingURL=link.builder.js.map