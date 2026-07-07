import postcss from "postcss";
import tailwind from "@tailwindcss/postcss";
import autoprefixer from "autoprefixer";

const css = `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  .test { @apply border-border; }
}
`;

postcss([tailwind(), autoprefixer()])
  .process(css, { from: undefined })
  .then((result) => {
    console.log("built");
  })
  .catch((err) => {
    console.error(err.name);
    console.error(err.message);
    process.exit(1);
  });
