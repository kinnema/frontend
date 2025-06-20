import { Configuration, DefaultApi, RequestContext } from "../api";
import { BASE_URL } from "../constants";

const getAuthMiddleware = () => ({
  pre: async (context: RequestContext) => {
    if (typeof window === "undefined") {
      return context;
    }

    const token = localStorage.getItem("access_token");

    if (token) {
      context.init.headers = {
        ...context.init.headers,
        Authorization: `Bearer ${token}`,
      };
    }
    return context;
  },
});

const apiConfig = new Configuration({
  basePath: BASE_URL,
  middleware: [getAuthMiddleware()],
});

export const apiClient = new DefaultApi(apiConfig);
