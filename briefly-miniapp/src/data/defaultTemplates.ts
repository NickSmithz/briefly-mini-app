import type { ContentTemplate } from "../types";

export const defaultTemplates: ContentTemplate[] = [
  {
    format: "reels",
    label: "Reels",
    minimalTasks: [
      { title: "Подготовить reels: {title}", role: "reels_maker", dueOffsetDays: -1 },
      { title: "Проверить reels: {title}", role: "reviewer", dueOffsetDays: 0 },
      { title: "Опубликовать reels: {title}", role: "publisher", dueOffsetDays: 0 },
    ],
    fullTasks: [
      { title: "Подготовить сценарий: {title}", role: "copywriter", dueOffsetDays: -3 },
      { title: "Подготовить материалы для reels: {title}", role: "reels_maker", dueOffsetDays: -2 },
      { title: "Смонтировать reels: {title}", role: "reels_maker", dueOffsetDays: -1 },
      { title: "Сделать обложку: {title}", role: "designer", dueOffsetDays: -1 },
      { title: "Проверить reels: {title}", role: "reviewer", dueOffsetDays: 0 },
      { title: "Опубликовать reels: {title}", role: "publisher", dueOffsetDays: 0 },
    ],
  },
  {
    format: "stories",
    label: "Stories",
    minimalTasks: [
      { title: "Подготовить stories: {title}", role: "stories_maker", dueOffsetDays: -1 },
      { title: "Проверить stories: {title}", role: "reviewer", dueOffsetDays: 0 },
      { title: "Опубликовать stories: {title}", role: "publisher", dueOffsetDays: 0 },
    ],
    fullTasks: [
      { title: "Подготовить структуру stories: {title}", role: "copywriter", dueOffsetDays: -2 },
      { title: "Сделать макеты stories: {title}", role: "stories_maker", dueOffsetDays: -1 },
      { title: "Проверить stories: {title}", role: "reviewer", dueOffsetDays: 0 },
      { title: "Опубликовать stories: {title}", role: "publisher", dueOffsetDays: 0 },
    ],
  },
  {
    format: "post",
    label: "Пост",
    minimalTasks: [
      { title: "Подготовить пост: {title}", role: "copywriter", dueOffsetDays: -1 },
      { title: "Проверить пост: {title}", role: "reviewer", dueOffsetDays: 0 },
      { title: "Опубликовать пост: {title}", role: "publisher", dueOffsetDays: 0 },
    ],
    fullTasks: [
      { title: "Написать текст поста: {title}", role: "copywriter", dueOffsetDays: -2 },
      { title: "Подготовить визуал: {title}", role: "designer", dueOffsetDays: -1 },
      { title: "Проверить пост: {title}", role: "reviewer", dueOffsetDays: 0 },
      { title: "Опубликовать пост: {title}", role: "publisher", dueOffsetDays: 0 },
    ],
  },
  {
    format: "carousel",
    label: "Карусель",
    minimalTasks: [
      { title: "Подготовить карусель: {title}", role: "designer", dueOffsetDays: -1 },
      { title: "Проверить карусель: {title}", role: "reviewer", dueOffsetDays: 0 },
      { title: "Опубликовать карусель: {title}", role: "publisher", dueOffsetDays: 0 },
    ],
    fullTasks: [
      { title: "Подготовить структуру карусели: {title}", role: "copywriter", dueOffsetDays: -3 },
      { title: "Написать текст карусели: {title}", role: "copywriter", dueOffsetDays: -2 },
      { title: "Сделать дизайн карусели: {title}", role: "designer", dueOffsetDays: -1 },
      { title: "Проверить карусель: {title}", role: "reviewer", dueOffsetDays: 0 },
      { title: "Опубликовать карусель: {title}", role: "publisher", dueOffsetDays: 0 },
    ],
  },
  {
    format: "video",
    label: "Видео",
    minimalTasks: [
      { title: "Подготовить видео: {title}", role: "reels_maker", dueOffsetDays: -1 },
      { title: "Проверить видео: {title}", role: "reviewer", dueOffsetDays: 0 },
      { title: "Опубликовать видео: {title}", role: "publisher", dueOffsetDays: 0 },
    ],
    fullTasks: [
      { title: "Подготовить сценарий видео: {title}", role: "copywriter", dueOffsetDays: -3 },
      { title: "Собрать материалы для видео: {title}", role: "reels_maker", dueOffsetDays: -2 },
      { title: "Смонтировать видео: {title}", role: "reels_maker", dueOffsetDays: -1 },
      { title: "Проверить видео: {title}", role: "reviewer", dueOffsetDays: 0 },
      { title: "Опубликовать видео: {title}", role: "publisher", dueOffsetDays: 0 },
    ],
  },
  {
    format: "article",
    label: "Статья",
    minimalTasks: [
      { title: "Написать статью: {title}", role: "copywriter", dueOffsetDays: -2 },
      { title: "Проверить статью: {title}", role: "reviewer", dueOffsetDays: 0 },
      { title: "Опубликовать статью: {title}", role: "publisher", dueOffsetDays: 0 },
    ],
    fullTasks: [
      { title: "Собрать тезисы статьи: {title}", role: "copywriter", dueOffsetDays: -4 },
      { title: "Написать статью: {title}", role: "copywriter", dueOffsetDays: -2 },
      { title: "Подготовить обложку статьи: {title}", role: "designer", dueOffsetDays: -1 },
      { title: "Проверить статью: {title}", role: "reviewer", dueOffsetDays: 0 },
      { title: "Опубликовать статью: {title}", role: "publisher", dueOffsetDays: 0 },
    ],
  },
  {
    format: "other",
    label: "Другое",
    minimalTasks: [
      { title: "Подготовить материал: {title}", role: "project_manager", dueOffsetDays: -1 },
      { title: "Проверить материал: {title}", role: "reviewer", dueOffsetDays: 0 },
    ],
    fullTasks: [
      { title: "Уточнить формат материала: {title}", role: "project_manager", dueOffsetDays: -2 },
      { title: "Подготовить материал: {title}", role: "project_manager", dueOffsetDays: -1 },
      { title: "Проверить материал: {title}", role: "reviewer", dueOffsetDays: 0 },
    ],
  },
];
