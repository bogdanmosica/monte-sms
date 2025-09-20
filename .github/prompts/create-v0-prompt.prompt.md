---
description: Create a v0 prompt for UI and code generation, following best practices from Vercel's official guidance and leveraging manual updates from https://vercel.com/blog/maximizing-outputs-with-v0-from-ui-generation-to-code-creation.
---

## v0 Prompt Creation Command File

### Purpose
Generate a high-quality, actionable v0 prompt for UI and code creation, maximizing outputs by following Vercel's best practices and using the latest documentation and examples from Vercel's blog.

### Instructions
1. Review the latest best practices and examples from Vercel's blog: https://vercel.com/blog/maximizing-outputs-with-v0-from-ui-generation-to-code-creation
2. Always read and parse specs/{{feature}}/tasks.md to extract:
   - Feature requirements, user stories, and acceptance criteria
   - Entities, fields, and data structures (use these for all mock/example data)
   - Core tasks, endpoints, and integration notes
3. When crafting prompts and example code, dynamically use and reflect the actual data found in specs/{{feature}}/tasks.md:
   - Specify desired functionality for each component, referencing the extracted requirements
   - Use mock/example data that matches the entities and fields from tasks.md
   - State design preferences and styling (e.g., colors, fonts, layout) as described in tasks.md
   - List libraries and frameworks to use (e.g., Next.js, shadcn/ui, Tailwind)
   - Describe the context or use case for each component, as defined in tasks.md
   - Ensure all example code and UI features are tailored to the data model and user stories from tasks.md, not generic
4. Request modifications, improvements, or alternative implementations as needed
5. For third-party libraries, provide clear guidance and documentation links if not well-known
6. For data fetching, avoid sharing sensitive information; use mock data or public APIs for examples, matching the data model in tasks.md
7. For styling, specify font imports, color palettes, and visual adjustments
8. For 3D graphics, mention react-three-fiber and provide design intent
9. For Next.js integration, specify project structure, routing, and deployment requirements
10. For technical planning, request migration plans, architecture diagrams, or step-by-step breakdowns
11. Update this file with new prompt examples and best practices as Vercel releases updates
12. Provide a code breakdown and explain how the UI integrates with Next.js routing and data fetching, referencing the technical context from tasks.md.
13. All example code must be tailored to the actual data model and requirements found in specs/{{feature}}/tasks.md, not generic.
14. Parse specs/{{feature}}/tasks.md and use its entities, fields, and user stories to define all UI features and mock/example data.


### Example v0 Prompt

Generate a responsive dashboard UI for a Montessori Kindergarten School Management System using Next.js 15, shadcn/ui, and Tailwind CSS.

Requirements:
- Include a student list table with search and filter functionality, using mock data that directly matches the entities and fields defined in tasks.md.
- Use shadcn/ui components for all interactive elements, ensuring consistency with the design and interaction patterns specified in tasks.md.
- Style the dashboard with a soft pastel color palette and rounded corners for a friendly, accessible look, as described in tasks.md if available.
- Add accessibility features to meet WCAG compliance, as outlined in the project specs and tasks.md.

---
_Last updated: 2025-09-18_