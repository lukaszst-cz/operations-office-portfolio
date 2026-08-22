document.querySelectorAll("p,h1,h2,h3,b,span,a,li,blockquote,th,td").forEach((element) => {
  element.childNodes.forEach((node) => {
    if (node.nodeType === 3) node.nodeValue = node.nodeValue.replace(/(^|[\s\u00A0])([AaIiOoUuWwZz])\s+/g, "$1$2\u00A0");
  });
});
