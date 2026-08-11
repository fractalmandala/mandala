export function normalizeFileLinkDestinations(content) {
  return content.replace(
    /\]\((file:\/\/[^\s)]+(?: [^\s)]+)*)\)/g,
    (_match, href) => `](${href.replaceAll(" ", "%20")})`,
  );
}
