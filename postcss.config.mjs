import tailwindcssAnimate from "tailwindcss-animate";

const config = {
  plugins: {
    "@tailwindcss/postcss": {
      plugins: {
        "tailwindcss-animate": tailwindcssAnimate,
      },
    },
  },
};

export default config;
