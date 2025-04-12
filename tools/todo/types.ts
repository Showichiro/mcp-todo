export type Todo = {
  id: string;
  completed: boolean;
  completedAt?: Date;
  createdAt: Date;
  priority?: Priority;
  description: string;
  projects: string[];
  contexts: string[];
  tags: Record<string, string>;
};

export const priorities = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
] as const;
export type Priority = (typeof priorities)[number];
