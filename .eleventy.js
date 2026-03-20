const yaml = require("js-yaml");

module.exports = async function (eleventyConfig) {
  const { EleventyHtmlBasePlugin } = await import("@11ty/eleventy");
  eleventyConfig.addPlugin(EleventyHtmlBasePlugin);

  eleventyConfig.addDataExtension("yml,yaml", (contents) => yaml.load(contents));

  eleventyConfig.addFilter("unique", (arr) => [...new Set(arr)]);
  eleventyConfig.addFilter("map", (arr, attr) => arr.map((item) => item[attr]));
  eleventyConfig.addFilter("obfuscateEmail", (email) =>
    Array.from(email).map((c) => `&#${c.charCodeAt(0)};`).join("")
  );
  eleventyConfig.addFilter("absoluteUrl", (url, base, fallback = null) =>
    url ? (url.startsWith('/') ? base + url : url) : fallback
  );
  eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);
  eleventyConfig.addShortcode("buildDate", () => new Date().toISOString().split("T")[0]);

  eleventyConfig.addPassthroughCopy("src/docs");
  eleventyConfig.addPassthroughCopy("src/fonts");
  eleventyConfig.addPassthroughCopy("src/js");
  eleventyConfig.addPassthroughCopy({ "src/css/noscript.css": "css/noscript.css" });
  eleventyConfig.addPassthroughCopy("src/favicon.svg");
  eleventyConfig.addPassthroughCopy("src/robots.txt");

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    pathPrefix: process.env.ELEVENTY_PATH_PREFIX || "/",
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["njk", "md"],
  };
};
