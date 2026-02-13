import react from "@vitejs/plugin-react";

export default {
  stories: ["../src/ui/__stories__/*.stories.@(js|jsx|ts|tsx)"],
  addons: ["@storybook/addon-essentials", "@storybook/addon-interactions"],
  framework: {
    name: "@storybook/react-vite",
    options: {}
  },
  docs: { autodocs: "tag" },
  typescript: {
    reactDocgen: false
  },
  viteFinal: async (config) => {
    config.plugins = [...(config.plugins || []), react()];
    return config;
  }
};
