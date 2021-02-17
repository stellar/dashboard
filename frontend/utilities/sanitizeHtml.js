import parse from "html-react-parser";
import DOMPurify from "dompurify";

function sanitizeHtml(html) {
  return parse(DOMPurify.sanitize(html));
}

export default sanitizeHtml;
