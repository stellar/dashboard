import parse, {
  HTMLReactParserOptions,
  Element,
  domToReact,
} from "html-react-parser";
import DOMPurify from "dompurify";
import { TextLink } from "@stellar/design-system";

const parseOptions: HTMLReactParserOptions = {
  replace: (domNode) => {
    if (domNode instanceof Element && domNode.name === "a") {
      return (
        <TextLink
          href={domNode.attribs?.href}
          variant={TextLink.variant.secondary}
          underline
        >
          {domToReact(domNode.children)}
        </TextLink>
      );
    }

    return domNode;
  },
};

export const sanitizeHtml = (html: string) =>
  parse(
    DOMPurify.sanitize(html, { USE_PROFILES: { html: true } }),
    parseOptions,
  );
