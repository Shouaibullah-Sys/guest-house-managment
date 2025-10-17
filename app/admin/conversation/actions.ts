// app/conversation/actions.ts
"use server";

import { db } from "@/db";
import { questions, answers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";

// Get all questions with answers for admin
export async function getAllQuestionsWithAnswers() {
  try {
    const allQuestions = await db
      .select()
      .from(questions)
      .orderBy(questions.timestamp);

    const questionsWithAnswers = await Promise.all(
      allQuestions.map(async (question) => {
        const questionAnswers = await db
          .select()
          .from(answers)
          .where(eq(answers.questionId, question.id!))
          .orderBy(answers.timestamp);

        return {
          ...question,
          timestamp: question.timestamp?.toISOString(),
          answers: questionAnswers.map((answer) => ({
            ...answer,
            timestamp: answer.timestamp?.toISOString(),
          })),
        };
      })
    );

    return questionsWithAnswers;
  } catch (error) {
    console.error("Error fetching questions with answers:", error);
    throw new Error("Failed to fetch questions");
  }
}

export async function approveQuestion(id: number) {
  try {
    await db
      .update(questions)
      .set({ approved: true })
      .where(eq(questions.id, id));
  } catch (error) {
    console.error("Error approving question:", error);
    throw new Error("Failed to approve question");
  }
}

export async function deleteQuestion(id: number) {
  try {
    // First delete all answers associated with the question
    await db.delete(answers).where(eq(answers.questionId, id));
    // Then delete the question
    await db.delete(questions).where(eq(questions.id, id));
  } catch (error) {
    console.error("Error deleting question:", error);
    throw new Error("Failed to delete question");
  }
}

export async function approveAnswer(answerId: number) {
  try {
    await db
      .update(answers)
      .set({ approved: true })
      .where(eq(answers.id, answerId));
  } catch (error) {
    console.error("Error approving answer:", error);
    throw new Error("Failed to approve answer");
  }
}

export async function deleteAnswer(answerId: number) {
  try {
    await db.delete(answers).where(eq(answers.id, answerId));
  } catch (error) {
    console.error("Error deleting answer:", error);
    throw new Error("Failed to delete answer");
  }
}

// Submit answer (from admin - auto-approved)
export async function submitAnswer(answerData: {
  ans: string;
  questionId: number;
  contributor: string;
  contributorId: string;
}) {
  try {
    const user = await currentUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const userRole = user.publicMetadata?.role as string;
    const isAdminOrLab = userRole === "admin" || userRole === "laboratory";

    await db.insert(answers).values({
      ...answerData,
      approved: isAdminOrLab, // Auto-approve admin answers
    });

    return { success: true };
  } catch (error) {
    console.error("Error submitting answer:", error);
    throw new Error("Failed to submit answer");
  }
}
