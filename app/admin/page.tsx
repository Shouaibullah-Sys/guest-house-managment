"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Header from "@/components/Header";
import QuestionCard from "@/components/QuestionCard";
import { Question } from "@/types/types";
import {
  approveQuestion,
  disapproveQuestion,
  getAllQuestionsWithAnswers,
  approveAnswer,
  disapproveAnswer,
} from "./actions";

export default function AdminPage() {
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    const questions = await getAllQuestionsWithAnswers();
    setQuestions(questions);
  };

  const onQuestionApproved = async (id: number) => {
    await approveQuestion(id);
    fetchQuestions();
  };

  const onQuestionDisapproved = async (id: number) => {
    await disapproveQuestion(id);
    fetchQuestions();
  };

  const onAnswerApproved = async (answerId: number) => {
    await approveAnswer(answerId);
    fetchQuestions();
  };

  const onAnswerDisapproved = async (answerId: number) => {
    await disapproveAnswer(answerId);
    fetchQuestions();
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="container mx-auto flex-grow p-4">
        <h1 className="mb-6 text-3xl font-bold">Admin Dashboard</h1>
        <div className="mb-4 flex justify-end gap-4">
          <Button variant="outline">
            <Link href="/laboratory">Laboratory Dashboard</Link>
          </Button>
          <Button>
            <Link href="/admin/users">Manage Users</Link>
          </Button>
        </div>
        <div className="space-y-4">
          {questions.map((question) => (
            <QuestionCard
              key={question.id}
              question={question}
              onQuestionApproved={onQuestionApproved}
              onQuestionDisapproved={onQuestionDisapproved}
              onAnswerApproved={onAnswerApproved}
              onAnswerDisapproved={onAnswerDisapproved}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
