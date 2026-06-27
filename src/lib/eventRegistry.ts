import { cs101Config } from "@/config/events/cs101";
import { helloWorldConfig } from "@/config/events/hello-world";

export const ALLOWED_EVENTS = ["cs101", "hello-world"] as const;
export type AllowedEvent = (typeof ALLOWED_EVENTS)[number];

export const REGISTRATION_CONFIG = {
  "cs101": cs101Config.registration,
  "hello-world": helloWorldConfig.registration,
} as const;
