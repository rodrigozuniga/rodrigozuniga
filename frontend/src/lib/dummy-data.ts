import { ColumnData } from "./types";

export const initialColumns: ColumnData[] = [
  {
    id: "backlog",
    title: "Backlog",
    cards: [
      {
        id: "card-1",
        title: "Define product roadmap",
        details: "Outline the major milestones for the next two quarters.",
      },
      {
        id: "card-2",
        title: "Research competitor tools",
        details: "Compare feature sets and pricing of similar Kanban apps.",
      },
      {
        id: "card-3",
        title: "Set up analytics",
        details: "Decide on an analytics provider and add tracking.",
      },
    ],
  },
  {
    id: "todo",
    title: "To Do",
    cards: [
      {
        id: "card-4",
        title: "Design board layout",
        details: "Sketch the column and card layout in Figma.",
      },
      {
        id: "card-5",
        title: "Write onboarding copy",
        details: "Draft the welcome message shown to new users.",
      },
    ],
  },
  {
    id: "in-progress",
    title: "In Progress",
    cards: [
      {
        id: "card-6",
        title: "Build drag and drop",
        details: "Wire up card dragging between columns.",
      },
      {
        id: "card-7",
        title: "Implement card details",
        details: "Add title and details fields to the card component.",
      },
    ],
  },
  {
    id: "review",
    title: "Review",
    cards: [
      {
        id: "card-8",
        title: "Accessibility pass",
        details: "Check keyboard navigation and color contrast.",
      },
    ],
  },
  {
    id: "done",
    title: "Done",
    cards: [
      {
        id: "card-9",
        title: "Project kickoff",
        details: "Align the team on scope and timeline.",
      },
      {
        id: "card-10",
        title: "Choose tech stack",
        details: "Settled on Next.js with client-side rendering.",
      },
    ],
  },
];
