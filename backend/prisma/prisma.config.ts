import { defineConfig } from '@prisma/internals';

export default defineConfig({
  datasource: {
    db: {
      url: "postgresql://postgres:12345678@localhost:5432/nandeyalpos?schema=public",
    },
  },
});
