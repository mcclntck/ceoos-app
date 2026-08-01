/* Ported verbatim from design_handoff_ceoos_pilot_app/design/ceoos-data.jsx */
import type { Department, Article, Plan, Conversation, DeptId } from './types'

export const CEOOS_USER = { name: 'Sam', initials: 'SJ' }

export const CEOOS_DEPARTMENTS: Department[] = [
  {
    id: 'career',
    label: 'Career',
    head: 'Head of Career',
    glow: 'teal',
    angle: -90,
    coach:
      "Take a moment now. Not to log your title or your last raise—but to actually sit with where things stand: your growth, your relationships, and whether the direction you're on is still the one you want. If you don't do this thinking, who will?",
    questions: [
      { q: "Let's see where you're at. Give yourself a score out of 10 for this Dept — honest, not generous." },
      { q: 'What could you do easily to move that score up, or hold it where it is?' },
      { q: 'How important is it to you to run this Dept well — or at least a little better than now?' },
      { q: "What's working for you in this Dept right now?" },
      { q: "And what's not working?" },
      {
        q: 'What could you start doing that would create incredible benefit here? Or is there something that, if you stopped, would make an even bigger impact?',
      },
    ],
    actions: ['Book a 20-min career chat with my manager', 'Block 90 minutes of deep-focus time', 'Write down the one skill I will practise'],
  },
  {
    id: 'health',
    label: 'Health',
    head: 'Head of Health',
    glow: 'emerald',
    angle: -18,
    coach:
      "This isn't just about logging your steps and Pilates sessions. This is the whole scorecard—physical health, mental health, sleep, nutrition, movement, your relationship with stress, with rest, with alcohol, and anything else that touches the health of your human.",
    questions: [
      { q: "Let's see where you're at. Give yourself a score out of 10 for this Dept — honest, not generous." },
      { q: 'What could you do easily to move that score up, or hold it where it is?' },
      { q: 'How important is it to you to run this Dept well — or at least a little better than now?' },
      { q: "What's working for you in this Dept right now?" },
      { q: "And what's not working?" },
      {
        q: 'What could you start doing that would create incredible benefit here? Or is there something that, if you stopped, would make an even bigger impact?',
      },
    ],
    actions: ['Set a wind-down reminder 30 min before bed', 'Schedule three 20-min walks this week', 'Plan one screen-free evening'],
  },
  {
    id: 'wealth',
    label: 'Wealth',
    head: 'Head of Wealth',
    glow: 'cool',
    angle: 54,
    coach:
      'Career is how you make money. Wealth is what you do with it. And most of us never chose our relationship with money — we inherited it.',
    questions: [
      { q: "Let's see where you're at. Give yourself a score out of 10 for this Dept — honest, not generous." },
      { q: 'What could you do easily to move that score up, or hold it where it is?' },
      { q: 'How important is it to you to run this Dept well — or at least a little better than now?' },
      { q: "What's working for you in this Dept right now?" },
      { q: "And what's not working?" },
      {
        q: 'What could you start doing that would create incredible benefit here? Or is there something that, if you stopped, would make an even bigger impact?',
      },
    ],
    actions: ['Book 30 min to review my spending', 'Set up one automatic transfer to savings', 'Read one article on a money topic I avoid'],
  },
  {
    id: 'fun',
    label: 'Fun',
    head: 'Head of Fun',
    glow: 'violet',
    angle: 126,
    coach:
      "Head of Fun is arguably the greatest job title you could hold — and it gets the least time, attention and resources. Fun isn't the reward for hard work—it's the fuel for it.",
    questions: [
      { q: "Let's see where you're at. Give yourself a score out of 10 for this Dept — honest, not generous." },
      { q: 'What could you do easily to move that score up, or hold it where it is?' },
      { q: 'How important is it to you to run this Dept well — or at least a little better than now?' },
      { q: "What's working for you in this Dept right now?" },
      { q: "And what's not working?" },
      {
        q: 'What could you start doing that would create incredible benefit here? Or is there something that, if you stopped, would make an even bigger impact?',
      },
    ],
    actions: ['Schedule one hour this week just for play', 'Text a friend to plan something fun', 'Try one thing you loved as a kid'],
  },
  {
    id: 'love',
    label: 'Love & Family',
    head: 'Head of Love, Family & Connection',
    glow: 'warm',
    angle: 198,
    coach:
      'This department is about connection. Who do you want a relationship with that you’re not paid to have? Partners, children, siblings, extended family, friends.',
    questions: [
      { q: "Let's see where you're at. Give yourself a score out of 10 for this Dept — honest, not generous." },
      { q: 'What could you do easily to move that score up, or hold it where it is?' },
      { q: 'How important is it to you to run this Dept well — or at least a little better than now?' },
      { q: "What's working for you in this Dept right now?" },
      { q: "And what's not working?" },
      {
        q: 'What could you start doing that would create incredible benefit here? Or is there something that, if you stopped, would make an even bigger impact?',
      },
    ],
    actions: [
      'Plan a device-free dinner with someone I love',
      "Call someone I've been meaning to reach",
      'Write a short note of appreciation',
    ],
  },
]

