import { t } from "./context";

import { authenticatedProcedure } from "./procedures";

export const pypedalRouter = t.router({
  isAuthorized: authenticatedProcedure.query(() => {
    return true;
  }),
});
