"use server";

import { db } from "@/db";
import { questions, answers } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";

// Get approved questions with approved answers for patients
export async function getApprovedQuestionsWithAnswers() {
  try {
    // Only get approved questions
    const approvedQuestions = await db
      .select()
      .from(questions)
      .where(eq(questions.approved, true))
      .orderBy(questions.timestamp);

    const questionsWithAnswers = await Promise.all(
      approvedQuestions.map(async (question) => {
        // Only get approved answers
        const questionAnswers = await db
          .select()
          .from(answers)
          .where(
            and(
              eq(answers.questionId, question.id!),
              eq(answers.approved, true)
            )
          )
          .orderBy(answers.timestamp);

        return {
          ...question,
          answers: questionAnswers,
        };
      })
    );

    return questionsWithAnswers;
  } catch (error) {
    console.error("Error fetching approved questions with answers:", error);
    throw new Error("Failed to fetch questions");
  }
}

// Submit a new question (from patient)
export async function submitQuestion(questionData: {
  quiz: string;
  contributor: string;
  contributorId: string;
}) {
  try {
    const user = await currentUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    await db.insert(questions).values({
      ...questionData,
      approved: false, // Patient questions need admin approval
    });

    return { success: true };
  } catch (error) {
    console.error("Error submitting question:", error);
    throw new Error("Failed to submit question");
  }
}
