import { axiosClient } from ".";

export async function warmUpService() {
  const response = await axiosClient.post("/app/warmup");

  return response;
}
