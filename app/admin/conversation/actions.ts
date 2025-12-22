// app/conversation/actions.ts
"use server";

import dbConnect from "@/lib/db";
import { Question } from "@/models/Question";
import { currentUser } from "@clerk/nextjs/server";

// Get all questions with answers for admin
export async function getAllQuestionsWithAnswers() {
  try {
    // Connect to database
    await dbConnect();

    const allQuestions = await Question.find({}).sort({ createdAt: -1 }).lean();

    return allQuestions.map((question) => ({
      ...question,
      id: question._id,
      timestamp: question.createdAt?.toISOString(),
      answers:
        question.answers?.map((answer: any) => ({
          ...answer,
          id: answer._id,
          timestamp: answer.createdAt?.toISOString(),
        })) || [],
    }));
  } catch (error) {
    console.error("Error fetching questions with answers:", error);
    throw new Error("Failed to fetch questions");
  }
}

export async function approveQuestion(questionId: string) {
  try {
    // Connect to database
    await dbConnect();

    await Question.findByIdAndUpdate(questionId, {
      $set: { approved: true },
    });
  } catch (error) {
    console.error("Error approving question:", error);
    throw new Error("Failed to approve question");
  }
}

export async function deleteQuestion(questionId: string) {
  try {
    // Connect to database
    await dbConnect();

    await Question.findByIdAndDelete(questionId);
  } catch (error) {
    console.error("Error deleting question:", error);
    throw new Error("Failed to delete question");
  }
}

export async function approveAnswer(questionId: string, answerIndex: number) {
  try {
    // Connect to database
    await dbConnect();

    const question = await Question.findById(questionId);
    if (!question || !question.answers[answerIndex]) {
      throw new Error("Question or answer not found");
    }

    question.answers[answerIndex].approved = true;
    await question.save();
  } catch (error) {
    console.error("Error approving answer:", error);
    throw new Error("Failed to approve answer");
  }
}

export async function deleteAnswer(questionId: string, answerIndex: number) {
  try {
    // Connect to database
    await dbConnect();

    const question = await Question.findById(questionId);
    if (!question) {
      throw new Error("Question not found");
    }

    question.answers.splice(answerIndex, 1);
    await question.save();
  } catch (error) {
    console.error("Error deleting answer:", error);
    throw new Error("Failed to delete answer");
  }
}

// Submit answer (from admin - auto-approved)
export async function submitAnswer(answerData: {
  ans: string;
  questionId: string;
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

    // Connect to database
    await dbConnect();

    const question = await Question.findById(answerData.questionId);
    if (!question) {
      throw new Error("Question not found");
    }

    question.answers.push({
      ans: answerData.ans,
      approved: isAdminOrLab, // Auto-approve admin answers
      contributor: answerData.contributor,
      contributorId: answerData.contributorId,
      createdAt: new Date(),
    });

    await question.save();

    return { success: true };
  } catch (error) {
    console.error("Error submitting answer:", error);
    throw new Error("Failed to submit answer");
  }
}
