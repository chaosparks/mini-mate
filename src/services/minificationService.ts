import { minify } from 'terser';
import { minify as minifyCss } from 'csso';

export const minifyCodeLocally = async (
  code: string,
  type: 'JS' | 'CSS'
): Promise<string> => {
  if (type === 'JS') {
    try {
      // Terser is async
      const result = await minify(code, {
        mangle: true,
        compress: true,
        sourceMap: false,
      });
      return result.code || "";
    } catch (error) {
      console.error("JS Minification Error:", error);
      throw new Error("Failed to minify JavaScript. Ensure the code is valid.");
    }
  } else {
    try {
      // CSSO is sync, but we wrap it in the same promise structure
      const result = minifyCss(code, {
        restructure: true,
        comments: false
      });
      return result.css;
    } catch (error) {
      console.error("CSS Minification Error:", error);
      throw new Error("Failed to minify CSS. Ensure the code is valid.");
    }
  }
};