export const CEOOS_MOODS = ['Drained', 'Low', 'Steady', 'Good', 'Energised'] as const

export const CEOOS_SEED_PLANS: Plan[] = [
  { deptId: 'health', action: 'Schedule three 20-min walks this week', dayLabel: 'Today', timeLabel: 'Morning · 8:00', done: false, mood: null },
  {
    deptId: 'love',
    action: 'Plan a device-free dinner with someone I love',
    dayLabel: 'Tomorrow',
    timeLabel: 'Evening · 6:30',
    done: false,
    mood: null,
  },
]

export const CEOOS_SEED_CONVERSATIONS: Record<DeptId, Conversation[]> = {
  career: [
    {
      id: 'c-car-1',
      date: '18 July 2026',
      title: 'Current state audit',
      summary: 'Named unclear priorities as the main drag; committed to a focus block.',
      action: 'Block 90 minutes of deep-focus time',
      mood: 'Good',
    },
    {
      id: 'c-car-2',
      date: '2 July 2026',
      title: 'Career by design',
      summary: 'Sketched an ideal step-up role in 2–3 years and the value gap to close.',
      action: 'Book a 20-min career chat with my manager',
      mood: 'Energised',
    },
  ],
  health: [
    {
      id: 'c-hea-1',
      date: '15 July 2026',
      title: 'Energy & recovery',
      summary: 'Sleep is the first thing to slip when busy; set an earlier wind-down.',
      action: 'Set a wind-down reminder 30 min before bed',
      mood: 'Steady',
    },
  ],
  wealth: [
    {
      id: 'c-wea-1',
      date: '9 July 2026',
      title: 'Money & peace of mind',
      summary: 'Wanted more control over saving; automated a monthly transfer.',
      action: 'Set up one automatic transfer to savings',
      mood: 'Good',
    },
  ],
  fun: [],
  love: [
    {
      id: 'c-lov-1',
      date: '11 July 2026',
      title: 'Presence & connection',
      summary: 'Realised evenings are distracted; planned real time with family.',
      action: 'Plan a device-free dinner with someone I love',
      mood: 'Energised',
    },
  ],
}

/* CEOOS_ARTICLES is ported for completeness (Home tab reference) but unused —
   the Home tab is not built per confirmed scope cuts (see build plan). */
export const CEOOS_ARTICLES: Article[] = [
  { id: 'a1', deptId: 'career', title: 'The one career conversation you keep avoiding', date: '13 March 2026', readTime: '6 min', author: 'Mariana Jones' },
  { id: 'a2', deptId: 'career', title: 'Designing the next three years on purpose', date: '10 April 2026', readTime: '5 min', author: 'Fabian Reyes' },
  { id: 'a3', deptId: 'health', title: 'The tank empties fastest when you’re busiest', date: '2 February 2026', readTime: '3 min', author: 'Dr. Lena Cho' },
  { id: 'a4', deptId: 'wealth', title: 'Peace of mind is a number you can plan for', date: '28 January 2026', readTime: '5 min', author: 'Marcus Bell' },
  { id: 'a5', deptId: 'fun', title: 'Play isn’t the reward — it’s the fuel', date: '19 May 2026', readTime: '3 min', author: 'Priya Nair' },
  { id: 'a6', deptId: 'love', title: 'Presence is the gift they feel first', date: '6 June 2026', readTime: '4 min', author: 'Tom Okafor' },
]

export function deptById(id: DeptId): Department | undefined {
  return CEOOS_DEPARTMENTS.find((d) => d.id === id)
}
