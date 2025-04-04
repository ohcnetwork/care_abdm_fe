module.exports = function prefixClassnames({ types: t }) {
  return {
    visitor: {
      JSXAttribute(path, state) {
        if (
          path.node.name.name !== "className" ||
          !t.isStringLiteral(path.node.value)
        )
          return;

        const prefix = state.opts.prefix || "";
        const classNames = path.node.value.value.split(/\s+/);
        const prefixedClassNames = classNames
          .map((cls) => {
            cls ? `${prefix}${cls}` : "";
            if (!cls) {
              return "";
            }

            if (cls.startsWith(prefix)) {
              return cls;
            }

            return `${prefix}${cls}`;
          })
          .join(" ")
          .trim();

        path.node.value = t.stringLiteral(prefixedClassNames);
      },
    },
  };
};
