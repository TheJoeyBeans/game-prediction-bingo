import { sha256Hex } from "./cardIds";
import { getSupabase } from "./supabase";

// Creating cards only; viewing is never limited. Over the limit still gets a working long link
const IP_PER_MINUTE = 10;
const IP_PER_DAY = 100;
const GLOBAL_PER_MINUTE = 300;

// Returns true if this create is allowed. Only a salted hash of the IP is stored
export const checkRateLimit = async (ip: string): Promise<boolean> => {
  const salt = process.env.IP_HASH_SALT;
  if (!salt) throw new Error("IP_HASH_SALT is not set");

  const { data, error } = await getSupabase().rpc("check_create_limits", {
    p_ip_key: `ip:${await sha256Hex(salt + ip)}`,
    p_ip_per_minute: IP_PER_MINUTE,
    p_ip_per_day: IP_PER_DAY,
    p_global_per_minute: GLOBAL_PER_MINUTE,
  });
  if (error) throw new Error(`check_create_limits failed: ${error.message}`);
  return data === true;
};
