// app/conversation/actions.ts
"use server";

import { db } from "@/db";
import { questions, answers } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getAllQuestionsWithAnswers() {
  const allQuestions = await db.select().from(questions);

  const questionsWithAnswers = await Promise.all(
    allQuestions.map(async (question) => {
      const questionAnswers = await db
        .select()
        .from(answers)
        .where(eq(answers.questionId, question.id!));

      return {
        ...question,
        answers: questionAnswers,
      };
    })
  );

  return questionsWithAnswers;
}

export async function approveQuestion(id: number) {
  await db
    .update(questions)
    .set({ approved: true })
    .where(eq(questions.id, id));
}

export async function disapproveQuestion(id: number) {
  await db
    .update(questions)
    .set({ approved: false })
    .where(eq(questions.id, id));
}

export async function approveAnswer(answerId: number) {
  await db
    .update(answers)
    .set({ approved: true })
    .where(eq(answers.id, answerId));
}

export async function disapproveAnswer(answerId: number) {
  await db
    .update(answers)
    .set({ approved: false })
    .where(eq(answers.id, answerId));
}

export async function submitQuestion(questionData: {
  quiz: string;
  contributor: string;
  contributorId: string;
}) {
  await db.insert(questions).values({
    ...questionData,
    approved: null, // Initially not approved
  });
}

export async function submitAnswer(answerData: {
  ans: string;
  questionId: number;
  contributor: string;
  contributorId: string;
}) {
  await db.insert(answers).values({
    ...answerData,
    approved: null, // Initially not approved
  });
}
