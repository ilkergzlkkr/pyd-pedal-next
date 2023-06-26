import { t } from "./context";

import { publicProcedure } from "./procedures";

export const pypedalRouter = t.router({
  isAuthorized: publicProcedure.query(() => {
    return true;
  }),
});
