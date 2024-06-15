import { axiosClient } from ".";

export async function warmUpService() {
  const response = await axiosClient.get("/app/warmup");

  return response;
}
