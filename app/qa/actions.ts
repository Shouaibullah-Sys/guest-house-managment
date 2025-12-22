"use server";

import dbConnect from "@/lib/db";
import { Question } from "@/models/Question";
import { currentUser } from "@clerk/nextjs/server";

// Get approved questions with approved answers for patients
export async function getApprovedQuestionsWithAnswers() {
  try {
    // Connect to database
    await dbConnect();

    // Only get approved questions with approved answers
    const approvedQuestions = await Question.find({ approved: true })
      .sort({ createdAt: -1 })
      .lean();

    const questionsWithAnswers = approvedQuestions.map((question: any) => ({
      ...question,
      id: question._id,
      answers:
        question.answers
          ?.filter((answer: any) => answer.approved)
          ?.map((answer: any) => ({
            ...answer,
            id: answer._id,
          })) || [],
    }));

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

    // Connect to database
    await dbConnect();

    const newQuestion = new Question({
      quiz: questionData.quiz,
      approved: false, // Patient questions need admin approval
      contributor: questionData.contributor,
      contributorId: questionData.contributorId,
      answers: [],
      createdAt: new Date(),
    });

    await newQuestion.save();

    return { success: true };
  } catch (error) {
    console.error("Error submitting question:", error);
    throw new Error("Failed to submit question");
  }
}
