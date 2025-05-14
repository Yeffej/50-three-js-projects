import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// 3. Define your collection(s)
const projects = defineCollection({ 
    loader: glob({ pattern: "**/*.yaml", base: "./src/data/projects" }),
    schema: z.object({
        name: z.string(),
        number: z.number(),
        script: z.string(),
        created: z.date(),
        updated: z.date(),
    }),
});

// 4. Export a single `collections` object to register your collection(s)
export const collections = { projects };