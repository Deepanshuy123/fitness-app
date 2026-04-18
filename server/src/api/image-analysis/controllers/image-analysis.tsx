import { Context } from "koa";
import { analyze } from "../services/gemini";




export default {
  async analyze(ctx: Context) {
      let file = ctx.request.files?.image as any;
      if (!file) return ctx.badRequest("No file uploaded");
      if (Array.isArray(file)) file = file[0];

      const filePath = file.filepath || file.path;
      if (!filePath) return ctx.badRequest("No file path available");

      try {
          const mimeType = file.type || "image/jpeg";
          const result = await analyze(filePath, mimeType);
          return ctx.send({ success: true, ...result });
      } catch (error: any) {
          ctx.internalServerError("Failed to analyze image", { error: error?.message || String(error) });
      }

  }
}