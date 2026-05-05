import { zocker } from "zocker";
import { BlogSchema } from "./blogs.schema";

export const mockBlogs = zocker(BlogSchema).generateMany(10);
